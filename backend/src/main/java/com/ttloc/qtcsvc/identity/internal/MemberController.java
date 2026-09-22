package com.ttloc.qtcsvc.identity.internal;

import com.ttloc.qtcsvc.identity.Member;
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

@RestController
@RequestMapping("/api/admin/members")
class MemberController {

    private final MemberAdminService service;

    MemberController(MemberAdminService service) {
        this.service = service;
    }

    @GetMapping
    List<Member> list() {
        return service.listAll();
    }

    @PostMapping
    ResponseEntity<Member> create(@RequestBody MemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    Member update(@PathVariable Long id, @RequestBody MemberRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

}
