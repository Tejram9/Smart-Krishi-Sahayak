package com.smartkrishisahayak.config;

import com.smartkrishisahayak.entity.User;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import com.smartkrishisahayak.entity.enums.UserRole;
import com.smartkrishisahayak.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.logging.Logger;

@Component
@Order(1)
public class AdminInitializer implements CommandLineRunner {

    private static final Logger logger = Logger.getLogger(AdminInitializer.class.getName());

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.mobile:9999999999}")
    private String adminMobile;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Autowired
    public AdminInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByRole(UserRole.ROLE_ADMIN).isEmpty()) {
            String effectivePassword = (adminPassword != null && !adminPassword.trim().isEmpty()) ? adminPassword.trim() : "Admin@SecurePass2026";
            if (effectivePassword.length() < 12) {
                effectivePassword = "Admin@SecurePass2026";
            }
            logger.info("No admin account found. Creating initial system administrator account...");
            User admin = new User(
                    "System Admin",
                    adminMobile,
                    passwordEncoder.encode(effectivePassword),
                    PreferredLanguage.EN,
                    UserRole.ROLE_ADMIN
            );
            if (adminEmail != null && !adminEmail.trim().isEmpty()) {
                admin.setEmail(adminEmail);
            }
            userRepository.save(admin);
            logger.info("Initial admin account created successfully with mobile: " + adminMobile);
        }

        // Also ensure a default demo farmer account exists for immediate testing & demo
        if (userRepository.findByRole(UserRole.ROLE_FARMER).isEmpty()) {
            logger.info("No farmer accounts found. Seeding initial demo farmer account...");
            User demoFarmer = new User(
                    "Rameshwar Patil (बळीराजा)",
                    "9876543210",
                    passwordEncoder.encode("Farmer@123"),
                    PreferredLanguage.MR,
                    UserRole.ROLE_FARMER
            );
            demoFarmer.setEmail("farmer.demo@smartkrishi.gov.in");
            userRepository.save(demoFarmer);
            logger.info("Default demo farmer account created (Mobile: 9876543210 / Password: Farmer@123).");
        }
    }
}
