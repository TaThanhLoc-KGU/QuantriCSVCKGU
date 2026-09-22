package com.ttloc.qtcsvc.tasks;

import com.ttloc.qtcsvc.tasks.internal.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Set;

/**
 * API cong khai de module khac (vd documentregister khi tiep nhan van ban
 * qua form cong khai) tu dong tao 1 Nhiem vu chung phong (DEPT) de theo doi
 * xu ly, khong can nguoi dung dang nhap thao tac (khac voi luong tao qua
 * TaskController von bat buoc CurrentUser va quyen EDITOR/ADMIN).
 */
@Service
public class TaskCreationService {

    private final TaskRepository repository;

    public TaskCreationService(TaskRepository repository) {
        this.repository = repository;
    }

    public Task createSystemDeptTask(String title, String description) {
        LocalDate today = LocalDate.now();
        int quarter = ((today.getMonthValue() - 1) / 3) + 1;
        Instant now = Instant.now();
        Task task = new Task(null, TaskScope.DEPT, today.getYear(), quarter, null, title, description,
                null, null, TaskStatus.CHUA_BAT_DAU, 0, 0, now, now, Set.of());
        return repository.save(task);
    }

}
