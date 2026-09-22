package com.ttloc.qtcsvc.studentdirectory.internal;

import com.ttloc.qtcsvc.studentdirectory.StudentEmailRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static com.ttloc.qtcsvc.studentdirectory.internal.StudentEmailDtos.ImportPreview;
import static com.ttloc.qtcsvc.studentdirectory.internal.StudentEmailDtos.ImportResult;

@Service
class StudentEmailService {

    private final StudentEmailRepository repository;
    private final StudentEmailExcelParser parser;

    StudentEmailService(StudentEmailRepository repository, StudentEmailExcelParser parser) {
        this.repository = repository;
        this.parser = parser;
    }

    ImportPreview preview(MultipartFile file) {
        StudentEmailExcelParser.ParseResult result = parseFile(file);
        List<String> errorMessages = result.errors().stream()
                .map(e -> "Dòng " + e.rowNumber() + ": " + e.message())
                .limit(20)
                .toList();
        return new ImportPreview(result.records().size(), errorMessages);
    }

    /**
     * Thay the toan bo danh sach hien co bang du lieu trong file (xoa het +
     * chen lai) - moi lan nhap la 1 ban ghi danh sach day du (vd khi co khoa
     * moi), khong phai gop them.
     */
    @Transactional
    ImportResult commit(MultipartFile file) {
        StudentEmailExcelParser.ParseResult result = parseFile(file);
        if (result.records().isEmpty()) {
            throw new IllegalArgumentException("Không có dòng hợp lệ nào để nhập.");
        }
        repository.deleteAll();
        repository.saveAll(result.records());
        return new ImportResult(result.records().size());
    }

    private StudentEmailExcelParser.ParseResult parseFile(MultipartFile file) {
        try {
            return parser.parse(file.getInputStream());
        } catch (IOException e) {
            throw new IllegalStateException("Không đọc được file", e);
        }
    }

    long count() {
        return repository.count();
    }

    List<StudentEmailRecord> search(String q, int limit) {
        return repository.search(q == null ? "" : q.trim(), limit);
    }

    /**
     * Tra cuu cong khai bang MSSV - chi tra ve du lieu can hien thi (khong ho
     * ten dem/ngay sinh/gioi tinh/mat khau), va yeu cau khop CHINH XAC MSSV
     * (khong cho tim mo ho) de tranh do liet danh sach.
     */
    Optional<StudentEmailDtos.LookupResult> lookup(String studentId) {
        if (studentId == null || studentId.isBlank()) {
            return Optional.empty();
        }
        return repository.findByStudentId(studentId.trim())
                .map(r -> new StudentEmailDtos.LookupResult(r.studentId(), r.fullName(), r.className(), r.major(), r.email()));
    }

}
