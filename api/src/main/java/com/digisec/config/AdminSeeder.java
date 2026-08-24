package com.digisec.config;

import com.digisec.entity.Role;
import com.digisec.entity.User;
import com.digisec.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class AdminSeeder {

    @Bean
    public CommandLineRunner seedAdmin(UserRepository userRepository,
                                       @Value("${app.admin.email}") String email,
                                       @Value("${app.admin.password}") String password,
                                       @Value("${app.seed-admin}") boolean enabled) {
        return args -> {
            if (!enabled || userRepository.existsByEmail(email)) {
                return;
            }
            User admin = User.builder()
                    .firstName("Admin")
                    .lastName("Digisec")
                    .codeApoge("ADMIN000")
                    .email(email)
                    .phoneNumber("+212600000000")
                    .passwordHash(new BCryptPasswordEncoder().encode(password))
                    .role(Role.ADMIN)
                    .verified(true)
                    .build();
            userRepository.save(admin);
        };
    }
}
