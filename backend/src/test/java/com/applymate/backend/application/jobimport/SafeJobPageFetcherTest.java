package com.applymate.backend.application.jobimport;

import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.InetAddress;
import java.net.SocketTimeoutException;
import java.net.URI;
import java.net.UnknownHostException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import java.util.zip.DeflaterOutputStream;
import java.util.zip.GZIPOutputStream;

import static com.applymate.backend.application.jobimport.JobImportException.Reason.INVALID_URL;
import static com.applymate.backend.application.jobimport.JobImportException.Reason.RESPONSE_TOO_LARGE;
import static com.applymate.backend.application.jobimport.JobImportException.Reason.TIMEOUT;
import static com.applymate.backend.application.jobimport.JobImportException.Reason.TOO_MANY_REDIRECTS;
import static com.applymate.backend.application.jobimport.JobImportException.Reason.UNAVAILABLE;
import static com.applymate.backend.application.jobimport.JobImportException.Reason.UNSAFE_URL;
import static com.applymate.backend.application.jobimport.JobImportException.Reason.UNSUPPORTED_CONTENT;
import static com.applymate.backend.application.jobimport.JobImportException.Reason.UNSUPPORTED_SITE;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class SafeJobPageFetcherTest {

    private static final InetAddress PUBLIC_ADDRESS =
            address("93.184.216.34");

    private static final Map<String, List<String>>
            HTML_HEADERS = Map.of(
                    "Content-Type",
                    List.of("text/html; charset=UTF-8")
            );

    @Test
    void rejectsMalformedAndUnsupportedUrls() {
        for (String url : List.of(
                "not-a-url",
                "ftp://example.com/job",
                "https:///missing-host"
        )) {
            JobImportException exception = assertThrows(
                    JobImportException.class,
                    () -> publicFetcher()
                            .validateForImport(url)
            );

            assertEquals(
                    INVALID_URL,
                    exception.getReason()
            );
        }
    }

    @Test
    void rejectsUrlsContainingCredentials() {
        JobImportException exception = assertThrows(
                JobImportException.class,
                () -> publicFetcher()
                        .validateForImport(
                                "https://user:secret@example.com/job"
                        )
        );

        assertEquals(
                UNSAFE_URL,
                exception.getReason()
        );
    }

    @Test
    void rejectsLocalhostBeforeDnsLookup() {
        AtomicInteger dnsCalls =
                new AtomicInteger();

        SafeJobPageFetcher fetcher =
                new SafeJobPageFetcher(
                        host -> {
                            dnsCalls.incrementAndGet();

                            return new InetAddress[]{
                                    PUBLIC_ADDRESS
                            };
                        }
                );

        JobImportException exception = assertThrows(
                JobImportException.class,
                () -> fetcher.validateForImport(
                        "https://LOCALHOST./job"
                )
        );

        assertEquals(
                UNSAFE_URL,
                exception.getReason()
        );

        assertEquals(
                0,
                dnsCalls.get()
        );
    }

    @Test
    void rejectsPrivateLocalMetadataAndUnsafeIpv6Addresses() {
        List<String> unsafeAddresses = List.of(
                "127.0.0.1",
                "10.0.0.5",
                "172.16.1.5",
                "192.168.1.5",
                "169.254.169.254",
                "100.100.100.200",
                "168.63.129.16",
                "::1",
                "fc00::1",
                "fe80::1"
        );

        for (String value : unsafeAddresses) {
            SafeJobPageFetcher fetcher =
                    new SafeJobPageFetcher(
                            host -> new InetAddress[]{
                                    address(value)
                            }
                    );

            JobImportException exception =
                    assertThrows(
                            JobImportException.class,
                            () -> fetcher.validateForImport(
                                    "https://jobs.public-example.test/job"
                            ),
                            value
                    );

            assertEquals(
                    UNSAFE_URL,
                    exception.getReason(),
                    value
            );
        }
    }

    @Test
    void rejectsWhenAnyDnsAnswerIsUnsafe() {
        SafeJobPageFetcher fetcher =
                new SafeJobPageFetcher(
                        host -> new InetAddress[]{
                                PUBLIC_ADDRESS,
                                address("10.0.0.8")
                        }
                );

        JobImportException exception = assertThrows(
                JobImportException.class,
                () -> fetcher.validateForImport(
                        "https://jobs.example.com/job"
                )
        );

        assertEquals(
                UNSAFE_URL,
                exception.getReason()
        );
    }

    @Test
    void deniesLinkedInAndIndeedByDomainAndSubdomain() {
        for (String url : List.of(
                "https://linkedin.com/jobs/1",
                "https://jobs.linkedin.com/jobs/1",
                "https://indeed.com/viewjob?id=1",
                "https://uk.indeed.com/viewjob?id=1"
        )) {
            JobImportException exception =
                    assertThrows(
                            JobImportException.class,
                            () -> publicFetcher()
                                    .validateForImport(url)
                    );

            assertEquals(
                    UNSUPPORTED_SITE,
                    exception.getReason()
            );
        }
    }

    @Test
    void denyRulesDoNotUseSubstringMatching() {
        SafeJobPageFetcher.ValidatedUrl validated =
                publicFetcher().validateForImport(
                        "https://linkedin.com.evil-example.test/job"
                );

        assertEquals(
                "linkedin.com.evil-example.test",
                validated.host()
        );
    }

    @Test
    void canonicalizesCaseIdnAndTrailingDotBeforeChecks() {
        AtomicReference<String> resolvedHost =
                new AtomicReference<>();

        SafeJobPageFetcher fetcher =
                new SafeJobPageFetcher(
                        host -> {
                            resolvedHost.set(host);

                            return new InetAddress[]{
                                    PUBLIC_ADDRESS
                            };
                        }
                );

        SafeJobPageFetcher.ValidatedUrl validated =
                fetcher.validateForImport(
                        "https://B\u00dcCHER.example./jobs?id=1#ignored"
                );

        assertEquals(
                "xn--bcher-kva.example",
                resolvedHost.get()
        );

        assertEquals(
                "xn--bcher-kva.example",
                validated.host()
        );

        assertEquals(
                "https://xn--bcher-kva.example/jobs?id=1",
                validated.uri().toString()
        );
    }

    @Test
    void rejectsMetadataHostnameBeforeDnsLookup() {
        AtomicInteger dnsCalls =
                new AtomicInteger();

        SafeJobPageFetcher fetcher =
                new SafeJobPageFetcher(
                        host -> {
                            dnsCalls.incrementAndGet();

                            return new InetAddress[]{
                                    PUBLIC_ADDRESS
                            };
                        }
                );

        JobImportException exception = assertThrows(
                JobImportException.class,
                () -> fetcher.validateForImport(
                        "http://metadata.google.internal/computeMetadata/v1"
                )
        );

        assertEquals(
                UNSAFE_URL,
                exception.getReason()
        );

        assertEquals(
                0,
                dnsCalls.get()
        );
    }

    @Test
    void mapsDnsFailureToUnavailable() {
        SafeJobPageFetcher fetcher =
                new SafeJobPageFetcher(
                        host -> {
                            throw new UnknownHostException(
                                    host
                            );
                        }
                );

        JobImportException exception = assertThrows(
                JobImportException.class,
                () -> fetcher.validateForImport(
                        "https://missing.example/job"
                )
        );

        assertEquals(
                UNAVAILABLE,
                exception.getReason()
        );
    }

    @Test
    void fetchesPublicHtmlPage() {
        RecordingTransport transport =
                new RecordingTransport(
                        response(
                                200,
                                HTML_HEADERS,
                                "<html><body>Job</body></html>"
                        )
                );

        SafeJobPageFetcher.FetchedPage page =
                fetcher(transport).fetch(
                        "https://jobs.example.com/job#ignored"
                );

        assertEquals(
                "https://jobs.example.com/job",
                page.finalUri().toString()
        );
        assertEquals(
                "jobs.example.com",
                page.host()
        );
        assertEquals(
                "<html><body>Job</body></html>",
                page.html()
        );
        assertEquals(
                List.of(
                        URI.create(
                                "https://jobs.example.com/job"
                        )
                ),
                transport.requestedUris
        );
    }

    @Test
    void revalidatesRedirectDestinationAndBlocksPrivateTarget() {
        RecordingTransport transport =
                new RecordingTransport(
                        response(
                                302,
                                Map.of(
                                        "Location",
                                        List.of(
                                                "http://internal.example/admin"
                                        )
                                ),
                                ""
                        )
                );

        SafeJobPageFetcher fetcher =
                new SafeJobPageFetcher(
                        host -> {
                            if (host.equals(
                                    "internal.example"
                            )) {
                                return new InetAddress[]{
                                        address("10.0.0.5")
                                };
                            }

                            return new InetAddress[]{
                                    PUBLIC_ADDRESS
                            };
                        },
                        transport
                );

        JobImportException exception =
                assertThrows(
                        JobImportException.class,
                        () -> fetcher.fetch(
                                "https://jobs.example.com/job"
                        )
                );

        assertEquals(
                UNSAFE_URL,
                exception.getReason()
        );
        assertEquals(
                1,
                transport.requestedUris.size()
        );
    }

    @Test
    void rejectsMoreThanThreeRedirects() {
        RecordingTransport transport =
                new RecordingTransport(
                        redirect("/two"),
                        redirect("/three"),
                        redirect("/four"),
                        redirect("/five")
                );

        JobImportException exception =
                assertThrows(
                        JobImportException.class,
                        () -> fetcher(transport)
                                .fetch(
                                        "https://jobs.example.com/one"
                                )
                );

        assertEquals(
                TOO_MANY_REDIRECTS,
                exception.getReason()
        );
        assertEquals(
                4,
                transport.requestedUris.size()
        );
    }

    @Test
    void mapsNetworkTimeoutToTimeoutReason() {
        SafeJobPageFetcher.HttpTransport transport =
                uri -> {
                    throw new SocketTimeoutException(
                            "timed out"
                    );
                };

        JobImportException exception =
                assertThrows(
                        JobImportException.class,
                        () -> fetcher(transport)
                                .fetch(
                                        "https://jobs.example.com/job"
                                )
                );

        assertEquals(
                TIMEOUT,
                exception.getReason()
        );
    }

    @Test
    void rejectsUnsupportedContentType() {
        RecordingTransport transport =
                new RecordingTransport(
                        response(
                                200,
                                Map.of(
                                        "Content-Type",
                                        List.of(
                                                "application/json"
                                        )
                                ),
                                "{}"
                        )
                );

        JobImportException exception =
                assertThrows(
                        JobImportException.class,
                        () -> fetcher(transport)
                                .fetch(
                                        "https://jobs.example.com/job"
                                )
                );

        assertEquals(
                UNSUPPORTED_CONTENT,
                exception.getReason()
        );
    }

    @Test
    void rejectsOversizedDeclaredContentLength() {
        RecordingTransport transport =
                new RecordingTransport(
                        response(
                                200,
                                Map.of(
                                        "Content-Type",
                                        List.of("text/html"),
                                        "Content-Length",
                                        List.of(
                                                Integer.toString(
                                                        SafeJobPageFetcher.MAX_RESPONSE_BYTES
                                                                + 1
                                                )
                                        )
                                ),
                                "small"
                        )
                );

        JobImportException exception =
                assertThrows(
                        JobImportException.class,
                        () -> fetcher(transport)
                                .fetch(
                                        "https://jobs.example.com/job"
                                )
                );

        assertEquals(
                RESPONSE_TOO_LARGE,
                exception.getReason()
        );
    }

    @Test
    void enforcesResponseLimitWhileStreamingWithoutContentLength() {
        byte[] body =
                new byte[
                        SafeJobPageFetcher.MAX_RESPONSE_BYTES
                                + 1
                        ];

        RecordingTransport transport =
                new RecordingTransport(
                        response(
                                200,
                                HTML_HEADERS,
                                body
                        )
                );

        JobImportException exception =
                assertThrows(
                        JobImportException.class,
                        () -> fetcher(transport)
                                .fetch(
                                        "https://jobs.example.com/job"
                                )
                );

        assertEquals(
                RESPONSE_TOO_LARGE,
                exception.getReason()
        );
    }

    @Test
    void decodesGzipHtml() {
        String html =
                "<html><body>Compressed job</body></html>";

        RecordingTransport transport =
                new RecordingTransport(
                        response(
                                200,
                                Map.of(
                                        "Content-Type",
                                        List.of("text/html"),
                                        "Content-Encoding",
                                        List.of("gzip")
                                ),
                                gzip(html)
                        )
                );

        SafeJobPageFetcher.FetchedPage page =
                fetcher(transport).fetch(
                        "https://jobs.example.com/job"
                );

        assertEquals(
                html,
                page.html()
        );
    }

    @Test
    void rejectsGzipBodyThatExpandsBeyondLimit() {
        byte[] compressed =
                gzip(
                        "x".repeat(
                                SafeJobPageFetcher.MAX_RESPONSE_BYTES
                                        + 1
                        )
                );

        RecordingTransport transport =
                new RecordingTransport(
                        response(
                                200,
                                Map.of(
                                        "Content-Type",
                                        List.of("text/html"),
                                        "Content-Encoding",
                                        List.of("gzip")
                                ),
                                compressed
                        )
                );

        JobImportException exception =
                assertThrows(
                        JobImportException.class,
                        () -> fetcher(transport)
                                .fetch(
                                        "https://jobs.example.com/job"
                                )
                );

        assertEquals(
                RESPONSE_TOO_LARGE,
                exception.getReason()
        );
    }

    @Test
    void decodesDeflateHtml() {
        String html =
                "<html><body>Deflated job</body></html>";

        RecordingTransport transport =
                new RecordingTransport(
                        response(
                                200,
                                Map.of(
                                        "Content-Type",
                                        List.of("text/html"),
                                        "Content-Encoding",
                                        List.of("deflate")
                                ),
                                deflate(html)
                        )
                );

        SafeJobPageFetcher.FetchedPage page =
                fetcher(transport).fetch(
                        "https://jobs.example.com/job"
                );

        assertEquals(
                html,
                page.html()
        );
    }

    @Test
    void mapsNonSuccessStatusToUnavailable() {
        RecordingTransport transport =
                new RecordingTransport(
                        response(
                                503,
                                Map.of(),
                                ""
                        )
                );

        JobImportException exception =
                assertThrows(
                        JobImportException.class,
                        () -> fetcher(transport)
                                .fetch(
                                        "https://jobs.example.com/job"
                                )
                );

        assertEquals(
                UNAVAILABLE,
                exception.getReason()
        );
    }

    private SafeJobPageFetcher publicFetcher() {
        return new SafeJobPageFetcher(
                host -> new InetAddress[]{
                        PUBLIC_ADDRESS
                }
        );
    }

    private SafeJobPageFetcher fetcher(
            SafeJobPageFetcher.HttpTransport transport
    ) {
        return new SafeJobPageFetcher(
                host -> new InetAddress[]{
                        PUBLIC_ADDRESS
                },
                transport
        );
    }

    private static SafeJobPageFetcher.HttpFetchResponse
            redirect(String location) {
        return response(
                302,
                Map.of(
                        "Location",
                        List.of(location)
                ),
                ""
        );
    }

    private static SafeJobPageFetcher.HttpFetchResponse
            response(
                    int status,
                    Map<String, List<String>> headers,
                    String body
            ) {
        return response(
                status,
                headers,
                body.getBytes(
                        StandardCharsets.UTF_8
                )
        );
    }

    private static SafeJobPageFetcher.HttpFetchResponse
            response(
                    int status,
                    Map<String, List<String>> headers,
                    byte[] body
            ) {
        return new SafeJobPageFetcher.HttpFetchResponse(
                status,
                headers,
                new ByteArrayInputStream(body),
                () -> { }
        );
    }

    private static byte[] gzip(String value) {
        try {
            ByteArrayOutputStream output =
                    new ByteArrayOutputStream();

            try (GZIPOutputStream gzip =
                         new GZIPOutputStream(output)) {
                gzip.write(
                        value.getBytes(
                                StandardCharsets.UTF_8
                        )
                );
            }

            return output.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException(
                    exception
            );
        }
    }

    private static byte[] deflate(String value) {
        try {
            ByteArrayOutputStream output =
                    new ByteArrayOutputStream();

            try (DeflaterOutputStream deflater =
                         new DeflaterOutputStream(
                                 output
                         )) {
                deflater.write(
                        value.getBytes(
                                StandardCharsets.UTF_8
                        )
                );
            }

            return output.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException(
                    exception
            );
        }
    }

    private static InetAddress address(
            String value
    ) {
        try {
            return InetAddress.getByName(value);
        } catch (Exception exception) {
            throw new IllegalStateException(
                    exception
            );
        }
    }

    private static final class RecordingTransport
            implements SafeJobPageFetcher.HttpTransport {

        private final Deque<
                SafeJobPageFetcher.HttpFetchResponse
                > responses =
                new ArrayDeque<>();

        private final List<URI> requestedUris =
                new ArrayList<>();

        private RecordingTransport(
                SafeJobPageFetcher.HttpFetchResponse...
                        responses
        ) {
            this.responses.addAll(
                    List.of(responses)
            );
        }

        @Override
        public SafeJobPageFetcher.HttpFetchResponse
                get(URI uri) throws IOException {

            requestedUris.add(uri);

            SafeJobPageFetcher.HttpFetchResponse
                    response =
                    responses.pollFirst();

            if (response == null) {
                throw new IOException(
                        "No fake response configured"
                );
            }

            return response;
        }
    }
}