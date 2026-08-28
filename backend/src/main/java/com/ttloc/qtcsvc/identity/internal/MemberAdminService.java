package com.ttloc.qtcsvc.identity.internal;

import com.ttloc.qtcsvc.identity.Member;
import com.ttloc.qtcsvc.shared.NotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
class MemberAdminService {

    private final MemberRepository repository;

    MemberAdminService(MemberRepository repository) {
        this.repository = repository;
    }

    List<Member> listAll() {
        return repository.findAll();
    }

    Member create(MemberRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Ten nhan su khong duoc de trong");
        }
        Member member = new Member(null, request.name(), request.position(), request.email(), request.phone(),
                request.active() == null || request.active(),
                request.sortOrder() == null ? 0 : request.sortOrder());
        return repository.save(member);
    }

    Member update(Long id, MemberRequest request) {
        Member existing = findOrThrow(id);
        Member updated = new Member(
                existing.id(),
                request.name() != null ? request.name() : existing.name(),
                request.position() != null ? request.position() : existing.position(),
                request.email() != null ? request.email() : existing.email(),
                request.phone() != null ? request.phone() : existing.phone(),
                request.active() != null ? request.active() : existing.active(),
                request.sortOrder() != null ? request.sortOrder() : existing.sortOrder());
        return repository.save(updated);
    }

    void delete(Long id) {
        findOrThrow(id);
        repository.deleteById(id);
    }

    private Member findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Khong tim thay nhan su: " + id));
    }

}
