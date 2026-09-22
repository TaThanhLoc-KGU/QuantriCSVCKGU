package com.ttloc.qtcsvc.studentdirectory.internal;

import com.ttloc.qtcsvc.studentdirectory.StudentEmailRecord;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

interface StudentEmailRepository extends ListCrudRepository<StudentEmailRecord, Long> {

    Optional<StudentEmailRecord> findByStudentId(String studentId);

    @Query("""
            SELECT * FROM student_emails
            WHERE :q = '' OR student_id ILIKE '%' || :q || '%' OR full_name ILIKE '%' || :q || '%' OR email ILIKE '%' || :q || '%'
            ORDER BY student_id
            LIMIT :limit
            """)
    List<StudentEmailRecord> search(@Param("q") String q, @Param("limit") int limit);

}
