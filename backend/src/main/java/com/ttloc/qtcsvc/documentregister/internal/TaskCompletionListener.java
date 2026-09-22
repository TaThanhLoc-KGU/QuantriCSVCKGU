package com.ttloc.qtcsvc.documentregister.internal;

import com.ttloc.qtcsvc.documentregister.DocumentNumber;
import com.ttloc.qtcsvc.tasks.TaskCompletedEvent;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Khi 1 Nhiem vu duoc tao tu don nop van ban cong khai chuyen sang
 * HOAN_THANH, gui email bao cho nguoi da nop biet van ban da duoc xu ly xong.
 * Lang nghe qua application event (khong phu thuoc nguoc lai module tasks).
 */
@Component
class TaskCompletionListener {

    private final DocumentNumberRepository repository;
    private final SubmissionEmailService emailService;

    TaskCompletionListener(DocumentNumberRepository repository, SubmissionEmailService emailService) {
        this.repository = repository;
        this.emailService = emailService;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    void onTaskCompleted(TaskCompletedEvent event) {
        for (DocumentNumber dn : repository.findByTaskId(event.taskId())) {
            if (dn.senderEmail() != null && !dn.senderEmail().isBlank()) {
                emailService.sendProcessedNotification(dn.senderEmail(), dn.numberDisplay(), dn.title());
            }
        }
    }

}
