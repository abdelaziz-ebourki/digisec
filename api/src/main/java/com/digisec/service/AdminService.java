package com.digisec.service;

import com.digisec.dto.AdminUserResponse;
import com.digisec.entity.User;
import com.digisec.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;

    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> listUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(AdminService::toAdminUserResponse)
                .toList();
    }

    private static AdminUserResponse toAdminUserResponse(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getCodeApoge(),
                user.getPhoneNumber(),
                user.getRole().name(),
                user.isVerified(),
                user.getCreatedAt());
    }
}
