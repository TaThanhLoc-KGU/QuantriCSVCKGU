package com.ttloc.qtcsvc.documentregister.internal;

import com.ttloc.qtcsvc.documentregister.DocumentType;
import com.ttloc.qtcsvc.shared.ConflictException;
import com.ttloc.qtcsvc.shared.NotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DocumentTypeService {

    private final DocumentTypeRepository repository;

    DocumentTypeService(DocumentTypeRepository repository) {
        this.repository = repository;
    }

    public List<DocumentType> listActive() {
        return repository.findByActiveTrueOrderBySortOrder();
    }

    List<DocumentType> listAll() {
        return repository.findAll();
    }

    public DocumentType get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Khong tim thay loai van ban: " + id));
    }

    DocumentType create(DocumentTypeRequest request) {
        if (request.code() == null || request.code().isBlank()) {
            throw new IllegalArgumentException("Ma loai van ban khong duoc de trong");
        }
        if (request.symbolCode() == null || request.symbolCode().isBlank()) {
            throw new IllegalArgumentException("Ky hieu (symbolCode) khong duoc de trong");
        }
        if (request.direction() == null) {
            throw new IllegalArgumentException("Phai chon huong van ban (OUTGOING/INCOMING)");
        }
        if (repository.existsByCode(request.code())) {
            throw new ConflictException("Ma loai van ban da ton tai: " + request.code());
        }
        DocumentType type = new DocumentType(null, request.code(), request.name(), request.symbolCode(),
                request.direction(), request.resetYearly() == null || request.resetYearly(),
                request.sortOrder() == null ? 0 : request.sortOrder(), request.active() == null || request.active());
        return repository.save(type);
    }

    DocumentType update(Long id, DocumentTypeRequest request) {
        DocumentType existing = get(id);
        DocumentType updated = new DocumentType(
                existing.id(),
                existing.code(),
                request.name() != null ? request.name() : existing.name(),
                request.symbolCode() != null ? request.symbolCode() : existing.symbolCode(),
                request.direction() != null ? request.direction() : existing.direction(),
                request.resetYearly() != null ? request.resetYearly() : existing.resetYearly(),
                request.sortOrder() != null ? request.sortOrder() : existing.sortOrder(),
                request.active() != null ? request.active() : existing.active());
        return repository.save(updated);
    }

    void delete(Long id) {
        get(id);
        repository.deleteById(id);
    }

}
