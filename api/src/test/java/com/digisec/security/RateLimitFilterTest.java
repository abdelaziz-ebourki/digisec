package com.digisec.security;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class RateLimitFilterTest {

    private MockHttpServletRequest loginRequest(String ip) {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.setRemoteAddr(ip);
        return request;
    }

    @Test
    void allowsRequestsWithinLimit() throws Exception {
        RateLimitFilter filter = new RateLimitFilter(3);
        FilterChain chain = mock(FilterChain.class);

        for (int i = 0; i < 3; i++) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilter(loginRequest("10.0.0.1"), response, chain);
            assertThat(response.getStatus()).isEqualTo(200);
        }
    }

    @Test
    void rejectsOverLimitWithCoded429() throws Exception {
        RateLimitFilter filter = new RateLimitFilter(2);
        FilterChain chain = mock(FilterChain.class);
        AtomicInteger passed = new AtomicInteger();

        MockHttpServletResponse rejected = null;
        for (int i = 0; i < 4; i++) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilter(loginRequest("10.0.0.2"), response, chain);
            if (response.getStatus() == 429) {
                rejected = response;
            } else {
                passed.incrementAndGet();
            }
        }

        assertThat(passed).hasValue(2);
        assertThat(rejected).isNotNull();
        assertThat(rejected.getContentAsString()).contains("\"code\":\"RATE_LIMITED\"");
        assertThat(rejected.getContentType()).contains("problem+json");
    }

    @Test
    void limitsPerClientIpAndIgnoresOtherPaths() throws Exception {
        RateLimitFilter filter = new RateLimitFilter(1);
        FilterChain chain = mock(FilterChain.class);

        MockHttpServletResponse first = new MockHttpServletResponse();
        filter.doFilter(loginRequest("10.0.0.3"), first, chain);
        assertThat(first.getStatus()).isEqualTo(200);

        // Same IP, second login attempt is rejected…
        MockHttpServletResponse second = new MockHttpServletResponse();
        filter.doFilter(loginRequest("10.0.0.3"), second, chain);
        assertThat(second.getStatus()).isEqualTo(429);

        // …but a different IP still has budget, and other paths are untouched.
        MockHttpServletResponse otherIp = new MockHttpServletResponse();
        filter.doFilter(loginRequest("10.0.0.4"), otherIp, chain);
        assertThat(otherIp.getStatus()).isEqualTo(200);

        MockHttpServletResponse getRequest = new MockHttpServletResponse();
        filter.doFilter(new MockHttpServletRequest("GET", "/api/v1/activities"), getRequest, chain);
        assertThat(getRequest.getStatus()).isEqualTo(200);
    }
}
