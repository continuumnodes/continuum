package tech.lemnova.continuum.application.service;

import org.junit.jupiter.api.Test;
import tech.lemnova.continuum.application.exception.BadRequestException;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LemonSqueezyServiceTest {

    @Test
    void createCheckout_fails_fast_when_lemon_squeezy_is_disabled() {
        LemonSqueezyService service = new LemonSqueezyService(
                "",
                "",
                "https://example.com/success",
                "https://example.com/cancel",
                ""
        );

        assertThatThrownBy(() -> service.createCheckout("user-1", "user@example.com", "vision"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("disabled");
    }
}
