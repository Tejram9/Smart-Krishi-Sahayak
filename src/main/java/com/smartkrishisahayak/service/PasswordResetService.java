package com.smartkrishisahayak.service;

import com.smartkrishisahayak.dto.request.ForgotPasswordRequest;
import com.smartkrishisahayak.dto.request.ResetPasswordRequest;
import com.smartkrishisahayak.dto.request.VerifyResetTokenRequest;

public interface PasswordResetService {

    void initiatePasswordReset(ForgotPasswordRequest request);

    boolean verifyResetToken(VerifyResetTokenRequest request);

    void resetPassword(ResetPasswordRequest request);
}
