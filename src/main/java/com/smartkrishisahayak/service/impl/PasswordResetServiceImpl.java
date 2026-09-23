package com.smartkrishisahayak.service.impl;

import com.smartkrishisahayak.dto.request.ForgotPasswordRequest;
import com.smartkrishisahayak.dto.request.ResetPasswordRequest;
import com.smartkrishisahayak.dto.request.VerifyResetTokenRequest;
import com.smartkrishisahayak.entity.PasswordResetToken;
import com.smartkrishisahayak.entity.User;
import com.smartkrishisahayak.exception.BadRequestException;
import com.smartkrishisahayak.repository.PasswordResetTokenRepository;
import com.smartkrishisahayak.repository.UserRepository;
import com.smartkrishisahayak.service.PasswordResetService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PasswordResetServiceImpl implements PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetServiceImpl.class);
    private static final int OTP_EXPIRY_MINUTES = 15;
    private static final SecureRandom secureRandom = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public PasswordResetServiceImpl(UserRepository userRepository,
                                    PasswordResetTokenRepository tokenRepository,
                                    PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void initiatePasswordReset(ForgotPasswordRequest request) {
        String identifier = request.getMobileNumberOrEmail() != null ? request.getMobileNumberOrEmail().trim() : "";
        if (identifier.isEmpty()) {
            throw new BadRequestException("Mobile number or email is required.");
        }

        Optional<User> userOpt = userRepository.findByMobileNumber(identifier)
                .or(() -> userRepository.findByEmail(identifier));

        // Prevent user enumeration attacks: if user does not exist, log quietly and return normally
        if (userOpt.isEmpty()) {
            log.info("Password reset requested for non-existent identifier: {}", identifier);
            return;
        }

        User user = userOpt.get();

        // Invalidate any previously active tokens for this user
        tokenRepository.invalidateAllUnusedTokensForUser(user, LocalDateTime.now());

        // Generate cryptographically secure 6-digit numeric OTP
        int randomPin = secureRandom.nextInt(900000) + 100000;
        String otpToken = String.valueOf(randomPin);

        LocalDateTime expiry = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);
        PasswordResetToken resetToken = new PasswordResetToken(user, otpToken, expiry);
        tokenRepository.save(resetToken);

        // In development/test or if external mail is not configured, output OTP directly to logs for testing
        log.info("===============================================================================");
        log.info(">>> PASSWORD RESET OTP GENERATED <<<");
        log.info("Target User: {} (ID: {})", user.getFullName(), user.getId());
        log.info("Identifier: {}", identifier);
        log.info("SECURE RESET OTP: >>> {} <<<", otpToken);
        log.info("Valid for: {} minutes (Expires at: {})", OTP_EXPIRY_MINUTES, expiry);
        log.info("===============================================================================");
    }

    @Override
    @Transactional(readOnly = true)
    public boolean verifyResetToken(VerifyResetTokenRequest request) {
        String identifier = request.getMobileNumberOrEmail() != null ? request.getMobileNumberOrEmail().trim() : "";
        String tokenStr = request.getTokenOrOtp() != null ? request.getTokenOrOtp().trim() : "";

        if (identifier.isEmpty() || tokenStr.isEmpty()) {
            throw new BadRequestException("Identifier and OTP token are required.");
        }

        Optional<User> userOpt = userRepository.findByMobileNumber(identifier)
                .or(() -> userRepository.findByEmail(identifier));

        if (userOpt.isEmpty()) {
            throw new BadRequestException("Invalid or expired password reset token.");
        }

        User user = userOpt.get();
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(tokenStr);

        if (tokenOpt.isEmpty()) {
            throw new BadRequestException("Invalid password reset token.");
        }

        PasswordResetToken token = tokenOpt.get();
        if (!token.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Invalid password reset token for this account.");
        }

        if (token.isUsed()) {
            throw new BadRequestException("This password reset token has already been used.");
        }

        if (token.isExpired()) {
            throw new BadRequestException("This password reset token has expired. Please request a new one.");
        }

        return true;
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String identifier = request.getMobileNumberOrEmail() != null ? request.getMobileNumberOrEmail().trim() : "";
        String tokenStr = request.getTokenOrOtp() != null ? request.getTokenOrOtp().trim() : "";
        String newPassword = request.getNewPassword() != null ? request.getNewPassword().trim() : "";

        if (identifier.isEmpty() || tokenStr.isEmpty() || newPassword.isEmpty()) {
            throw new BadRequestException("All fields are required to reset password.");
        }

        if (newPassword.length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters long.");
        }

        Optional<User> userOpt = userRepository.findByMobileNumber(identifier)
                .or(() -> userRepository.findByEmail(identifier));

        if (userOpt.isEmpty()) {
            throw new BadRequestException("Invalid or expired password reset request.");
        }

        User user = userOpt.get();
        PasswordResetToken token = tokenRepository.findByToken(tokenStr)
                .orElseThrow(() -> new BadRequestException("Invalid password reset token."));

        if (!token.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Invalid token for this account.");
        }

        if (token.isUsed()) {
            throw new BadRequestException("This token has already been used. Please request a new password reset.");
        }

        if (token.isExpired()) {
            throw new BadRequestException("This token has expired. Please request a new password reset.");
        }

        // Securely hash and update the password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        token.setUsed(true);
        token.setUsedAt(LocalDateTime.now());
        tokenRepository.save(token);

        log.info("Password successfully reset for user ID={} ({})", user.getId(), user.getMobileNumber());
    }
}
