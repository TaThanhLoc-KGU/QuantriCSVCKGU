package com.ttloc.qtcsvc.tasks;

import com.ttloc.qtcsvc.tasks.internal.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * API cong khai cua module tasks de module report doc Task/TaskStep trong 1
 * ky (nam + quy/thang) ma khong dung thang TaskRepository.
 */
@Service
public class TaskQueryService {

    private final TaskRepository repository;

    public TaskQueryService(TaskRepository repository) {
        this.repository = repository;
    }

    public List<Task> findByPeriod(int year, Integer quarter, Integer month) {
        return repository.findAll().stream()
                .filter(t -> t.year() == year)
                .filter(t -> quarter == null || quarter.equals(t.quarter()))
                .filter(t -> month == null || month.equals(t.month()))
                .toList();
    }

}
