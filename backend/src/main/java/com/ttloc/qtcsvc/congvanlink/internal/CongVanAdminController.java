package com.ttloc.qtcsvc.congvanlink.internal;

import com.ttloc.qtcsvc.congvanlink.CongVanIncomingDocument;
import com.ttloc.qtcsvc.shared.NotFoundException;
import com.ttloc.qtcsvc.tasks.Task;
import com.ttloc.qtcsvc.tasks.TaskCreationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * Doi chieu van ban den tu he thong Cong van (congvan.vnkgu.edu.vn) duoc
 * giao/phoi hop cho phong - chi doc, moi nguoi dang nhap deu xem duoc
 * (giong cac module noi bo khac), khong phan quyen rieng.
 */
@RestController
@RequestMapping("/api/admin/congvan")
class CongVanAdminController {

    private final CongVanRepository repository;
    private final TaskCreationService taskCreationService;

    CongVanAdminController(CongVanRepository repository, TaskCreationService taskCreationService) {
        this.repository = repository;
        this.taskCreationService = taskCreationService;
    }

    @GetMapping("/incoming")
    List<CongVanIncomingDocument> incoming(@RequestParam(required = false) Integer year) {
        return repository.findIncoming(year != null ? year : LocalDate.now().getYear());
    }

    @PostMapping("/incoming/{mscv}/create-task")
    ResponseEntity<Task> createTask(@PathVariable String mscv, @RequestParam int year) {
        CongVanIncomingDocument doc = repository.findIncoming(year).stream()
                .filter(d -> d.mscv().equals(mscv))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Khong tim thay van ban Cong van: " + mscv));

        String title = "[Công văn " + (doc.soCV() != null ? doc.soCV() : doc.mscv()) + "] " + doc.trichYeu();
        String description = "Văn bản đến từ hệ thống Công văn (%s).\nCơ quan ban hành: %s\nNgười ký: %s"
                .formatted(doc.mscv(), doc.tenCoQuan() != null ? doc.tenCoQuan() : "—", doc.nguoiKy() != null ? doc.nguoiKy() : "—");
        Task task = taskCreationService.createSystemDeptTask(title, description);
        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }

}
