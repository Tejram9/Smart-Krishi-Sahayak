package com.smartkrishisahayak.security;

import com.smartkrishisahayak.entity.User;
import com.smartkrishisahayak.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Autowired
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String mobileNumberOrEmail) throws UsernameNotFoundException {
        User user = userRepository.findByMobileNumber(mobileNumberOrEmail)
                .orElseGet(() -> userRepository.findByEmail(mobileNumberOrEmail)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + mobileNumberOrEmail)));

        return UserPrincipal.create(user);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

        return UserPrincipal.create(user);
    }

    @Transactional
    public UserDetails loadOrCreateUserFromJwt(Long id, String mobileNumber, String roleStr) {
        java.util.Optional<User> existing = userRepository.findById(id);
        if (existing.isPresent()) {
            return UserPrincipal.create(existing.get());
        }

        if (mobileNumber != null && !mobileNumber.trim().isEmpty()) {
            java.util.Optional<User> byMobile = userRepository.findByMobileNumber(mobileNumber.trim());
            if (byMobile.isPresent()) {
                return UserPrincipal.create(byMobile.get());
            }
        }

        // Auto-seed or recover user for ephemeral/serverless container instance
        com.smartkrishisahayak.entity.enums.UserRole role =
                "ROLE_ADMIN".equalsIgnoreCase(roleStr) ? com.smartkrishisahayak.entity.enums.UserRole.ROLE_ADMIN : com.smartkrishisahayak.entity.enums.UserRole.ROLE_FARMER;

        String safeMobile = (mobileNumber != null && !mobileNumber.trim().isEmpty()) ? mobileNumber.trim() : ("9876543210");
        String safeName = "ROLE_ADMIN".equalsIgnoreCase(roleStr) ? "System Admin" : "Rameshwar Patil (बळीराजा)";
        com.smartkrishisahayak.entity.enums.PreferredLanguage lang =
                "ROLE_ADMIN".equalsIgnoreCase(roleStr) ? com.smartkrishisahayak.entity.enums.PreferredLanguage.EN : com.smartkrishisahayak.entity.enums.PreferredLanguage.MR;

        String passHash = "ROLE_ADMIN".equalsIgnoreCase(roleStr)
                ? "$2a$10$WtyOGXE0kGfeXCjN7EHkvuZZL.JjjdzXKGCQSp22Q8ubwPYCg1/lG"
                : "$2a$10$WtyOGXE0kGfeXCjN7EHkvuZZL.JjjdzXKGCQSp22Q8ubwPYCg1/lG";

        User recovered = new User(
                safeName,
                safeMobile,
                passHash,
                lang,
                role
        );
        if (role == com.smartkrishisahayak.entity.enums.UserRole.ROLE_ADMIN) {
            recovered.setEmail("admin@smartkrishi.gov.in");
        } else {
            recovered.setEmail("farmer.demo@smartkrishi.gov.in");
        }

        try {
            return UserPrincipal.create(userRepository.save(recovered));
        } catch (Exception ex) {
            // In case of concurrent insert on duplicate mobile
            return userRepository.findByMobileNumber(safeMobile)
                    .map(UserPrincipal::create)
                    .orElseGet(() -> UserPrincipal.create(recovered));
        }
    }
}
