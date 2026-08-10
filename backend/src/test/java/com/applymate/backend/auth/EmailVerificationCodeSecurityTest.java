package com.applymate.backend.auth;

import org.junit.jupiter.api.Test;

import java.util.Base64;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class EmailVerificationCodeSecurityTest {

    @Test
    void generatedCodeIsAlwaysSixDigits() {
        EmailVerificationCodeSecurity security = createSecurity();

        for (int i = 0; i < 1000; i++) {
            String code = security.generateCode();

            assertTrue(
                    code.matches("\\d{6}"),
                    "Generated verification code must contain exactly six digits."
            );
        }
    }

    @Test
    void hashIsDeterministicAndMatchesOriginalCode() {
        EmailVerificationCodeSecurity security = createSecurity();

        UUID userId = UUID.randomUUID();
        String code = "042731";

        String firstHash = security.hashCode(userId, code);
        String secondHash = security.hashCode(userId, code);

        assertEquals(firstHash, secondHash);
        assertEquals(64, firstHash.length());
        assertTrue(security.matches(userId, code, firstHash));
    }

    @Test
    void incorrectCodeDoesNotMatch() {
        EmailVerificationCodeSecurity security = createSecurity();

        UUID userId = UUID.randomUUID();

        String storedHash =
                security.hashCode(userId, "123456");

        assertFalse(
                security.matches(
                        userId,
                        "654321",
                        storedHash
                )
        );
    }

    @Test
    void sameCodeForDifferentUserDoesNotMatch() {
        EmailVerificationCodeSecurity security = createSecurity();

        UUID firstUserId = UUID.randomUUID();
        UUID secondUserId = UUID.randomUUID();

        String code = "123456";

        String firstUserHash =
                security.hashCode(firstUserId, code);

        assertFalse(
                security.matches(
                        secondUserId,
                        code,
                        firstUserHash
                )
        );
    }

    @Test
    void malformedStoredHashDoesNotMatch() {
        EmailVerificationCodeSecurity security = createSecurity();

        assertFalse(
                security.matches(
                        UUID.randomUUID(),
                        "123456",
                        "not-a-valid-hex-hash"
                )
        );
    }

    @Test
    void invalidBase64PepperIsRejected() {
        EmailVerificationProperties properties =
                new EmailVerificationProperties();

        properties.setPepper("%%%not-base64%%%");

        assertThrows(
                IllegalStateException.class,
                () -> new EmailVerificationCodeSecurity(properties)
        );
    }

    @Test
    void pepperShorterThanThirtyTwoBytesIsRejected() {
        EmailVerificationProperties properties =
                new EmailVerificationProperties();

        properties.setPepper(
                Base64.getEncoder()
                        .encodeToString(new byte[16])
        );

        assertThrows(
                IllegalStateException.class,
                () -> new EmailVerificationCodeSecurity(properties)
        );
    }

    private EmailVerificationCodeSecurity createSecurity() {
        EmailVerificationProperties properties =
                new EmailVerificationProperties();

        byte[] testPepper = new byte[32];

        for (int i = 0; i < testPepper.length; i++) {
            testPepper[i] = (byte) (i + 1);
        }

        properties.setPepper(
                Base64.getEncoder()
                        .encodeToString(testPepper)
        );

        return new EmailVerificationCodeSecurity(properties);
    }
}