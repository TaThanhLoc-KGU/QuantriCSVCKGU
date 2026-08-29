package com.ttloc.qtcsvc.congvanlink.internal;

import com.ttloc.qtcsvc.congvanlink.CongVanIncomingDocument;
import com.ttloc.qtcsvc.congvanlink.CongVanOutgoingDocument;
import com.ttloc.qtcsvc.shared.NotFoundException;
import com.ttloc.qtcsvc.tasks.Task;
import com.ttloc.qtcsvc.tasks.TaskCreationService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
 * Doi chieu van ban voi he thong Cong van (congvan.vnkgu.edu.vn) - chi doc,
 * moi nguoi dang nhap deu xem duoc (giong cac module noi bo khac), khong
 * phan quyen rieng.
 * - Van ban DEN duoc giao/phoi hop cho phong: doc thang qua SQL Server
 *   (CongVanRepository, can Windows Integrated Auth).
 * - Van ban DI da cong khai: doc qua API cong khai (CongVanPublicApiClient,
 *   khong can dang nhap, chay tot tren moi he dieu hanh).
 */
@RestController
@RequestMapping("/api/admin/congvan")
class CongVanAdminController {

    private final CongVanRepository repository;
    private final CongVanPublicApiClient publicApiClient;
    private final TaskCreationService taskCreationService;

    CongVanAdminController(CongVanRepository repository, CongVanPublicApiClient publicApiClient, TaskCreationService taskCreationService) {
        this.repository = repository;
        this.publicApiClient = publicApiClient;
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

    @GetMapping("/outgoing")
    CongVanPublicApiDtos.ListResponse outgoing(
            @RequestParam(required = false) Integer nam,
            @RequestParam(required = false) Integer maSCV,
            @RequestParam(required = false) Integer maLVB,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return publicApiClient.list(nam, maSCV, maLVB, q, page, pageSize);
    }

    @GetMapping("/outgoing/danh-muc")
    CongVanPublicApiDtos.CategoriesResponse outgoingCategories() {
        return publicApiClient.categories();
    }

    @PostMapping("/outgoing/{id}/create-task")
    ResponseEntity<Task> createTaskFromOutgoing(@PathVariable String id) {
        CongVanOutgoingDocument doc = publicApiClient.detail(id);
        if (doc == null) {
            throw new NotFoundException("Khong tim thay van ban di cong khai: " + id);
        }

        String title = "[Công văn đi " + doc.soVanBan() + "] " + doc.trichYeu();
        String description = "Văn bản đi công khai từ hệ thống Công văn (%s).\nLoại: %s\nĐơn vị soạn thảo: %s\nNgười ký: %s"
                .formatted(doc.id(), doc.loaiVanBan() != null ? doc.loaiVanBan() : "—",
                        doc.donViSoanThao() != null ? doc.donViSoanThao() : "—", doc.nguoiKy() != null ? doc.nguoiKy() : "—");
        Task task = taskCreationService.createSystemDeptTask(title, description);
        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }

    @GetMapping("/outgoing/{id}/file")
    ResponseEntity<byte[]> outgoingFile(@PathVariable String id) {
        String[] contentType = new String[1];
        byte[] body = publicApiClient.downloadFile(id, contentType);
        if (body == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType[0]))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(body);
    }

}
