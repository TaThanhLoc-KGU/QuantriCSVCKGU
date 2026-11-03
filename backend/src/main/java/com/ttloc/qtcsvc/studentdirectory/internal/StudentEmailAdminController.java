package com.ttloc.qtcsvc.studentdirectory.internal;

import com.ttloc.qtcsvc.studentdirectory.StudentEmailRecord;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

import static com.ttloc.qtcsvc.studentdirectory.internal.StudentEmailDtos.ImportPreview;
import static com.ttloc.qtcsvc.studentdirectory.internal.StudentEmailDtos.ImportResult;

@RestController
@RequestMapping("/api/admin/student-emails")
class StudentEmailAdminController {

    private final StudentEmailService service;

    StudentEmailAdminController(StudentEmailService service) {
        this.service = service;
    }

    @GetMapping
    Map<String, Object> list(@RequestParam(defaultValue = "") String q) {
        List<StudentEmailRecord> items = service.search(q, 50);
        return Map.of("total", service.count(), "items", items);
    }

    /**
     * preview=true (mac dinh): chi doc + kiem tra, tra so dong hop le/loi,
     * KHONG ghi DB. preview=false: them MSSV moi + cap nhat MSSV da co, khong xoa.
     */
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    Object importExcel(@RequestParam(defaultValue = "true") boolean preview, @RequestParam("file") MultipartFile file) {
        if (preview) {
            ImportPreview result = service.preview(file);
            return result;
        }
        ImportResult result = service.commit(file);
        return result;
    }

}
