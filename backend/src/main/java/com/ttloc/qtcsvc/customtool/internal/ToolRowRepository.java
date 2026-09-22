package com.ttloc.qtcsvc.customtool.internal;

import com.ttloc.qtcsvc.customtool.CustomToolRow;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

interface ToolRowRepository extends ListCrudRepository<CustomToolRow, Long> {

    @Query("SELECT * FROM custom_tool_rows WHERE tool_id = :toolId AND lower(key_value) = lower(:key) LIMIT 1")
    Optional<CustomToolRow> findByKey(@Param("toolId") Long toolId, @Param("key") String key);

    @Query("""
            SELECT * FROM custom_tool_rows WHERE tool_id = :toolId
              AND (:q = '' OR key_value ILIKE '%' || :q || '%' OR data::text ILIKE '%' || :q || '%')
            ORDER BY id LIMIT :limit
            """)
    List<CustomToolRow> search(@Param("toolId") Long toolId, @Param("q") String q, @Param("limit") int limit);

    long countByToolId(Long toolId);

    @Modifying
    @Query("DELETE FROM custom_tool_rows WHERE tool_id = :toolId")
    void deleteAllByTool(@Param("toolId") Long toolId);

}
