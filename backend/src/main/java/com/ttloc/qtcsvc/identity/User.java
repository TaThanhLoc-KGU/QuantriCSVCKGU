package com.ttloc.qtcsvc.identity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.io.Serializable;
import java.time.Instant;

/**
 * Serializable: Spring Session JDBC luu SecurityContext (chua User qua
 * AppUserPrincipal) vao Postgres bang Java serialization mac dinh - thieu
 * Serializable se lam MOI lan dang nhap that that bai luc luu session.
 */
@Table("users")
public record User(
        @Id Long id,
        String username,
        String email,
        String fullName,
        String passwordHash,
        AuthProvider authProvider,
        String googleSub,
        Role role,
        Long memberId,
        boolean active,
        Instant lastLoginAt,
        Instant createdAt
) implements Serializable {
}
