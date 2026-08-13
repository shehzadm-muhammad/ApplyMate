package com.applymate.backend.auth.passwordreset;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface PasswordResetChallengeRepository
        extends JpaRepository<PasswordResetChallenge, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT challenge
            FROM PasswordResetChallenge challenge
            WHERE challenge.userId = :userId
            """)
    Optional<PasswordResetChallenge> findByUserIdForUpdate(
            @Param("userId") UUID userId
    );
}