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

import java.util.Locale;

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenService jwtTokenService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenService jwtTokenService,
            RefreshTokenService refreshTokenService
    ) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenService = jwtTokenService;
        this.refreshTokenService = refreshTokenService;
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

        AccessTokenGrant accessTokenGrant =
                jwtTokenService.createAccessToken(user);

        return LoginResponse.from(
                user,
                accessTokenGrant,
                refreshTokenGrant
        );
    }

    public void logout(RefreshTokenRequest request) {
        refreshTokenService.revokeSession(
                request.refreshToken()
        );
    }
}