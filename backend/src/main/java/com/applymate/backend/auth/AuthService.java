package com.applymate.backend.auth;

import com.applymate.backend.user.AppUser;
import com.applymate.backend.user.AppUserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String normalisedEmail = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (appUserRepository.existsByEmailIgnoreCase(normalisedEmail)) {
            throw new EmailAlreadyExistsException(normalisedEmail);
        }

        AppUser user = new AppUser(
                normalisedEmail,
                passwordEncoder.encode(request.password()),
                request.firstName().trim(),
                request.lastName().trim()
        );

        try {
            AppUser savedUser = appUserRepository.saveAndFlush(user);
            return RegisterResponse.from(savedUser);
        } catch (DataIntegrityViolationException exception) {
            throw new EmailAlreadyExistsException(normalisedEmail);
        }
    }
}