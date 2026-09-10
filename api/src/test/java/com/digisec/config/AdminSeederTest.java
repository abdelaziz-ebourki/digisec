package com.digisec.config;

import org.junit.jupiter.api.Test;

import static com.digisec.config.AdminSeeder.requireNonDefaultPasswordInProd;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AdminSeederTest {

    @Test
    void refusesDefaultPasswordInProd() {
        assertThatThrownBy(() -> requireNonDefaultPasswordInProd(true, "ChangeMe123!"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("ADMIN_PASSWORD");
    }

    @Test
    void allowsStrongPasswordInProdAndAnythingOutsideProd() {
        assertThatNoException()
                .isThrownBy(() -> requireNonDefaultPasswordInProd(true, "N0IlxeQ8PBXNAL9ub1obr98dtj2qEmOD"));
        assertThatNoException()
                .isThrownBy(() -> requireNonDefaultPasswordInProd(false, "ChangeMe123!"));
    }
}
