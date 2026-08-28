package com.ttloc.qtcsvc.documentregister.internal;

import com.ttloc.qtcsvc.documentregister.DocumentNumber;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DocumentNumberRepository extends ListCrudRepository<DocumentNumber, Long> {

    List<DocumentNumber> findByDocumentTypeIdAndYearOrderByNumberInt(Long documentTypeId, int year);

    boolean existsByDocumentTypeIdAndYearAndNumberInt(Long documentTypeId, int year, int numberInt);

    List<DocumentNumber> findByTaskId(Long taskId);

    @Query("SELECT COALESCE(MAX(number_int), 0) FROM document_numbers WHERE document_type_id = :typeId AND year = :year")
    int findMaxNumberInt(@Param("typeId") Long typeId, @Param("year") int year);

}
