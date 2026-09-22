package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.CategoryKind;
import com.ttloc.qtcsvc.content.Notification;
import com.ttloc.qtcsvc.content.NotificationType;
import com.ttloc.qtcsvc.content.Post;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Spec 4.5 /cong-khai: gop Post thuoc danh muc "Cong khai" (slug co dinh, xem
 * seed V8) + Notification type=PROCUREMENT. Neu ADMIN doi/xoa danh muc nay,
 * phan Post se tra rong thay vi loi (xem PostService.publicByCategorySlug).
 */
@RestController
@RequestMapping("/api/public/public-disclosures")
class PublicDisclosureController {

    private static final String DISCLOSURE_CATEGORY_SLUG = "cong-khai";

    private final PostService postService;
    private final NotificationService notificationService;

    PublicDisclosureController(PostService postService, NotificationService notificationService) {
        this.postService = postService;
        this.notificationService = notificationService;
    }

    record PublicDisclosureResponse(List<Post> posts, List<Notification> notifications) {
    }

    @GetMapping
    PublicDisclosureResponse get() {
        List<Post> posts = postService.publicByCategorySlug(CategoryKind.POST, DISCLOSURE_CATEGORY_SLUG);
        List<Notification> notifications = notificationService.publicByType(NotificationType.PROCUREMENT);
        return new PublicDisclosureResponse(posts, notifications);
    }

}
