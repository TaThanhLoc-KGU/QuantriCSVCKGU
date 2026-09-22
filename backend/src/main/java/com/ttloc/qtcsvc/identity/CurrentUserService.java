package com.ttloc.qtcsvc.identity;

import com.ttloc.qtcsvc.identity.internal.AppUserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CurrentUserService {

    public Optional<CurrentUser> current() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof AppUserPrincipal principal)) {
            return Optional.empty();
        }
        return Optional.of(principal.toCurrentUser());
    }

    public CurrentUser requireCurrent() {
        return current().orElseThrow(() -> new AccessDeniedException("Chua dang nhap"));
    }

}
