package com.applymate.backend.auth;

import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;

@Component
public class EmailVerificationCodeSecurity {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final int CODE_BOUND = 1_000_000;
    private static final int MINIMUM_PEPPER_BYTES = 32;

    private final SecureRandom secureRandom = new SecureRandom();
    private final byte[] pepper;

    public EmailVerificationCodeSecurity(
            EmailVerificationProperties properties
    ) {
        try {
            this.pepper = Base64.getDecoder()
                    .decode(properties.getPepper());
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException(
                    "EMAIL_VERIFICATION_PEPPER must be valid Base64.",
                    exception
            );
        }

        if (pepper.length < MINIMUM_PEPPER_BYTES) {
            throw new IllegalStateException(
                    "EMAIL_VERIFICATION_PEPPER must contain at least 32 bytes."
            );
        }
    }

    public String generateCode() {
        int value = secureRandom.nextInt(CODE_BOUND);

        return String.format(
                Locale.ROOT,
                "%06d",
                value
        );
    }

    public String hashCode(
            UUID userId,
            String rawCode
    ) {
        byte[] hash = calculateHash(userId, rawCode);
        return HexFormat.of().formatHex(hash);
    }

    public boolean matches(
            UUID userId,
            String rawCode,
            String storedHash
    ) {
        byte[] expectedHash =
                calculateHash(userId, rawCode);

        byte[] storedHashBytes;

        try {
            storedHashBytes =
                    HexFormat.of().parseHex(storedHash);
        } catch (IllegalArgumentException exception) {
            return false;
        }

        return MessageDigest.isEqual(
                expectedHash,
                storedHashBytes
        );
    }

    private byte[] calculateHash(
            UUID userId,
            String rawCode
    ) {
        String value = userId + ":" + rawCode;

        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(
                    new SecretKeySpec(
                            pepper,
                            HMAC_ALGORITHM
                    )
            );

            return mac.doFinal(
                    value.getBytes(StandardCharsets.UTF_8)
            );
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException(
                    "Unable to calculate email verification code hash.",
                    exception
            );
        }
    }
}