package com.smartkrishisahayak.dto.request;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank(message = "Mobile number or email is required")
    private String mobileNumberOrEmail;

    @NotBlank(message = "Password is required")
    private String password;

    private String expectedRole;

    public LoginRequest() {
    }

    public LoginRequest(String mobileNumberOrEmail, String password) {
        this.mobileNumberOrEmail = mobileNumberOrEmail;
        this.password = password;
    }

    public LoginRequest(String mobileNumberOrEmail, String password, String expectedRole) {
        this.mobileNumberOrEmail = mobileNumberOrEmail;
        this.password = password;
        this.expectedRole = expectedRole;
    }

    public String getMobileNumberOrEmail() {
        return mobileNumberOrEmail;
    }

    public void setMobileNumberOrEmail(String mobileNumberOrEmail) {
        this.mobileNumberOrEmail = mobileNumberOrEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getExpectedRole() {
        return expectedRole;
    }

    public void setExpectedRole(String expectedRole) {
        this.expectedRole = expectedRole;
    }
}
