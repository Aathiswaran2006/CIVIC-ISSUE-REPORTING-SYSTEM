package com.sih.portal.repository;

import com.sih.portal.entity.ComplaintProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComplaintProgressRepository extends JpaRepository<ComplaintProgress, String> {
}
