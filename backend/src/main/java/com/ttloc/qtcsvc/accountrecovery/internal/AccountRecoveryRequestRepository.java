package com.ttloc.qtcsvc.accountrecovery.internal;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

interface AccountRecoveryRequestRepository extends ListCrudRepository<AccountRecoveryRequest, Long> {

    List<AccountRecoveryRequest> findAllByOrderByCreatedAtDesc();

    boolean existsByCaseCode(String caseCode);

    // Tra cuu bang DUY NHAT 1 trong 4 dinh danh (khong bat buoc nhap het) -
    // khop chinh xac (khong phan biet hoa/thuong voi ma ho so). Neu trung
    // nhieu ho so (vd 1 nguoi gui nhieu lan), lay ho so moi nhat.
    @Query("""
            SELECT * FROM account_recovery_requests
            WHERE UPPER(case_code) = UPPER(:q) OR student_id = :q OR phone = :q OR cccd_number = :q
            ORDER BY created_at DESC
            LIMIT 1
            """)
    Optional<AccountRecoveryRequest> findFirstByAnyIdentifier(@Param("q") String query);

}
