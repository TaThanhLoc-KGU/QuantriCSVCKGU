package com.ttloc.qtcsvc.documentregister;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.time.LocalDate;

@Table("document_numbers")
public record DocumentNumber(
        @Id Long id,
        Long documentTypeId,
        int year,
        int numberInt,
        String numberDisplay,
        String title,
        String person,
        LocalDate issueDate,
        String note,
        String senderUnit,
        String originalRef,
        LocalDate receivedDate,
        Long createdBy,
        Instant createdAt,
        String senderEmail,
        String senderPhone,
        String attachmentUrl,
        String attachmentName,
        Long taskId
) {
}
