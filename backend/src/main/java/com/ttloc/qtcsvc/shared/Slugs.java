package com.ttloc.qtcsvc.shared;

import java.text.Normalizer;
import java.util.Locale;

/**
 * Sinh slug tu chuoi tieng Viet co dau: bo dau, thuong hoa, thay khoang trang bang '-'.
 */
public final class Slugs {

    private Slugs() {
    }

    public static String slugify(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }
        String noDiacritics = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replace('đ', 'd')
                .replace('Đ', 'D');
        String slug = noDiacritics.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("[\\s-]+", "-");
        return slug.replaceAll("^-+|-+$", "");
    }

}
