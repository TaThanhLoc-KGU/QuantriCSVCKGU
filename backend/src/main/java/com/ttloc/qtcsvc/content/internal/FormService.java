package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.Form;
import com.ttloc.qtcsvc.content.MediaFile;
import com.ttloc.qtcsvc.shared.FileStorageService;
import com.ttloc.qtcsvc.shared.NotFoundException;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.time.Instant;
import java.util.List;

@Service
class FormService {

    private final FormRepository repository;
    private final MediaFileRepository mediaFileRepository;
    private final CategoryService categoryService;
    private final FileStorageService storage;

    FormService(FormRepository repository, MediaFileRepository mediaFileRepository,
                CategoryService categoryService, FileStorageService storage) {
        this.repository = repository;
        this.mediaFileRepository = mediaFileRepository;
        this.categoryService = categoryService;
        this.storage = storage;
    }

    record DownloadPayload(InputStream stream, String fileName, String contentType) {
    }

    List<Form> listAll() {
        return repository.findAll();
    }

    List<Form> publicList(Long categoryId, String q) {
        List<Form> forms = categoryId != null
                ? repository.findByCategoryIdAndActiveTrueOrderByTitle(categoryId)
                : repository.findByActiveTrueOrderByTitle();
        if (q == null || q.isBlank()) {
            return forms;
        }
        String needle = q.toLowerCase();
        return forms.stream().filter(f -> f.title() != null && f.title().toLowerCase().contains(needle)).toList();
    }

    Form get(Long id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Khong tim thay bieu mau: " + id));
    }

    Form create(FormRequest request) {
        if (request.title() == null || request.title().isBlank()) {
            throw new IllegalArgumentException("Ten bieu mau khong duoc de trong");
        }
        if (request.categoryId() == null) {
            throw new IllegalArgumentException("Phai chon danh muc");
        }
        if (request.fileId() == null) {
            throw new IllegalArgumentException("Phai dinh kem file");
        }
        categoryService.get(request.categoryId());
        requireMediaFile(request.fileId());

        Instant now = Instant.now();
        Form form = new Form(null, request.title(), request.description(), request.categoryId(), request.fileId(),
                request.version(), 0, request.active() == null || request.active(), now, now);
        return repository.save(form);
    }

    Form update(Long id, FormRequest request) {
        Form existing = get(id);
        if (request.categoryId() != null) {
            categoryService.get(request.categoryId());
        }
        if (request.fileId() != null) {
            requireMediaFile(request.fileId());
        }
        Form updated = new Form(
                existing.id(),
                request.title() != null ? request.title() : existing.title(),
                request.description() != null ? request.description() : existing.description(),
                request.categoryId() != null ? request.categoryId() : existing.categoryId(),
                request.fileId() != null ? request.fileId() : existing.fileId(),
                request.version() != null ? request.version() : existing.version(),
                existing.downloadCount(),
                request.active() != null ? request.active() : existing.active(),
                existing.createdAt(),
                Instant.now());
        return repository.save(updated);
    }

    void delete(Long id) {
        get(id);
        repository.deleteById(id);
    }

    DownloadPayload download(Long id) {
        Form form = get(id);
        MediaFile file = requireMediaFile(form.fileId());
        repository.incrementDownloadCount(id);
        return new DownloadPayload(storage.open(file.fileName()), file.originalName(), file.mimeType());
    }

    private MediaFile requireMediaFile(Long fileId) {
        return mediaFileRepository.findById(fileId)
                .orElseThrow(() -> new NotFoundException("File dinh kem khong ton tai: " + fileId));
    }

}
