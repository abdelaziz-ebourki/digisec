package com.digisec.security;

import com.digisec.entity.User;
import com.digisec.exception.UnauthorizedException;
import com.digisec.repository.UserRepository;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserProvider {

    private final UserRepository userRepository;

    public CurrentUserProvider(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Authenticated user no longer exists"));
    }
}
