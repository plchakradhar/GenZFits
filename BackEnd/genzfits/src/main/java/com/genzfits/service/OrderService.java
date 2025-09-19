package com.genzfits.service;

import com.genzfits.model.Order;
import com.genzfits.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    public List<Order> getAllOrders() { return orderRepository.findAll(); }

    public Order updateOrderStatus(Long id, String status) {
        Optional<Order> order = orderRepository.findById(id);
        if (order.isPresent()) {
            Order existing = order.get();
            existing.setStatus(status);
            return orderRepository.save(existing);
        }
        return null;
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }
}
