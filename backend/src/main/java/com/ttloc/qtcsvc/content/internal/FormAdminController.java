package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.Form;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Bieu mau khong co truong nguoi tao (spec 3.2 Form khong co authorId) nen
 * khong ap dung rule "chi sua cua minh" nhu Post - moi tai khoan da dang nhap
 * (STAFF/EDITOR/ADMIN) deu quan ly duoc, vi day la tai lieu dung chung cua phong.
 */
@RestController
@RequestMapping("/api/admin/forms")
class FormAdminController {

    private final FormService service;

    FormAdminController(FormService service) {
        this.service = service;
    }

    @GetMapping
    List<Form> list() {
        return service.listAll();
    }

    @PostMapping
    ResponseEntity<Form> create(@RequestBody FormRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    Form update(@PathVariable Long id, @RequestBody FormRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

}
