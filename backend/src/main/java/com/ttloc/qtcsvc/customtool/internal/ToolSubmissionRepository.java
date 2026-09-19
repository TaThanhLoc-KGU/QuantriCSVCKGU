package com.ttloc.qtcsvc.customtool.internal;

import com.ttloc.qtcsvc.customtool.CustomToolSubmission;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;
import java.util.Optional;

interface ToolSubmissionRepository extends ListCrudRepository<CustomToolSubmission, Long> {

    List<CustomToolSubmission> findByToolIdOrderByCreatedAtDesc(Long toolId);

    Optional<CustomToolSubmission> findByToolIdAndCodeIgnoreCase(Long toolId, String code);

    boolean existsByCode(String code);

    long countByToolIdAndStatus(Long toolId, String status);

}
