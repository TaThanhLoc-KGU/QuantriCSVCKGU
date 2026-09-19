package com.ttloc.qtcsvc.customtool.internal;

import com.ttloc.qtcsvc.shared.FileTypeSupport;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import static com.ttloc.qtcsvc.customtool.internal.ToolService.RowView;
import static com.ttloc.qtcsvc.customtool.internal.ToolService.SubmissionView;
import static com.ttloc.qtcsvc.customtool.internal.ToolService.ToolRequest;
import static com.ttloc.qtcsvc.customtool.internal.ToolService.ToolView;

/** Quan tri bo cong cu tu tao chuc nang: tao/sua cong cu, xem ho so gui len, nhap du lieu tra cuu. */
@RestController
@RequestMapping("/api/admin/tools")
class ToolAdminController {

    record StatusRequest(String status, String resultMessage) {
    }

    record KeyRequest(String keyColumn) {
    }

    private final ToolService service;

    ToolAdminController(ToolService service) {
        this.service = service;
    }

    @GetMapping
    List<ToolView> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    ToolView get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    ResponseEntity<ToolView> create(@RequestBody ToolRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PutMapping("/{id}")
    ToolView update(@PathVariable Long id, @RequestBody ToolRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ---- FORM: ho so gui len ----

    @GetMapping("/{id}/submissions")
    List<SubmissionView> submissions(@PathVariable Long id) {
        return service.submissionsOf(id);
    }

    @PatchMapping("/submissions/{sid}")
    SubmissionView updateSubmission(@PathVariable Long sid, @RequestBody StatusRequest req) {
        return service.updateSubmission(sid, req.status(), req.resultMessage());
    }

    @DeleteMapping("/submissions/{sid}")
    ResponseEntity<Void> deleteSubmission(@PathVariable Long sid) {
        service.deleteSubmission(sid);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/submissions/{sid}/files/{fieldKey}")
    ResponseEntity<byte[]> file(@PathVariable Long sid, @PathVariable String fieldKey) throws IOException {
        Map<String, Object> f = service.fileOf(sid, fieldKey);
        String key = f.get("objectKey").toString();
        String name = String.valueOf(f.get("name"));
        try (InputStream in = service.storage().open(key)) {
            byte[] body = in.readAllBytes();
            var inline = FileTypeSupport.inlineMediaType(name);
            String encoded = URLEncoder.encode(name, StandardCharsets.UTF_8).replace("+", "%20");
            return ResponseEntity.ok()
                    .contentType(inline.orElse(MediaType.APPLICATION_OCTET_STREAM))
                    .header(HttpHeaders.CONTENT_DISPOSITION, (inline.isPresent() ? "inline" : "attachment") + "; filename*=UTF-8''" + encoded)
                    .body(body);
        }
    }

    // ---- LOOKUP: du lieu bang ----

    @GetMapping("/{id}/rows")
    List<RowView> rows(@PathVariable Long id, @RequestParam(defaultValue = "") String q) {
        return service.searchRows(id, q);
    }

    @PostMapping(value = "/{id}/rows/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    Object importRows(@PathVariable Long id, @RequestParam(defaultValue = "true") boolean preview, @RequestParam("file") MultipartFile file) {
        return service.importRows(id, file, !preview);
    }

    @PutMapping("/{id}/key-column")
    ResponseEntity<Void> keyColumn(@PathVariable Long id, @RequestBody KeyRequest req) {
        service.changeKeyColumn(id, req.keyColumn());
        return ResponseEntity.noContent().build();
    }

}
