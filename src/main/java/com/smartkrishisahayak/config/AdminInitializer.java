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

    @Value("${app.admin.email:admin@smartkrishi.gov.in}")
    private String adminEmail;

    @Value("${app.admin.password:Admin@123}")
    private String adminPassword;

    @Autowired
    public AdminInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByRole(UserRole.ROLE_ADMIN).isEmpty()) {
            logger.info("No admin account found. Creating initial system administrator account...");
            User admin = new User(
                    "System Admin",
                    adminMobile,
                    passwordEncoder.encode(adminPassword),
                    PreferredLanguage.EN,
                    UserRole.ROLE_ADMIN
            );
            admin.setEmail(adminEmail);
            userRepository.save(admin);
            logger.info("Initial admin account created successfully.");
        }
    }
}
