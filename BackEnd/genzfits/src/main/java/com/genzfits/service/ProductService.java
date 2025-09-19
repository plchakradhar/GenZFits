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

    public Product saveProduct(Product product) { return productRepository.save(product); }

    public Product updateProduct(Long id, Product productDetails) {
        Optional<Product> product = productRepository.findById(id);
        if (product.isPresent()) {
            Product existing = product.get();
            existing.setName(productDetails.getName());
            existing.setPrice(productDetails.getPrice());
            existing.setCategory(productDetails.getCategory());
            existing.setDescription(productDetails.getDescription());
            existing.setImage(productDetails.getImage());
            existing.setStock(productDetails.getStock());
            return productRepository.save(existing);
        }
        return null;
    }

    public void deleteProduct(Long id) { productRepository.deleteById(id); }

    public Optional<Product> getProductById(Long id) { return productRepository.findById(id); }
}
