package com.ttloc.qtcsvc.documentregister.internal;

import com.ttloc.qtcsvc.documentregister.DocumentNumber;
import com.ttloc.qtcsvc.documentregister.DocumentType;
import com.ttloc.qtcsvc.identity.CurrentUser;
import com.ttloc.qtcsvc.shared.ConflictException;
import com.ttloc.qtcsvc.shared.NotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
class DocumentNumberService {

    private final DocumentNumberRepository repository;
    private final DocumentTypeService documentTypeService;

    DocumentNumberService(DocumentNumberRepository repository, DocumentTypeService documentTypeService) {
        this.repository = repository;
        this.documentTypeService = documentTypeService;
    }

    List<DocumentNumber> list(Long documentTypeId, int year) {
        return repository.findByDocumentTypeIdAndYearOrderByNumberInt(documentTypeId, year);
    }

    int nextNumber(Long documentTypeId, int year) {
        return repository.findMaxNumberInt(documentTypeId, year) + 1;
    }

    DocumentNumber get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Khong tim thay so van ban: " + id));
    }

    DocumentNumber create(CurrentUser currentUser, DocumentNumberRequest request) {
        validate(request);
        DocumentType type = documentTypeService.get(request.documentTypeId());
        checkDuplicate(type, request.year(), request.numberInt(), request.confirmDuplicate());

        DocumentNumber dn = new DocumentNumber(null, type.id(), request.year(), request.numberInt(),
                numberDisplay(type, request.numberInt()), request.title(), request.person(), request.issueDate(),
                request.note(), request.senderUnit(), request.originalRef(), request.receivedDate(),
                currentUser.id(), Instant.now(), null, null, null, null, null);
        return repository.save(dn);
    }

    DocumentNumber update(CurrentUser currentUser, Long id, DocumentNumberRequest request) {
        DocumentNumber existing = get(id);
        assertCanEdit(currentUser, existing);

        Long typeId = request.documentTypeId() != null ? request.documentTypeId() : existing.documentTypeId();
        DocumentType type = documentTypeService.get(typeId);
        int year = request.year() != null ? request.year() : existing.year();
        int numberInt = request.numberInt() != null ? request.numberInt() : existing.numberInt();

        boolean numberChanged = !typeId.equals(existing.documentTypeId()) || year != existing.year() || numberInt != existing.numberInt();
        if (numberChanged) {
            checkDuplicate(type, year, numberInt, request.confirmDuplicate());
        }

        DocumentNumber updated = new DocumentNumber(
                existing.id(),
                type.id(),
                year,
                numberInt,
                numberDisplay(type, numberInt),
                request.title() != null ? request.title() : existing.title(),
                request.person() != null ? request.person() : existing.person(),
                request.issueDate() != null ? request.issueDate() : existing.issueDate(),
                request.note() != null ? request.note() : existing.note(),
                request.senderUnit() != null ? request.senderUnit() : existing.senderUnit(),
                request.originalRef() != null ? request.originalRef() : existing.originalRef(),
                request.receivedDate() != null ? request.receivedDate() : existing.receivedDate(),
                existing.createdBy(),
                existing.createdAt(),
                existing.senderEmail(), existing.senderPhone(), existing.attachmentUrl(), existing.attachmentName(), existing.taskId());
        return repository.save(updated);
    }

    void delete(CurrentUser currentUser, Long id) {
        DocumentNumber existing = get(id);
        assertCanEdit(currentUser, existing);
        repository.deleteById(id);
    }

    private void validate(DocumentNumberRequest request) {
        if (request.documentTypeId() == null) {
            throw new IllegalArgumentException("Phai chon loai van ban");
        }
        if (request.year() == null) {
            throw new IllegalArgumentException("Phai co nam");
        }
        if (request.numberInt() == null || request.numberInt() <= 0) {
            throw new IllegalArgumentException("So van ban phai lon hon 0");
        }
        if (request.title() == null || request.title().isBlank()) {
            throw new IllegalArgumentException("Trich yeu khong duoc de trong");
        }
        if (request.issueDate() == null) {
            throw new IllegalArgumentException("Phai co ngay ban hanh");
        }
    }

    private void checkDuplicate(DocumentType type, int year, int numberInt, Boolean confirmDuplicate) {
        if (repository.existsByDocumentTypeIdAndYearAndNumberInt(type.id(), year, numberInt)
                && !Boolean.TRUE.equals(confirmDuplicate)) {
            throw new ConflictException("So " + numberInt + " da ton tai trong nam " + year
                    + " cho loai \"" + type.name() + "\". Xac nhan (confirmDuplicate=true) de van luu.");
        }
    }

    private void assertCanEdit(CurrentUser currentUser, DocumentNumber dn) {
        if (!currentUser.isEditorOrAdmin() && !currentUser.id().equals(dn.createdBy())) {
            throw new AccessDeniedException("Ban chi duoc sua/xoa dong so van ban cua chinh minh");
        }
    }

    private String numberDisplay(DocumentType type, int numberInt) {
        return String.format("%02d/%s", numberInt, type.symbolCode());
    }

}
