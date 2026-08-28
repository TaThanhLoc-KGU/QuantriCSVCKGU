package com.ttloc.qtcsvc.documentregister.internal;

import com.ttloc.qtcsvc.documentregister.DocumentType;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentTypeRepository extends ListCrudRepository<DocumentType, Long> {

    List<DocumentType> findByActiveTrueOrderBySortOrder();

    Optional<DocumentType> findByCode(String code);

    boolean existsByCode(String code);

}
