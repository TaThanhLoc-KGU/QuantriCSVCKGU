package com.ttloc.qtcsvc.identity.internal;

import com.ttloc.qtcsvc.identity.User;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface UserRepository extends ListCrudRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByGoogleSub(String googleSub);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @Modifying
    @Query("UPDATE users SET last_login_at = :lastLoginAt WHERE id = :id")
    void updateLastLoginAt(@Param("id") Long id, @Param("lastLoginAt") Instant lastLoginAt);

}
