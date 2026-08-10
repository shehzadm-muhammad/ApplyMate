package com.applymate.backend.auth;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

@Component
@Validated
@ConfigurationProperties(prefix = "security.email-verification")
public class EmailVerificationProperties {

    @NotBlank
    private String pepper;

    @NotNull
    private Duration codeTtl;

    @NotNull
    private Duration resendCooldown;

    @Min(1)
    private int maxAttempts;

    @NotNull
    private Duration issueWindow;

    @Min(1)
    private int maxIssuesPerWindow;

    public String getPepper() {
        return pepper;
    }

    public void setPepper(String pepper) {
        this.pepper = pepper;
    }

    public Duration getCodeTtl() {
        return codeTtl;
    }

    public void setCodeTtl(Duration codeTtl) {
        this.codeTtl = codeTtl;
    }

    public Duration getResendCooldown() {
        return resendCooldown;
    }

    public void setResendCooldown(Duration resendCooldown) {
        this.resendCooldown = resendCooldown;
    }

    public int getMaxAttempts() {
        return maxAttempts;
    }

    public void setMaxAttempts(int maxAttempts) {
        this.maxAttempts = maxAttempts;
    }

    public Duration getIssueWindow() {
        return issueWindow;
    }

    public void setIssueWindow(Duration issueWindow) {
        this.issueWindow = issueWindow;
    }

    public int getMaxIssuesPerWindow() {
        return maxIssuesPerWindow;
    }

    public void setMaxIssuesPerWindow(int maxIssuesPerWindow) {
        this.maxIssuesPerWindow = maxIssuesPerWindow;
    }
}