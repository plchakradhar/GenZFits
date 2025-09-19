package com.genzfits;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class GenzfitsApplication {
    public static void main(String[] args) {
        SpringApplication.run(GenzfitsApplication.class, args);
    }
}
