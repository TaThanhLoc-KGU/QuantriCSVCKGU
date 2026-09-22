package com.ttloc.qtcsvc.identity;

import com.ttloc.qtcsvc.identity.internal.MemberRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * API cong khai cua module identity de cac module khac (vd tasks - chon nguoi
 * phu trach) doc du lieu Member ma khong dung thang MemberRepository.
 */
@Service
public class MemberQueryService {

    private final MemberRepository repository;

    public MemberQueryService(MemberRepository repository) {
        this.repository = repository;
    }

    public List<Member> listActive() {
        return repository.findAllByActiveTrueOrderBySortOrder();
    }

    public Optional<Member> findById(Long id) {
        return repository.findById(id);
    }

}
