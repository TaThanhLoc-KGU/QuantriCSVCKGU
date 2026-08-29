package com.ttloc.qtcsvc.content.internal;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static com.ttloc.qtcsvc.content.internal.PageBlockDtos.BlockRequest;
import static com.ttloc.qtcsvc.content.internal.PageBlockDtos.BlockView;
import static com.ttloc.qtcsvc.content.internal.PageBlockDtos.MoveRequest;
import static com.ttloc.qtcsvc.content.internal.PageBlockDtos.RowRequest;
import static com.ttloc.qtcsvc.content.internal.PageBlockDtos.RowView;

/**
 * Quan tri khoi noi dung + dong du lieu bang cua "trang con" (danh muc kind=PAGE).
 * Ban than danh muc PAGE dung chung CategoryAdminController (them/sua/xoa/cay)
 * - controller nay chi lo phan "noi dung ben trong" 1 trang.
 */
@RestController
@RequestMapping("/api/admin/pages")
class PageBlockAdminController {

    private final PageBlockService service;

    PageBlockAdminController(PageBlockService service) {
        this.service = service;
    }

    @GetMapping("/{categoryId}/blocks")
    List<BlockView> list(@PathVariable Long categoryId) {
        return service.list(categoryId);
    }

    @PostMapping("/{categoryId}/blocks")
    ResponseEntity<BlockView> create(@PathVariable Long categoryId, @RequestBody BlockRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(categoryId, request));
    }

    @PutMapping("/blocks/{blockId}")
    BlockView update(@PathVariable Long blockId, @RequestBody BlockRequest request) {
        return service.update(blockId, request);
    }

    @DeleteMapping("/blocks/{blockId}")
    ResponseEntity<Void> delete(@PathVariable Long blockId) {
        service.delete(blockId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/blocks/{blockId}/move")
    BlockView move(@PathVariable Long blockId, @RequestBody MoveRequest request) {
        return service.move(blockId, request.direction());
    }

    @PostMapping("/blocks/{blockId}/rows")
    ResponseEntity<RowView> createRow(@PathVariable Long blockId, @RequestBody RowRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createRow(blockId, request));
    }

    @PutMapping("/rows/{rowId}")
    RowView updateRow(@PathVariable Long rowId, @RequestBody RowRequest request) {
        return service.updateRow(rowId, request);
    }

    @DeleteMapping("/rows/{rowId}")
    ResponseEntity<Void> deleteRow(@PathVariable Long rowId) {
        service.deleteRow(rowId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/rows/{rowId}/move")
    RowView moveRow(@PathVariable Long rowId, @RequestBody MoveRequest request) {
        return service.moveRow(rowId, request.direction());
    }

}
