// src/main/java/com/genzfits/service/ProductService.java (fixed updateProduct to handle all fields, added searchProducts)
package com.genzfits.service;

import com.genzfits.model.Product;
import com.genzfits.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() { return productRepository.findAll(); }
    
    public List<Product> getProductsByCategory(String category) { 
        return productRepository.findByCategory(category); 
    }

    public List<Product> searchProducts(String query) {
        return productRepository.findByNameContainingIgnoreCase(query);
    }

    public Product saveProduct(Product product) { return productRepository.save(product); }

    public Product updateProduct(Long id, Product productDetails) {
        Optional<Product> product = productRepository.findById(id);
        if (product.isPresent()) {
            Product existing = product.get();
            existing.setName(productDetails.getName());
            existing.setPrice(productDetails.getPrice());
            existing.setCategory(productDetails.getCategory());
            existing.setDescription(productDetails.getDescription());
            existing.setImages(productDetails.getImages());
            existing.setStock(productDetails.getStock());
            existing.setOriginalPrice(productDetails.getOriginalPrice());
            existing.setDiscount(productDetails.getDiscount());
            existing.setAssured(productDetails.getAssured());
            existing.setBrand(productDetails.getBrand());
            existing.setSizes(productDetails.getSizes());
            existing.setRating(productDetails.getRating());
            existing.setReviewCount(productDetails.getReviewCount());
            return productRepository.save(existing);
        }
        return null;
    }

    public void deleteProduct(Long id) { productRepository.deleteById(id); }

    public Optional<Product> getProductById(Long id) { return productRepository.findById(id); }
}