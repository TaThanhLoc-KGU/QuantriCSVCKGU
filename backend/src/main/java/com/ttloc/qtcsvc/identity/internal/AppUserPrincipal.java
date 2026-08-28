package com.ttloc.qtcsvc.identity.internal;

import com.ttloc.qtcsvc.identity.CurrentUser;
import com.ttloc.qtcsvc.identity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serializable;
import java.util.Collection;
import java.util.List;

public class AppUserPrincipal implements UserDetails, Serializable {

    private final User user;

    public AppUserPrincipal(User user) {
        this.user = user;
    }

    public User user() {
        return user;
    }

    public CurrentUser toCurrentUser() {
        return new CurrentUser(user.id(), user.username(), user.fullName(), user.role());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.role().name()));
    }

    @Override
    public String getPassword() {
        return user.passwordHash();
    }

    @Override
    public String getUsername() {
        return user.username();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.active();
    }

}
