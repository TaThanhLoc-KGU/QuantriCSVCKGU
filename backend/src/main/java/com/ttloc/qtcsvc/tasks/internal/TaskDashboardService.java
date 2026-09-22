package com.ttloc.qtcsvc.tasks.internal;

import com.ttloc.qtcsvc.identity.Member;
import com.ttloc.qtcsvc.identity.MemberQueryService;
import com.ttloc.qtcsvc.tasks.Task;
import com.ttloc.qtcsvc.tasks.TaskStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
class TaskDashboardService {

    private final TaskRepository repository;
    private final MemberQueryService memberQueryService;

    TaskDashboardService(TaskRepository repository, MemberQueryService memberQueryService) {
        this.repository = repository;
        this.memberQueryService = memberQueryService;
    }

    record Kpi(int totalTasks, int completed, int inProgress, int blocked, double overallProgressPercent) {
    }

    record MemberRow(Long memberId, String memberName, int taskCount, double avgProgressPercent) {
    }

    Kpi kpi(Integer year, Integer quarter, Integer month) {
        List<Task> tasks = filtered(year, quarter, month);
        int total = tasks.size();
        int completed = (int) tasks.stream().filter(t -> t.status() == TaskStatus.HOAN_THANH).count();
        int inProgress = (int) tasks.stream().filter(t -> t.status() == TaskStatus.DANG_LAM).count();
        int blocked = (int) tasks.stream().filter(t -> t.status() == TaskStatus.VUONG_MAC).count();
        double overall = total == 0 ? 0 : tasks.stream().mapToInt(Task::progressPercent).average().orElse(0);
        return new Kpi(total, completed, inProgress, blocked, round1(overall));
    }

    /**
     * Moi Member: so nhiem vu DEPT dang duoc gan (assigneeId) trong nam + %
     * hoan thanh trung binh cac nhiem vu do (spec 7.6 MemberTable).
     */
    List<MemberRow> memberTable(int year) {
        List<Task> tasks = filtered(year, null, null);
        Map<Long, List<Task>> byAssignee = tasks.stream()
                .filter(t -> t.assigneeId() != null)
                .collect(Collectors.groupingBy(Task::assigneeId));

        return memberQueryService.listActive().stream()
                .map(m -> toRow(m, byAssignee.getOrDefault(m.id(), List.of())))
                .toList();
    }

    private MemberRow toRow(Member member, List<Task> assigned) {
        double avg = assigned.isEmpty() ? 0 : assigned.stream().mapToInt(Task::progressPercent).average().orElse(0);
        return new MemberRow(member.id(), member.name(), assigned.size(), round1(avg));
    }

    private List<Task> filtered(Integer year, Integer quarter, Integer month) {
        return repository.findAll().stream()
                .filter(t -> year == null || t.year() == year)
                .filter(t -> quarter == null || quarter.equals(t.quarter()))
                .filter(t -> month == null || month.equals(t.month()))
                .toList();
    }

    private double round1(double v) {
        return Math.round(v * 10) / 10.0;
    }

}
