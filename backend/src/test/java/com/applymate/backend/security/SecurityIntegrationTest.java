package com.applymate.backend.security;

import com.applymate.backend.common.error.SecurityErrorHandler;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SecurityErrorHandler securityErrorHandler;

    @Autowired
    private JsonMapper jsonMapper;

    @Test
    void shouldReturnJsonWhenAuthenticationIsMissing()
            throws Exception {

        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string(
                        HttpHeaders.WWW_AUTHENTICATE,
                        "Bearer"
                ))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error")
                        .value("Unauthorized"))
                .andExpect(jsonPath("$.message")
                        .value("Authentication is required"))
                .andExpect(jsonPath("$.path")
                        .value("/api/v1/users/me"));
    }

    @Test
    void shouldReturnJsonForInvalidBearerToken()
            throws Exception {

        mockMvc.perform(get("/api/v1/users/me")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer invalid-token"
                        ))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message")
                        .value("Authentication is required"));
    }

    @Test
    void shouldReturnJsonWhenAccessIsDenied()
            throws Exception {

        MockHttpServletRequest request =
                new MockHttpServletRequest(
                        "GET",
                        "/api/v1/admin"
                );

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        securityErrorHandler.handle(
                request,
                response,
                new AccessDeniedException("Denied")
        );

        JsonNode body = jsonMapper.readTree(
                response.getContentAsString()
        );

        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(body.get("status").asInt())
                .isEqualTo(403);
        assertThat(body.get("error").asText())
                .isEqualTo("Forbidden");
        assertThat(body.get("message").asText())
                .isEqualTo("Access is denied");
        assertThat(body.get("path").asText())
                .isEqualTo("/api/v1/admin");
    }

    @Test
    void shouldAllowConfiguredCorsPreflightRequest()
            throws Exception {

        mockMvc.perform(options("/api/v1/applications")
                        .header(
                                HttpHeaders.ORIGIN,
                                "http://localhost:8081"
                        )
                        .header(
                                HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD,
                                "GET"
                        ))
                .andExpect(status().isOk())
                .andExpect(header().string(
                        HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN,
                        "http://localhost:8081"
                ));
    }
}