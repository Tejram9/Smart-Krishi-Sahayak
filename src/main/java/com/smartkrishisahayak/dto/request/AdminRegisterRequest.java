package com.smartkrishisahayak.dto.request;

import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AdminRegisterRequest {

    @NotBlank(message = "Official full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Official email address is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must be exactly 10 digits")
    private String mobileNumber;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    private String password;

    private String adminSecretKey;

    private String department = "Department of Agriculture & Farmer Welfare";

    @NotNull(message = "Preferred language is required")
    private PreferredLanguage preferredLanguage = PreferredLanguage.EN;

    public AdminRegisterRequest() {
    }

    public AdminRegisterRequest(String fullName, String email, String mobileNumber, String password, String adminSecretKey) {
        this.fullName = fullName;
        this.email = email;
        this.mobileNumber = mobileNumber;
        this.password = password;
        this.adminSecretKey = adminSecretKey;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getAdminSecretKey() {
        return adminSecretKey;
    }

    public void setAdminSecretKey(String adminSecretKey) {
        this.adminSecretKey = adminSecretKey;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public PreferredLanguage getPreferredLanguage() {
        return preferredLanguage;
    }

    public void setPreferredLanguage(PreferredLanguage preferredLanguage) {
        this.preferredLanguage = preferredLanguage;
    }
}
