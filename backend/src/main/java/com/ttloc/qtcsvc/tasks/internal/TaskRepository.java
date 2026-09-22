package com.ttloc.qtcsvc.tasks.internal;

import com.ttloc.qtcsvc.tasks.Task;
import org.springframework.data.repository.ListCrudRepository;

public interface TaskRepository extends ListCrudRepository<Task, Long> {
}
