package com.digisec.service;

import com.digisec.dto.AdminUserResponse;
import com.digisec.entity.Role;
import com.digisec.entity.User;
import com.digisec.exception.ConflictException;
import com.digisec.exception.ErrorCode;
import com.digisec.exception.ForbiddenException;
import com.digisec.exception.ResourceNotFoundException;
import com.digisec.repository.CommentRepository;
import com.digisec.repository.PostRepository;
import com.digisec.repository.UserRepository;
import com.digisec.repository.VerificationTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final VerificationTokenRepository verificationTokenRepository;

    public AdminService(UserRepository userRepository,
                        PostRepository postRepository,
                        CommentRepository commentRepository,
                        VerificationTokenRepository verificationTokenRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.verificationTokenRepository = verificationTokenRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> listUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(AdminService::toAdminUserResponse)
                .toList();
    }

    @Transactional
    public void deleteUser(Long id, String currentUserEmail) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, "User not found: " + id));
        if (target.getEmail().equals(currentUserEmail)) {
            throw new ForbiddenException(ErrorCode.CANNOT_DELETE_SELF, "You cannot delete your own account");
        }
        if (target.getRole() == Role.ADMIN) {
            throw new ForbiddenException(ErrorCode.CANNOT_DELETE_ADMIN, "Administrators cannot be deleted");
        }
        if (postRepository.existsByAuthorId(id) || commentRepository.existsByAuthorId(id)) {
            throw new ConflictException(ErrorCode.USER_HAS_CONTENT, "User has posts or comments and cannot be deleted");
        }
        verificationTokenRepository.deleteAll(verificationTokenRepository.findByUserId(id));
        userRepository.delete(target);
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
