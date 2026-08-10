package com.applymate.backend.auth;

import com.applymate.backend.security.AccessTokenGrant;
import com.applymate.backend.security.JwtTokenService;
import com.applymate.backend.user.AppUser;
import com.applymate.backend.user.AppUserRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Locale;
import java.util.Optional;

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenService jwtTokenService;
    private final RefreshTokenService refreshTokenService;
    private final EmailVerificationService
        emailVerificationService;
    private final PendingRegistrationService
        pendingRegistrationService;
    private final VerificationEmailSender
        verificationEmailSender;
    private static final Logger LOGGER =
        LoggerFactory.getLogger(AuthService.class);

    public AuthService(
        AppUserRepository appUserRepository,
        AuthenticationManager authenticationManager,
        JwtTokenService jwtTokenService,
        RefreshTokenService refreshTokenService,
        PendingRegistrationService pendingRegistrationService,
        VerificationEmailSender verificationEmailSender,
        EmailVerificationService emailVerificationService
) {
    this.appUserRepository = appUserRepository;
    this.authenticationManager = authenticationManager;
    this.jwtTokenService = jwtTokenService;
    this.refreshTokenService = refreshTokenService;
    this.pendingRegistrationService =
            pendingRegistrationService;
    this.verificationEmailSender =
            verificationEmailSender;
    this.emailVerificationService =
        emailVerificationService;
}

    public RegisterResponse register(
        RegisterRequest request
) {
    PendingRegistration pendingRegistration =
            pendingRegistrationService.create(
                    request
            );

    AppUser user =
            pendingRegistration.user();

    IssuedEmailVerificationCode verification =
            pendingRegistration.verification();

    boolean verificationEmailSent = false;

    try {
        verificationEmailSender
                .sendVerificationCode(
                        new VerificationEmailMessage(
                                user.getId(),
                                user.getEmail(),
                                verification.rawCode(),
                                verification.expiresAt(),
                                verification.issuedAt()
                        )
                );

        verificationEmailSent = true;

    } catch (EmailDeliveryException exception) {
        LOGGER.warn(
                "Verification email delivery failed "
                        + "for user {}",
                user.getId()
        );
    }

    return RegisterResponse.from(
            user,
            verification,
            verificationEmailSent
    );
}

    @Transactional
    public LoginResponse login(LoginRequest request) {
        String normalisedEmail = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        try {
            authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(
                            normalisedEmail,
                            request.password()
                    )
            );
        } catch (AuthenticationException exception) {
            throw new InvalidCredentialsException();
        }

        AppUser user = appUserRepository
        .findByEmailIgnoreCase(normalisedEmail)
        .orElseThrow(InvalidCredentialsException::new);

if (!user.isEmailVerified()) {
    throw new EmailVerificationRequiredException();
}

AccessTokenGrant accessTokenGrant =
        jwtTokenService.createAccessToken(user);

        RefreshTokenGrant refreshTokenGrant =
                refreshTokenService.issue(user.getId());

        return LoginResponse.from(
                user,
                accessTokenGrant,
                refreshTokenGrant
        );
    }

    public LoginResponse refresh(RefreshTokenRequest request) {
        RefreshTokenGrant refreshTokenGrant =
                refreshTokenService.rotate(request.refreshToken());

        AppUser user = appUserRepository
                .findById(refreshTokenGrant.userId())
                .filter(AppUser::isEnabled)
                .orElse(null);

        if (user == null) {
            refreshTokenService.revokeSession(
                    refreshTokenGrant.refreshToken()
            );

            throw new InvalidRefreshTokenException();
        }
        if (!user.isEmailVerified()) {
        refreshTokenService.revokeSession(
                refreshTokenGrant.refreshToken()
        );

        throw new EmailVerificationRequiredException();
        }

        AccessTokenGrant accessTokenGrant =
                jwtTokenService.createAccessToken(user);

        return LoginResponse.from(
                user,
                accessTokenGrant,
                refreshTokenGrant
        );
    }

    public EmailVerificationResponse verifyEmail(
        VerifyEmailRequest request
) {
    emailVerificationService.verifyEmail(
            request.email(),
            request.code()
    );

    return EmailVerificationResponse.success();
}

public ResendVerificationResponse resendVerification(
        ResendVerificationRequest request
) {
    Optional<IssuedEmailVerificationCode> verificationResult =
            emailVerificationService.resendCode(
                    request.email()
            );

    if (verificationResult.isEmpty()) {
        return ResendVerificationResponse.accepted();
    }

    String normalisedEmail =
            request.email()
                    .trim()
                    .toLowerCase(Locale.ROOT);

    AppUser user =
            appUserRepository
                    .findByEmailIgnoreCase(normalisedEmail)
                    .orElse(null);

    if (user == null || user.isEmailVerified()) {
        return ResendVerificationResponse.accepted();
    }

    IssuedEmailVerificationCode verification =
            verificationResult.get();

    verificationEmailSender.sendVerificationCode(
            new VerificationEmailMessage(
                    user.getId(),
                    user.getEmail(),
                    verification.rawCode(),
                    verification.expiresAt(),
                    verification.issuedAt()
            )
    );

    return ResendVerificationResponse.sent(
            verification
    );
}

    public void logout(RefreshTokenRequest request) {
        refreshTokenService.revokeSession(
                request.refreshToken()
        );
    }
}