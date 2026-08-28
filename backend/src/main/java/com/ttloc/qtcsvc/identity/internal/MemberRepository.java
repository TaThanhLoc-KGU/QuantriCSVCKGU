package com.ttloc.qtcsvc.identity.internal;

import com.ttloc.qtcsvc.identity.Member;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;

public interface MemberRepository extends ListCrudRepository<Member, Long> {

    List<Member> findAllByActiveTrueOrderBySortOrder();

}
