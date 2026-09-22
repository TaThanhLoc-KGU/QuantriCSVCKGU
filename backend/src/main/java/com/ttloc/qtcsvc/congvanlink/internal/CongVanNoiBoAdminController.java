package com.ttloc.qtcsvc.congvanlink.internal;

import com.ttloc.qtcsvc.congvanlink.CongVanInternalDocument;
import com.ttloc.qtcsvc.shared.NotFoundException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * So van ban noi bo cua chinh phong (QTCSVC), luu tren he thong Cong van qua
 * API rieng cho don vi (X-Api-Key) - xem CongVanNoiBoApiClient. Doc/ghi day
 * du (CRUD + file dinh kem), khac voi van ban den/di (chi doc).
 */
@RestController
@RequestMapping("/api/admin/congvan/noibo")
class CongVanNoiBoAdminController {

    private final CongVanNoiBoApiClient client;

    CongVanNoiBoAdminController(CongVanNoiBoApiClient client) {
        this.client = client;
    }

    @GetMapping
    List<CongVanInternalDocument> list(@RequestParam(required = false) Integer nam, @RequestParam(required = false) String tuKhoa) {
        return client.list(nam, tuKhoa);
    }

    @GetMapping("/{id}")
    CongVanNoiBoApiDtos.Detail get(@PathVariable long id) {
        CongVanNoiBoApiDtos.Detail detail = client.detail(id);
        if (detail == null) {
            throw new NotFoundException("Khong tim thay van ban noi bo: " + id);
        }
        return detail;
    }

    @PostMapping
    ResponseEntity<CongVanInternalDocument> create(@RequestBody CongVanNoiBoApiDtos.SaveRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(client.create(body));
    }

    @PutMapping("/{id}")
    CongVanInternalDocument update(@PathVariable long id, @RequestBody CongVanNoiBoApiDtos.SaveRequest body) {
        CongVanInternalDocument updated = client.update(id, body);
        if (updated == null) {
            throw new NotFoundException("Khong tim thay van ban noi bo: " + id);
        }
        return updated;
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@PathVariable long id) {
        if (!client.delete(id)) {
            throw new NotFoundException("Khong tim thay van ban noi bo: " + id);
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/files")
    ResponseEntity<CongVanNoiBoApiDtos.FileRef> uploadFile(@PathVariable long id, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(client.uploadFile(id, file));
    }

    @GetMapping("/{id}/files/{fileId}")
    ResponseEntity<byte[]> downloadFile(@PathVariable long id, @PathVariable long fileId) {
        String[] contentType = new String[1];
        byte[] body = client.downloadFile(id, fileId, contentType);
        if (body == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType[0]))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(body);
    }

    @DeleteMapping("/{id}/files/{fileId}")
    ResponseEntity<Void> deleteFile(@PathVariable long id, @PathVariable long fileId) {
        client.deleteFile(id, fileId);
        return ResponseEntity.noContent().build();
    }

}
