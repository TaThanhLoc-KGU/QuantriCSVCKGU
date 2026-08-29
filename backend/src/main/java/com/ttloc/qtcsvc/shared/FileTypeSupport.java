package com.ttloc.qtcsvc.shared;

import org.springframework.http.MediaType;

import java.util.Map;
import java.util.Optional;

/**
 * Doan cac dinh dang file dinh kem ma trinh duyet tu hien thi duoc (mo truc
 * tiep qua <iframe>/<img> trong 1 modal xem truoc, thay vi bat buoc tai ve).
 * Dung chung cho moi noi serve file dinh kem cong khai/quan tri (van ban
 * dinh kem, yeu cau khoi phuc tai khoan...).
 */
public final class FileTypeSupport {

    private static final Map<String, MediaType> INLINE_VIEWABLE_TYPES = Map.of(
            "pdf", MediaType.APPLICATION_PDF,
            "jpg", MediaType.IMAGE_JPEG,
            "jpeg", MediaType.IMAGE_JPEG,
            "png", MediaType.IMAGE_PNG,
            "gif", MediaType.IMAGE_GIF,
            "webp", MediaType.valueOf("image/webp")
    );

    private FileTypeSupport() {
    }

    public static Optional<MediaType> inlineMediaType(String filename) {
        return Optional.ofNullable(INLINE_VIEWABLE_TYPES.get(extensionOf(filename)));
    }

    public static String extensionOf(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        return dot < 0 ? "" : filename.substring(dot + 1).toLowerCase();
    }

}
