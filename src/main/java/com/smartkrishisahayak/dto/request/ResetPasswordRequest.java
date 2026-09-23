package com.smartkrishisahayak.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {

    @NotBlank(message = "Mobile number or email is required")
    private String mobileNumberOrEmail;

    @NotBlank(message = "Reset token or OTP is required")
    private String tokenOrOtp;

    @NotBlank(message = "New password is required")
    @Size(min = 6, max = 50, message = "Password must be between 6 and 50 characters")
    private String newPassword;

    public ResetPasswordRequest() {
    }

    public ResetPasswordRequest(String mobileNumberOrEmail, String tokenOrOtp, String newPassword) {
        this.mobileNumberOrEmail = mobileNumberOrEmail;
        this.tokenOrOtp = tokenOrOtp;
        this.newPassword = newPassword;
    }

    public String getMobileNumberOrEmail() {
        return mobileNumberOrEmail;
    }

    public void setMobileNumberOrEmail(String mobileNumberOrEmail) {
        this.mobileNumberOrEmail = mobileNumberOrEmail;
    }

    public String getTokenOrOtp() {
        return tokenOrOtp;
    }

    public void setTokenOrOtp(String tokenOrOtp) {
        this.tokenOrOtp = tokenOrOtp;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
