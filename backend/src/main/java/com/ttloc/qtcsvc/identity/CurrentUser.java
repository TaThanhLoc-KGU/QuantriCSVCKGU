package com.ttloc.qtcsvc.identity;

/**
 * View gon nhe cua nguoi dang dang nhap, de cac module khac dung ma khong can
 * phu thuoc thang vao User/UserRepository.
 */
public record CurrentUser(Long id, String username, String fullName, Role role) {

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }

    public boolean isEditorOrAdmin() {
        return role == Role.EDITOR || role == Role.ADMIN;
    }

}
