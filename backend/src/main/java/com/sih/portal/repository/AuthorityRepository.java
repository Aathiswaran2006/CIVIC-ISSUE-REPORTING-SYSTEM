package com.sih.portal.repository;

import com.sih.portal.entity.Authority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AuthorityRepository extends JpaRepository<Authority, String> {
    Optional<Authority> findByNameAndPinCode(String name, String pinCode);
    Optional<Authority> findByPinCode(String pinCode);
}
