// src/main/java/com/genzfits/repository/UserRepository.java
package com.genzfits.repository;

import com.genzfits.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);
    boolean existsByMobile(String mobile);

    Optional<User> findByUsername(String username);

    @Query("SELECT u FROM User u WHERE u.username = :identifier OR u.mobile = :identifier")
    Optional<User> findByIdentifier(@Param("identifier") String identifier);
}