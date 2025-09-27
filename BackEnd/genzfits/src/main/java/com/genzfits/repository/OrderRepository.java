// src/main/java/com/genzfits/repository/OrderRepository.java
package com.genzfits.repository;

import com.genzfits.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser_Id(Long userId);
    List<Order> findByStatus(String status);
}