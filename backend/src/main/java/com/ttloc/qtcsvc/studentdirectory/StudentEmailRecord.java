package com.ttloc.qtcsvc.studentdirectory;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

/**
 * 1 dong trong danh ba email sinh vien, nhap tu file Excel danh sach do
 * phong Dao tao cung cap (MSSV -> email truong cap). Chi luu du lieu can cho
 * tra cuu cong khai - khong luu ngay sinh/gioi tinh/mat khau du file goc co the co.
 */
@Table("student_emails")
public record StudentEmailRecord(
        @Id Long id,
        String studentId,
        String fullName,
        String className,
        String major,
        String majorCode,
        String cohort,
        String email,
        Instant importedAt
) {
}
