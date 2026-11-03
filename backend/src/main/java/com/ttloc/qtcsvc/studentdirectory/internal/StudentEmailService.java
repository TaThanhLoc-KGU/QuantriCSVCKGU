package com.ttloc.qtcsvc.studentdirectory.internal;

import com.ttloc.qtcsvc.studentdirectory.StudentEmailRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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
        Map<String, StudentEmailRecord> unique = dedupe(result.records());
        Map<String, StudentEmailRecord> existing = existingByStudentId();
        int updates = (int) unique.keySet().stream().filter(existing::containsKey).count();
        return new ImportPreview(unique.size(), unique.size() - updates, updates, errorMessages);
    }

    /**
     * Gop them vao danh sach hien co: MSSV chua co thi them moi, MSSV da co thi
     * cap nhat thong tin theo file. Khong xoa ban ghi nao.
     */
    @Transactional
    ImportResult commit(MultipartFile file) {
        StudentEmailExcelParser.ParseResult result = parseFile(file);
        if (result.records().isEmpty()) {
            throw new IllegalArgumentException("Không có dòng hợp lệ nào để nhập.");
        }
        Map<String, StudentEmailRecord> existing = existingByStudentId();
        List<StudentEmailRecord> toSave = new ArrayList<>();
        int added = 0;
        int updated = 0;
        for (StudentEmailRecord r : dedupe(result.records()).values()) {
            StudentEmailRecord old = existing.get(r.studentId());
            if (old == null) {
                toSave.add(r);
                added++;
            } else {
                toSave.add(new StudentEmailRecord(old.id(), r.studentId(), r.fullName(), r.className(), r.major(),
                        r.majorCode(), r.cohort(), r.email(), r.importedAt()));
                updated++;
            }
        }
        repository.saveAll(toSave);
        return new ImportResult(added, updated);
    }

    private Map<String, StudentEmailRecord> dedupe(List<StudentEmailRecord> records) {
        Map<String, StudentEmailRecord> unique = new LinkedHashMap<>();
        for (StudentEmailRecord r : records) {
            unique.put(r.studentId(), r);
        }
        return unique;
    }

    private Map<String, StudentEmailRecord> existingByStudentId() {
        Map<String, StudentEmailRecord> map = new HashMap<>();
        for (StudentEmailRecord r : repository.findAll()) {
            map.put(r.studentId(), r);
        }
        return map;
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
