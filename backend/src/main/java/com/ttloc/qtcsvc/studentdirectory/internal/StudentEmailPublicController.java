package com.ttloc.qtcsvc.studentdirectory.internal;

import com.ttloc.qtcsvc.shared.NotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import static com.ttloc.qtcsvc.studentdirectory.internal.StudentEmailDtos.LookupResult;

@RestController
@RequestMapping("/api/public/student-emails")
class StudentEmailPublicController {

    private final StudentEmailService service;

    StudentEmailPublicController(StudentEmailService service) {
        this.service = service;
    }

    @GetMapping("/lookup")
    LookupResult lookup(@RequestParam String studentId) {
        return service.lookup(studentId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sinh viên với mã số này."));
    }

}
