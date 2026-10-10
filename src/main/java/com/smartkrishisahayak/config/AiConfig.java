package com.smartkrishisahayak.config;

import com.smartkrishisahayak.service.AiChatService;
import com.smartkrishisahayak.service.impl.MockAiChatServiceImpl;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Fallback AI configuration to guarantee that an {@link AiChatService} bean
 * is always present in the Spring application context, regardless of environment
 * variable states or unconfigured provider keys.
 */
@Configuration
public class AiConfig {

    @Bean
    @ConditionalOnMissingBean(AiChatService.class)
    public AiChatService fallbackAiChatService() {
        return new MockAiChatServiceImpl();
    }
}
