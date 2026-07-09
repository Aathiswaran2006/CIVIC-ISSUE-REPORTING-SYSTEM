package com.sih.portal.repository;

import com.sih.portal.entity.Citizen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CitizenRepository extends JpaRepository<Citizen, String> {
    Optional<Citizen> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}
