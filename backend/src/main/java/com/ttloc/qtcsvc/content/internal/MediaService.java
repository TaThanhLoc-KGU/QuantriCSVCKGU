package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.MediaFile;
import com.ttloc.qtcsvc.shared.FileStorageService;
import com.ttloc.qtcsvc.shared.NotFoundException;
import com.ttloc.qtcsvc.shared.StoredObject;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

@Service
class MediaService {

    private final MediaFileRepository repository;
    private final FileStorageService storage;

    MediaService(MediaFileRepository repository, FileStorageService storage) {
        this.repository = repository;
        this.storage = storage;
    }

    List<MediaFile> list(String folder) {
        List<MediaFile> all = repository.findAll();
        return folder == null || folder.isBlank()
                ? all
                : all.stream().filter(m -> folder.equals(m.folder())).toList();
    }

    MediaFile get(Long id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Khong tim thay file: " + id));
    }

    MediaFile upload(String folder, MultipartFile file, Long uploadedBy) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Chua chon file de tai len");
        }
        StoredObject stored;
        try {
            stored = storage.upload(folder, file.getOriginalFilename(), file.getContentType(),
                    file.getInputStream(), file.getSize());
        } catch (IOException e) {
            throw new IllegalStateException("Khong doc duoc noi dung file upload", e);
        }

        MediaFile saved = repository.save(new MediaFile(null, stored.objectKey(), stored.originalName(),
                "", file.getContentType(), file.getSize(), folder, uploadedBy, Instant.now()));
        // Can id sinh ra de dung lam URL cong khai -> luu lai lan 2.
        return repository.save(new MediaFile(saved.id(), saved.fileName(), saved.originalName(),
                "/api/public/media/" + saved.id(), saved.mimeType(), saved.size(), saved.folder(),
                saved.uploadedBy(), saved.createdAt()));
    }

    void delete(Long id) {
        MediaFile file = get(id);
        storage.delete(file.fileName());
        repository.deleteById(id);
    }

}
