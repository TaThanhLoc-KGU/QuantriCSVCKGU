package com.ttloc.qtcsvc.identity.internal;

import com.ttloc.qtcsvc.identity.AuthProvider;
import com.ttloc.qtcsvc.identity.Role;
import com.ttloc.qtcsvc.identity.User;
import com.ttloc.qtcsvc.shared.ConflictException;
import com.ttloc.qtcsvc.shared.NotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    List<User> listAll() {
        return userRepository.findAll();
    }

    User create(CreateUserRequest request) {
        if (request.email() == null || request.email().isBlank()) {
            throw new IllegalArgumentException("Email khong duoc de trong");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email da duoc su dung: " + request.email());
        }
        if (request.username() != null && !request.username().isBlank() && userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Ten dang nhap da ton tai: " + request.username());
        }

        AuthProvider provider = request.authProvider() == null ? AuthProvider.LOCAL : request.authProvider();
        String passwordHash = null;
        if (provider != AuthProvider.GOOGLE) {
            if (request.password() == null || request.password().isBlank()) {
                throw new IllegalArgumentException("Tai khoan dang nhap LOCAL/BOTH phai co mat khau");
            }
            passwordHash = passwordEncoder.encode(request.password());
        }

        User user = new User(null, request.username(), request.email(), request.fullName(), passwordHash,
                provider, null, request.role() == null ? Role.STAFF : request.role(), request.memberId(),
                true, null, Instant.now());
        return userRepository.save(user);
    }

    User update(Long id, UpdateUserRequest request) {
        User existing = findOrThrow(id);
        User updated = new User(
                existing.id(),
                existing.username(),
                request.email() != null ? request.email() : existing.email(),
                request.fullName() != null ? request.fullName() : existing.fullName(),
                existing.passwordHash(),
                existing.authProvider(),
                existing.googleSub(),
                request.role() != null ? request.role() : existing.role(),
                request.memberId() != null ? request.memberId() : existing.memberId(),
                request.active() != null ? request.active() : existing.active(),
                existing.lastLoginAt(),
                existing.createdAt());
        return userRepository.save(updated);
    }

    void resetPassword(Long id, String newPassword) {
        if (newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException("Mat khau moi khong duoc de trong");
        }
        User existing = findOrThrow(id);
        User updated = new User(existing.id(), existing.username(), existing.email(), existing.fullName(),
                passwordEncoder.encode(newPassword), existing.authProvider(), existing.googleSub(), existing.role(),
                existing.memberId(), existing.active(), existing.lastLoginAt(), existing.createdAt());
        userRepository.save(updated);
    }

    void delete(Long id) {
        findOrThrow(id);
        userRepository.deleteById(id);
    }

    private User findOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Khong tim thay nguoi dung: " + id));
    }

}
