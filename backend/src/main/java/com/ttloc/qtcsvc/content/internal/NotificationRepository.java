package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.Notification;
import com.ttloc.qtcsvc.content.NotificationType;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;

public interface NotificationRepository extends ListCrudRepository<Notification, Long> {

    List<Notification> findByTypeOrderByPinnedDescEffectiveDateDesc(NotificationType type);

    List<Notification> findAllByOrderByPinnedDescEffectiveDateDesc();

}
