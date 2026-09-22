package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.Form;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FormRepository extends ListCrudRepository<Form, Long> {

    List<Form> findByActiveTrueOrderByTitle();

    List<Form> findByCategoryIdAndActiveTrueOrderByTitle(Long categoryId);

    @Modifying
    @Query("UPDATE forms SET download_count = download_count + 1 WHERE id = :id")
    void incrementDownloadCount(@Param("id") Long id);

}
