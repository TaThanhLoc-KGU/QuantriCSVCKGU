package com.ttloc.qtcsvc.identity.internal;

import com.ttloc.qtcsvc.identity.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
class AppUserDetailsService implements UserDetailsService {

    private final UserRepository repository;

    AppUserDetailsService(UserRepository repository) {
        this.repository = repository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        User user = repository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Sai ten dang nhap hoac mat khau"));
        if (user.passwordHash() == null) {
            throw new UsernameNotFoundException("Tai khoan nay chi dang nhap qua Google SSO");
        }
        return new AppUserPrincipal(user);
    }

}
