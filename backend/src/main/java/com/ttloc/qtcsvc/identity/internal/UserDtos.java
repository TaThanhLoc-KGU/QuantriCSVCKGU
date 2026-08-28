package com.ttloc.qtcsvc.identity.internal;

import com.ttloc.qtcsvc.identity.AuthProvider;
import com.ttloc.qtcsvc.identity.Role;
import com.ttloc.qtcsvc.identity.User;

import java.time.Instant;

record CreateUserRequest(String username, String email, String fullName, String password, Role role,
                          Long memberId, AuthProvider authProvider) {
}

record UpdateUserRequest(String email, String fullName, Role role, Long memberId, Boolean active) {
}

record ResetPasswordRequest(String newPassword) {
}

record UserResponse(Long id, String username, String email, String fullName, AuthProvider authProvider, Role role,
                     Long memberId, boolean active, Instant lastLoginAt, Instant createdAt) {

    static UserResponse from(User u) {
        return new UserResponse(u.id(), u.username(), u.email(), u.fullName(), u.authProvider(), u.role(),
                u.memberId(), u.active(), u.lastLoginAt(), u.createdAt());
    }

}
