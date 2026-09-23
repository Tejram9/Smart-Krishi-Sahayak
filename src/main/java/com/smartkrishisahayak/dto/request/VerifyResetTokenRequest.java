package com.smartkrishisahayak.dto.request;

import jakarta.validation.constraints.NotBlank;

public class VerifyResetTokenRequest {

    @NotBlank(message = "Mobile number or email is required")
    private String mobileNumberOrEmail;

    @NotBlank(message = "Reset token or OTP is required")
    private String tokenOrOtp;

    public VerifyResetTokenRequest() {
    }

    public VerifyResetTokenRequest(String mobileNumberOrEmail, String tokenOrOtp) {
        this.mobileNumberOrEmail = mobileNumberOrEmail;
        this.tokenOrOtp = tokenOrOtp;
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
}
