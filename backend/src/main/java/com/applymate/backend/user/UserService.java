package com.applymate.backend.user;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserService {

    private final AppUserRepository appUserRepository;

    public UserService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(UUID userId) {
        AppUser user = appUserRepository
                .findById(userId)
                .orElseThrow(UserNotFoundException::new);

        return UserProfileResponse.from(user);
    }

    @Transactional
    public void deleteUser(UUID userId) {
        AppUser user = appUserRepository
                .findById(userId)
                .orElseThrow(UserNotFoundException::new);

        appUserRepository.delete(user);
    }
}