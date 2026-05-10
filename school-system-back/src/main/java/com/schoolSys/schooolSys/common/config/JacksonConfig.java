package com.schoolSys.schooolSys.common.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Spring Boot 4 autoconfigures the new {@code tools.jackson.databind.ObjectMapper},
 * but several services (e.g. ImportJobService) still depend on the legacy
 * {@code com.fasterxml.jackson.databind.ObjectMapper}. This bean exposes one
 * configured for JSR-310 (LocalDate/LocalDateTime) and ISO-8601 output.
 */
@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper fasterxmlObjectMapper() {
        return new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }
}
