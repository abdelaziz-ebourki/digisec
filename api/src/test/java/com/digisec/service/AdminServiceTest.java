package com.digisec.service;

import com.digisec.dto.AdminUserResponse;
import com.digisec.entity.Role;
import com.digisec.entity.User;
import com.digisec.exception.ConflictException;
import com.digisec.exception.ErrorCode;
import com.digisec.exception.ResourceNotFoundException;
import com.digisec.repository.CommentRepository;
import com.digisec.repository.PostRepository;
import com.digisec.repository.UserRepository;
import com.digisec.repository.VerificationTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.digisec.exception.ForbiddenException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private VerificationTokenRepository verificationTokenRepository;

    private AdminService adminService;

    @BeforeEach
    void setUp() {
        adminService = new AdminService(userRepository, postRepository, commentRepository,
                verificationTokenRepository);
    }

    private User user(Long id, String email, Role role, boolean verified) {
        return User.builder().id(id)
                .firstName("Salma")
                .lastName("Bennani")
                .codeApoge("2300456")
                .email(email)
                .phoneNumber("+212600000001")
                .passwordHash("$2a$10$secrethash")
                .role(role)
                .verified(verified)
                .build();
    }

    @Test
    void listsUsersMostRecentFirstWithoutSensitiveFields() {
        User older = user(1L, "yassine.elfassi@digisec.local", Role.USER, true);
        User newer = user(2L, "khadija.amrani@digisec.local", Role.USER, false);
        when(userRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(newer, older));

        List<AdminUserResponse> responses = adminService.listUsers();

        verify(userRepository).findAllByOrderByCreatedAtDesc();
        assertThat(responses).hasSize(2);
        assertThat(responses.get(0).email()).isEqualTo("khadija.amrani@digisec.local");
        assertThat(responses.get(0).role()).isEqualTo("USER");
        assertThat(responses.get(0).verified()).isFalse();
        assertThat(responses.get(0).codeApoge()).isEqualTo("2300456");
        assertThat(responses.get(0).phoneNumber()).isEqualTo("+212600000001");
        // Whitelist check: the record exposes no password hash, tokens, or other secrets.
        assertThat(AdminUserResponse.class.getRecordComponents())
                .extracting("name")
                .containsExactly("id", "firstName", "lastName", "email", "codeApoge",
                        "phoneNumber", "role", "verified", "createdAt");
        assertThat(responses.get(1).verified()).isTrue();
    }

    @Test
    void returnsEmptyListWhenNoUsers() {
        when(userRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of());

        assertThat(adminService.listUsers()).isEmpty();
    }

    @Test
    void mapsAdminRole() {
        User admin = User.builder().id(9L)
                .firstName("Admin")
                .lastName("Digisec")
                .codeApoge("ADMIN000")
                .email("admin@digisec.local")
                .phoneNumber("+212600000000")
                .passwordHash("$2a$10$secrethash")
                .role(Role.ADMIN)
                .verified(true)
                .createdAt(LocalDateTime.of(2026, 1, 1, 0, 0))
                .build();
        when(userRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(admin));

        AdminUserResponse response = adminService.listUsers().get(0);

        assertThat(response.role()).isEqualTo("ADMIN");
        assertThat(response.verified()).isTrue();
    }

    @Test
    void deletesContentFreeUserWithTokens() {
        User target = user(7L, "e2e-1@digisec.local", Role.USER, true);
        when(userRepository.findById(7L)).thenReturn(Optional.of(target));
        when(postRepository.existsByAuthorId(7L)).thenReturn(false);
        when(commentRepository.existsByAuthorId(7L)).thenReturn(false);
        when(verificationTokenRepository.findByUserId(7L)).thenReturn(List.of());

        adminService.deleteUser(7L, "admin@digisec.local");

        verify(verificationTokenRepository).deleteAll(List.of());
        verify(userRepository).delete(target);
    }

    @Test
    void rejectsUnknownUser() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminService.deleteUser(99L, "admin@digisec.local"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasFieldOrPropertyWithValue("code", ErrorCode.USER_NOT_FOUND);
        verify(userRepository, never()).delete(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void rejectsSelfDelete() {
        User admin = user(9L, "admin@digisec.local", Role.ADMIN, true);
        when(userRepository.findById(9L)).thenReturn(Optional.of(admin));

        assertThatThrownBy(() -> adminService.deleteUser(9L, "admin@digisec.local"))
                .isInstanceOf(ForbiddenException.class)
                .hasFieldOrPropertyWithValue("code", ErrorCode.CANNOT_DELETE_SELF);
        verify(userRepository, never()).delete(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void rejectsDeletingAnotherAdmin() {
        User otherAdmin = user(10L, "root@digisec.local", Role.ADMIN, true);
        when(userRepository.findById(10L)).thenReturn(Optional.of(otherAdmin));

        assertThatThrownBy(() -> adminService.deleteUser(10L, "admin@digisec.local"))
                .isInstanceOf(ForbiddenException.class)
                .hasFieldOrPropertyWithValue("code", ErrorCode.CANNOT_DELETE_ADMIN);
        verify(userRepository, never()).delete(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void rejectsUserWithPosts() {
        User target = user(7L, "e2e-1@digisec.local", Role.USER, true);
        when(userRepository.findById(7L)).thenReturn(Optional.of(target));
        when(postRepository.existsByAuthorId(7L)).thenReturn(true);

        assertThatThrownBy(() -> adminService.deleteUser(7L, "admin@digisec.local"))
                .isInstanceOf(ConflictException.class)
                .hasFieldOrPropertyWithValue("code", ErrorCode.USER_HAS_CONTENT);
        verify(userRepository, never()).delete(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void rejectsUserWithComments() {
        User target = user(7L, "e2e-1@digisec.local", Role.USER, true);
        when(userRepository.findById(7L)).thenReturn(Optional.of(target));
        when(postRepository.existsByAuthorId(7L)).thenReturn(false);
        when(commentRepository.existsByAuthorId(7L)).thenReturn(true);

        assertThatThrownBy(() -> adminService.deleteUser(7L, "admin@digisec.local"))
                .isInstanceOf(ConflictException.class)
                .hasFieldOrPropertyWithValue("code", ErrorCode.USER_HAS_CONTENT);
        verify(userRepository, never()).delete(org.mockito.ArgumentMatchers.any());
    }
}
