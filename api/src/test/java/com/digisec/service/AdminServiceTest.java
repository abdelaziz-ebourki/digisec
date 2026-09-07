package com.digisec.service;

import com.digisec.dto.AdminUserResponse;
import com.digisec.entity.Role;
import com.digisec.entity.User;
import com.digisec.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    private AdminService adminService;

    @BeforeEach
    void setUp() {
        adminService = new AdminService(userRepository);
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
}
