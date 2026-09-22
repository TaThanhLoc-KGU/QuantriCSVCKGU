package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.Banner;
import com.ttloc.qtcsvc.shared.NotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
class BannerService {

    private final BannerRepository repository;

    BannerService(BannerRepository repository) {
        this.repository = repository;
    }

    List<Banner> listAll() {
        return repository.findAll();
    }

    List<Banner> publicList() {
        return repository.findVisible(LocalDate.now());
    }

    Banner create(BannerRequest request) {
        if (request.title() == null || request.title().isBlank()) {
            throw new IllegalArgumentException("Tieu de banner khong duoc de trong");
        }
        if (request.imageUrl() == null || request.imageUrl().isBlank()) {
            throw new IllegalArgumentException("Banner phai co anh");
        }
        Banner banner = new Banner(null, request.title(), request.imageUrl(), request.linkUrl(),
                request.sortOrder() == null ? 0 : request.sortOrder(),
                request.active() == null || request.active(),
                request.startDate(), request.endDate());
        return repository.save(banner);
    }

    Banner update(Long id, BannerRequest request) {
        Banner existing = findOrThrow(id);
        Banner updated = new Banner(
                existing.id(),
                request.title() != null ? request.title() : existing.title(),
                request.imageUrl() != null ? request.imageUrl() : existing.imageUrl(),
                request.linkUrl() != null ? request.linkUrl() : existing.linkUrl(),
                request.sortOrder() != null ? request.sortOrder() : existing.sortOrder(),
                request.active() != null ? request.active() : existing.active(),
                request.startDate() != null ? request.startDate() : existing.startDate(),
                request.endDate() != null ? request.endDate() : existing.endDate());
        return repository.save(updated);
    }

    void delete(Long id) {
        findOrThrow(id);
        repository.deleteById(id);
    }

    private Banner findOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Khong tim thay banner: " + id));
    }

}
