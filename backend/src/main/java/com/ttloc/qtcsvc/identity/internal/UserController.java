package com.ttloc.qtcsvc.identity.internal;

import com.ttloc.qtcsvc.identity.User;
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

/**
 * Quan ly nguoi dung (chi ADMIN - xem ma tran quyen spec 2.3). Duong dan
 * /api/admin/users/** da bi khoa ADMIN-only o SecurityConfig.
 */
@RestController
@RequestMapping("/api/admin/users")
class UserController {

    private final UserService service;

    UserController(UserService service) {
        this.service = service;
    }

    @GetMapping
    List<UserResponse> list() {
        return service.listAll().stream().map(UserResponse::from).toList();
    }

    @PostMapping
    ResponseEntity<UserResponse> create(@RequestBody CreateUserRequest request) {
        User created = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponse.from(created));
    }

    @PutMapping("/{id}")
    UserResponse update(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        return UserResponse.from(service.update(id, request));
    }

    @PatchMapping("/{id}/password")
    ResponseEntity<Void> resetPassword(@PathVariable Long id, @RequestBody ResetPasswordRequest request) {
        service.resetPassword(id, request.newPassword());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

}
