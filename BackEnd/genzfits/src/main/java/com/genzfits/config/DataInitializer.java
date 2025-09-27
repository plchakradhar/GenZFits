package com.genzfits.config;

import com.genzfits.model.Product;
import com.genzfits.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner initDatabase(ProductRepository productRepository) {
        return args -> {
            // No automatic product creation - products will be added manually via admin
            System.out.println("Database initialized without sample products");
        };
    }
}