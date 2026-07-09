package com.sih.portal.repository;

import com.sih.portal.entity.ArchiveComplaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArchiveComplaintRepository extends JpaRepository<ArchiveComplaint, String> {
}
