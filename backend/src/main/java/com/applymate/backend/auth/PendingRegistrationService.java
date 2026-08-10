package com.applymate.backend.auth;

import com.applymate.backend.user.AppUser;
import com.applymate.backend.user.AppUserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class PendingRegistrationService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;

    public PendingRegistrationService(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder,
            EmailVerificationService emailVerificationService
    ) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailVerificationService =
                emailVerificationService;
    }

    @Transactional
    public PendingRegistration create(
            RegisterRequest request
    ) {
        String normalisedEmail =
                request.email()
                        .trim()
                        .toLowerCase(Locale.ROOT);

        if (
                appUserRepository
                        .existsByEmailIgnoreCase(
                                normalisedEmail
                        )
        ) {
            throw new EmailAlreadyExistsException(
                    normalisedEmail
            );
        }

        AppUser user =
                new AppUser(
                        normalisedEmail,
                        passwordEncoder.encode(
                                request.password()
                        ),
                        request.firstName().trim(),
                        request.lastName().trim()
                );

        AppUser savedUser;

        try {
            savedUser =
                    appUserRepository.saveAndFlush(
                            user
                    );
        } catch (
                DataIntegrityViolationException exception
        ) {
            throw new EmailAlreadyExistsException(
                    normalisedEmail
            );
        }

        IssuedEmailVerificationCode verification =
                emailVerificationService
                        .issueInitialCode(savedUser);

        return new PendingRegistration(
                savedUser,
                verification
        );
    }
}