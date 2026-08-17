package com.applymate.backend.application.jobimport;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.IDN;
import java.net.Inet4Address;
import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.HttpURLConnection;
import java.net.Proxy;
import java.net.SocketTimeoutException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.net.URLConnection;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.zip.GZIPInputStream;
import java.util.zip.Inflater;
import java.util.zip.InflaterInputStream;
import java.util.zip.ZipException;

import static com.applymate.backend.application.jobimport.JobImportException.Reason.INVALID_URL;
import static com.applymate.backend.application.jobimport.JobImportException.Reason.RESPONSE_TOO_LARGE;
import static com.applymate.backend.application.jobimport.JobImportException.Reason.TIMEOUT;
import static com.applymate.backend.application.jobimport.JobImportException.Reason.TOO_MANY_REDIRECTS;
import static com.applymate.backend.application.jobimport.JobImportException.Reason.UNAVAILABLE;
import static com.applymate.backend.application.jobimport.JobImportException.Reason.UNSAFE_URL;
import static com.applymate.backend.application.jobimport.JobImportException.Reason.UNSUPPORTED_CONTENT;
import static com.applymate.backend.application.jobimport.JobImportException.Reason.UNSUPPORTED_SITE;

import org.springframework.stereotype.Component;

@Component
public class SafeJobPageFetcher {

    static final int MAX_URL_LENGTH = 2000;
    static final int MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
    static final int MAX_REDIRECTS = 3;
    static final int CONNECT_TIMEOUT_MILLIS = 4_000;
    static final int READ_TIMEOUT_MILLIS = 8_000;

    private static final int BUFFER_SIZE = 8 * 1024;

    private static final Set<String> DENIED_DOMAINS = Set.of(
            "linkedin.com",
            "indeed.com"
    );

    private static final Set<String> DENIED_HOSTS = Set.of(
            "localhost",
            "metadata.google.internal"
    );

    private final DnsResolver dnsResolver;
    private final HttpTransport httpTransport;

    public SafeJobPageFetcher() {
        this(
                InetAddress::getAllByName,
                new JdkHttpTransport()
        );
    }

    SafeJobPageFetcher(DnsResolver dnsResolver) {
        this(
                dnsResolver,
                new JdkHttpTransport()
        );
    }

    SafeJobPageFetcher(
            DnsResolver dnsResolver,
            HttpTransport httpTransport
    ) {
        this.dnsResolver = Objects.requireNonNull(dnsResolver);
        this.httpTransport = Objects.requireNonNull(httpTransport);
    }

    FetchedPage fetch(String submittedUrl) {
        ValidatedUrl current =
                validateForImport(submittedUrl);

        int redirectCount = 0;

        while (true) {
            try (HttpFetchResponse response =
                         httpTransport.get(current.uri())) {

                int status = response.statusCode();

                if (isRedirect(status)) {
                    if (redirectCount >= MAX_REDIRECTS) {
                        throw new JobImportException(
                                TOO_MANY_REDIRECTS
                        );
                    }

                    String location =
                            response.firstHeader("Location");

                    if (location == null
                            || location.isBlank()) {
                        throw new JobImportException(
                                UNAVAILABLE
                        );
                    }

                    URI redirected;

                    try {
                        redirected = current.uri()
                                .resolve(location);
                    } catch (IllegalArgumentException exception) {
                        throw new JobImportException(
                                UNAVAILABLE
                        );
                    }

                    current = validateForImport(
                            redirected.toString()
                    );

                    redirectCount++;
                    continue;
                }

                if (status < 200 || status >= 300) {
                    throw new JobImportException(
                            UNAVAILABLE
                    );
                }

                validateContentType(response);
                validateDeclaredLength(response);

                byte[] rawBody = readLimited(
                        response.body(),
                        MAX_RESPONSE_BYTES
                );

                byte[] decodedBody =
                        decodeBody(
                                rawBody,
                                response.firstHeader(
                                        "Content-Encoding"
                                )
                        );

                Charset charset =
                        charsetFromContentType(
                                response.firstHeader(
                                        "Content-Type"
                                )
                        );

                return new FetchedPage(
                        current.uri(),
                        current.host(),
                        new String(
                                decodedBody,
                                charset
                        )
                );

            } catch (SocketTimeoutException exception) {
                throw new JobImportException(TIMEOUT);
            } catch (ResponseTooLargeIOException exception) {
                throw new JobImportException(
                        RESPONSE_TOO_LARGE
                );
            } catch (JobImportException exception) {
                throw exception;
            } catch (IOException exception) {
                throw new JobImportException(
                        UNAVAILABLE
                );
            }
        }
    }

    ValidatedUrl validateForImport(String submittedUrl) {
        if (submittedUrl == null
                || submittedUrl.isBlank()
                || submittedUrl.length() > MAX_URL_LENGTH) {
            throw new JobImportException(INVALID_URL);
        }

        URI uri;

        try {
            uri = new URI(submittedUrl.trim());
        } catch (URISyntaxException exception) {
            throw new JobImportException(INVALID_URL);
        }

        String scheme = uri.getScheme();

        if (scheme == null) {
            throw new JobImportException(INVALID_URL);
        }

        scheme = scheme.toLowerCase(Locale.ROOT);

        if (!scheme.equals("http")
                && !scheme.equals("https")) {
            throw new JobImportException(INVALID_URL);
        }

        String authority = uri.getRawAuthority();

        if (authority == null || authority.isBlank()) {
            throw new JobImportException(INVALID_URL);
        }

        if (uri.getRawUserInfo() != null
                || authority.contains("@")) {
            throw new JobImportException(UNSAFE_URL);
        }

        HostPort hostPort = parseHostPort(authority);

        String host = canonicalizeHost(
                hostPort.host()
        );

        if (matchesAny(host, DENIED_HOSTS)) {
            throw new JobImportException(UNSAFE_URL);
        }

        if (matchesAny(host, DENIED_DOMAINS)) {
            throw new JobImportException(UNSUPPORTED_SITE);
        }

        validateResolvedAddresses(host);

        return new ValidatedUrl(
                buildCanonicalUri(
                        uri,
                        scheme,
                        host,
                        hostPort.port()
                ),
                host
        );
    }

    private void validateContentType(
            HttpFetchResponse response
    ) {
        String contentType =
                response.firstHeader("Content-Type");

        if (contentType == null) {
            throw new JobImportException(
                    UNSUPPORTED_CONTENT
            );
        }

        String mediaType = contentType
                .split(";", 2)[0]
                .trim()
                .toLowerCase(Locale.ROOT);

        if (!mediaType.equals("text/html")
                && !mediaType.equals(
                        "application/xhtml+xml"
                )) {
            throw new JobImportException(
                    UNSUPPORTED_CONTENT
            );
        }
    }

    private void validateDeclaredLength(
            HttpFetchResponse response
    ) {
        String value =
                response.firstHeader("Content-Length");

        if (value == null || value.isBlank()) {
            return;
        }

        try {
            long declaredLength =
                    Long.parseLong(value.trim());

            if (declaredLength
                    > MAX_RESPONSE_BYTES) {
                throw new JobImportException(
                        RESPONSE_TOO_LARGE
                );
            }
        } catch (NumberFormatException ignored) {
            /*
             * Do not trust malformed Content-Length.
             * The streaming limit remains authoritative.
             */
        }
    }

    private byte[] decodeBody(
            byte[] rawBody,
            String contentEncoding
    ) throws IOException {
        if (contentEncoding == null
                || contentEncoding.isBlank()
                || contentEncoding.equalsIgnoreCase(
                        "identity"
                )) {
            return rawBody;
        }

        String encoding = contentEncoding
                .trim()
                .toLowerCase(Locale.ROOT);

        return switch (encoding) {
            case "gzip", "x-gzip" ->
                    readLimited(
                            new GZIPInputStream(
                                    new ByteArrayInputStream(
                                            rawBody
                                    )
                            ),
                            MAX_RESPONSE_BYTES
                    );

            case "deflate" ->
                    inflate(rawBody);

            default ->
                    throw new JobImportException(
                            UNSUPPORTED_CONTENT
                    );
        };
    }

    private byte[] inflate(byte[] rawBody)
            throws IOException {
        try {
            return inflate(
                    rawBody,
                    false
            );
        } catch (ZipException exception) {
            return inflate(
                    rawBody,
                    true
            );
        }
    }

    private byte[] inflate(
            byte[] rawBody,
            boolean nowrap
    ) throws IOException {
        Inflater inflater =
                new Inflater(nowrap);

        try (InputStream input =
                     new InflaterInputStream(
                             new ByteArrayInputStream(
                                     rawBody
                             ),
                             inflater
                     )) {

            return readLimited(
                    input,
                    MAX_RESPONSE_BYTES
            );
        } finally {
            inflater.end();
        }
    }

    private byte[] readLimited(
            InputStream input,
            int limit
    ) throws IOException {
        try (InputStream source = input;
             ByteArrayOutputStream output =
                     new ByteArrayOutputStream()) {

            byte[] buffer =
                    new byte[BUFFER_SIZE];

            int total = 0;
            int read;

            while ((read = source.read(buffer)) != -1) {
                total += read;

                if (total > limit) {
                    throw new ResponseTooLargeIOException();
                }

                output.write(
                        buffer,
                        0,
                        read
                );
            }

            return output.toByteArray();
        }
    }

    private Charset charsetFromContentType(
            String contentType
    ) {
        if (contentType == null) {
            return StandardCharsets.UTF_8;
        }

        for (String part : contentType.split(";")) {
            String trimmed = part.trim();

            if (!trimmed
                    .toLowerCase(Locale.ROOT)
                    .startsWith("charset=")) {
                continue;
            }

            String name = trimmed.substring(
                    "charset=".length()
            ).trim();

            if (name.startsWith("\"")
                    && name.endsWith("\"")
                    && name.length() > 1) {
                name = name.substring(
                        1,
                        name.length() - 1
                );
            }

            try {
                return Charset.forName(name);
            } catch (Exception ignored) {
                return StandardCharsets.UTF_8;
            }
        }

        return StandardCharsets.UTF_8;
    }

    private boolean isRedirect(int status) {
        return status == 301
                || status == 302
                || status == 303
                || status == 307
                || status == 308;
    }

    private HostPort parseHostPort(String authority) {
        if (authority.startsWith("[")) {
            int closingBracket = authority.indexOf(']');

            if (closingBracket <= 1) {
                throw new JobImportException(INVALID_URL);
            }

            String host = authority.substring(
                    1,
                    closingBracket
            );

            String remainder = authority.substring(
                    closingBracket + 1
            );

            return new HostPort(
                    host,
                    parsePort(remainder)
            );
        }

        long colonCount = authority.chars()
                .filter(character -> character == ':')
                .count();

        if (colonCount > 1) {
            throw new JobImportException(INVALID_URL);
        }

        if (colonCount == 1) {
            int colon = authority.lastIndexOf(':');

            return new HostPort(
                    authority.substring(0, colon),
                    parsePort(
                            authority.substring(colon)
                    )
            );
        }

        return new HostPort(
                authority,
                -1
        );
    }

    private int parsePort(String remainder) {
        if (remainder.isEmpty()) {
            return -1;
        }

        if (!remainder.startsWith(":")
                || remainder.length() == 1) {
            throw new JobImportException(INVALID_URL);
        }

        try {
            int port = Integer.parseInt(
                    remainder.substring(1)
            );

            if (port < 1 || port > 65535) {
                throw new JobImportException(INVALID_URL);
            }

            return port;
        } catch (NumberFormatException exception) {
            throw new JobImportException(INVALID_URL);
        }
    }

    private String canonicalizeHost(String host) {
        if (host == null || host.isBlank()) {
            throw new JobImportException(INVALID_URL);
        }

        String canonical = host
                .trim()
                .toLowerCase(Locale.ROOT);

        while (canonical.endsWith(".")) {
            canonical = canonical.substring(
                    0,
                    canonical.length() - 1
            );
        }

        if (canonical.isBlank()
                || canonical.contains("%")) {
            throw new JobImportException(INVALID_URL);
        }

        if (canonical.contains(":")) {
            return canonical;
        }

        try {
            canonical = IDN.toASCII(
                    canonical,
                    IDN.USE_STD3_ASCII_RULES
            ).toLowerCase(Locale.ROOT);
        } catch (IllegalArgumentException exception) {
            throw new JobImportException(INVALID_URL);
        }

        if (canonical.isBlank()
                || canonical.length() > 253) {
            throw new JobImportException(INVALID_URL);
        }

        return canonical;
    }

    private boolean matchesAny(
            String host,
            Set<String> domains
    ) {
        return domains.stream()
                .anyMatch(domain ->
                        host.equals(domain)
                                || host.endsWith(
                                        "." + domain
                                )
                );
    }

    private void validateResolvedAddresses(
            String host
    ) {
        InetAddress[] addresses;

        try {
            addresses = dnsResolver.resolve(host);
        } catch (UnknownHostException exception) {
            throw new JobImportException(UNAVAILABLE);
        }

        if (addresses == null
                || addresses.length == 0) {
            throw new JobImportException(UNAVAILABLE);
        }

        for (InetAddress address : addresses) {
            if (isUnsafeAddress(address)) {
                throw new JobImportException(UNSAFE_URL);
            }
        }
    }

    private boolean isUnsafeAddress(
            InetAddress address
    ) {
        if (address == null) {
            return true;
        }

        if (address.isAnyLocalAddress()
                || address.isLoopbackAddress()
                || address.isLinkLocalAddress()
                || address.isSiteLocalAddress()
                || address.isMulticastAddress()) {
            return true;
        }

        byte[] bytes = address.getAddress();

        if (address instanceof Inet4Address) {
            return isUnsafeIpv4(bytes);
        }

        if (address instanceof Inet6Address) {
            return isUnsafeIpv6(bytes);
        }

        return true;
    }

    private boolean isUnsafeIpv4(byte[] bytes) {
        int a = unsigned(bytes[0]);
        int b = unsigned(bytes[1]);
        int c = unsigned(bytes[2]);
        int d = unsigned(bytes[3]);

        return a == 0
                || a == 10
                || a == 127
                || a >= 224
                || (a == 100
                && b >= 64
                && b <= 127)
                || (a == 169 && b == 254)
                || (a == 172
                && b >= 16
                && b <= 31)
                || (a == 192 && b == 168)
                || (a == 192
                && b == 0
                && (c == 0 || c == 2))
                || (a == 192
                && b == 88
                && c == 99)
                || (a == 198
                && (b == 18 || b == 19))
                || (a == 198
                && b == 51
                && c == 100)
                || (a == 203
                && b == 0
                && c == 113)
                || (a == 168
                && b == 63
                && c == 129
                && d == 16);
    }

    private boolean isUnsafeIpv6(byte[] bytes) {
        int first = unsigned(bytes[0]);
        int second = unsigned(bytes[1]);

        if ((first & 0xfe) == 0xfc) {
            return true;
        }

        if (first == 0x20
                && second == 0x01
                && unsigned(bytes[2]) == 0x0d
                && unsigned(bytes[3]) == 0xb8) {
            return true;
        }

        byte[] embeddedIpv4 = embeddedIpv4(bytes);

        return embeddedIpv4 != null
                && isUnsafeIpv4(embeddedIpv4);
    }

    private byte[] embeddedIpv4(byte[] bytes) {
        if (bytes.length != 16) {
            return null;
        }

        boolean firstTenZero = true;

        for (int index = 0; index < 10; index++) {
            if (bytes[index] != 0) {
                firstTenZero = false;
                break;
            }
        }

        if (firstTenZero
                && ((bytes[10] == (byte) 0xff
                && bytes[11] == (byte) 0xff)
                || (bytes[10] == 0
                && bytes[11] == 0))) {

            return Arrays.copyOfRange(
                    bytes,
                    12,
                    16
            );
        }

        if (unsigned(bytes[0]) == 0x00
                && unsigned(bytes[1]) == 0x64
                && unsigned(bytes[2]) == 0xff
                && unsigned(bytes[3]) == 0x9b
                && allZero(bytes, 4, 12)) {

            return Arrays.copyOfRange(
                    bytes,
                    12,
                    16
            );
        }

        if (unsigned(bytes[0]) == 0x20
                && unsigned(bytes[1]) == 0x02) {

            return Arrays.copyOfRange(
                    bytes,
                    2,
                    6
            );
        }

        return null;
    }

    private boolean allZero(
            byte[] bytes,
            int start,
            int end
    ) {
        for (int index = start;
             index < end;
             index++) {

            if (bytes[index] != 0) {
                return false;
            }
        }

        return true;
    }

    private int unsigned(byte value) {
        return value & 0xff;
    }

    private URI buildCanonicalUri(
            URI original,
            String scheme,
            String host,
            int port
    ) {
        StringBuilder value = new StringBuilder()
                .append(scheme)
                .append("://");

        if (host.contains(":")) {
            value.append('[')
                    .append(host)
                    .append(']');
        } else {
            value.append(host);
        }

        if (port != -1) {
            value.append(':')
                    .append(port);
        }

        if (original.getRawPath() != null) {
            value.append(
                    original.getRawPath()
            );
        }

        if (original.getRawQuery() != null) {
            value.append('?')
                    .append(
                            original.getRawQuery()
                    );
        }

        try {
            return new URI(value.toString());
        } catch (URISyntaxException exception) {
            throw new JobImportException(INVALID_URL);
        }
    }

    record ValidatedUrl(
            URI uri,
            String host
    ) {
    }

    record FetchedPage(
            URI finalUri,
            String host,
            String html
    ) {
    }

    private record HostPort(
            String host,
            int port
    ) {
    }

    @FunctionalInterface
    interface DnsResolver {

        InetAddress[] resolve(String host)
                throws UnknownHostException;
    }

    @FunctionalInterface
    interface HttpTransport {

        HttpFetchResponse get(URI uri)
                throws IOException;
    }

    static final class HttpFetchResponse
            implements AutoCloseable {

        private final int statusCode;
        private final Map<String, List<String>> headers;
        private final InputStream body;
        private final Runnable closeAction;

        HttpFetchResponse(
                int statusCode,
                Map<String, List<String>> headers,
                InputStream body,
                Runnable closeAction
        ) {
            this.statusCode = statusCode;
            this.headers = headers == null
                    ? Map.of()
                    : headers;
            this.body = body == null
                    ? InputStream.nullInputStream()
                    : body;
            this.closeAction = closeAction == null
                    ? () -> { }
                    : closeAction;
        }

        int statusCode() {
            return statusCode;
        }

        InputStream body() {
            return body;
        }

        String firstHeader(String name) {
            return headers.entrySet()
                    .stream()
                    .filter(entry ->
                            entry.getKey() != null
                                    && entry.getKey()
                                    .equalsIgnoreCase(name)
                    )
                    .flatMap(entry ->
                            entry.getValue()
                                    .stream()
                    )
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse(null);
        }

        @Override
        public void close() throws IOException {
            IOException failure = null;

            try {
                body.close();
            } catch (IOException exception) {
                failure = exception;
            }

            try {
                closeAction.run();
            } catch (RuntimeException exception) {
                if (failure == null) {
                    throw exception;
                }
            }

            if (failure != null) {
                throw failure;
            }
        }
    }

    private static final class JdkHttpTransport
            implements HttpTransport {

        @Override
        public HttpFetchResponse get(URI uri)
                throws IOException {

            URLConnection rawConnection =
                    uri.toURL()
                            .openConnection(
                                    Proxy.NO_PROXY
                            );

            if (!(rawConnection
                    instanceof HttpURLConnection connection)) {

                throw new IOException(
                        "Unsupported connection type"
                );
            }

            connection.setInstanceFollowRedirects(false);
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(
                    CONNECT_TIMEOUT_MILLIS
            );
            connection.setReadTimeout(
                    READ_TIMEOUT_MILLIS
            );
            connection.setUseCaches(false);
            connection.setDoInput(true);

            connection.setRequestProperty(
                    "Accept",
                    "text/html, application/xhtml+xml"
            );
            connection.setRequestProperty(
                    "Accept-Encoding",
                    "gzip, deflate"
            );
            connection.setRequestProperty(
                    "User-Agent",
                    "ApplyMate-JobImport/1.0"
            );

            int status =
                    connection.getResponseCode();

            InputStream body;

            if (status >= 200 && status < 300) {
                body = connection.getInputStream();
            } else {
                body = InputStream.nullInputStream();
            }

            return new HttpFetchResponse(
                    status,
                    connection.getHeaderFields(),
                    body,
                    connection::disconnect
            );
        }
    }

    private static final class
            ResponseTooLargeIOException
            extends IOException {
    }
}