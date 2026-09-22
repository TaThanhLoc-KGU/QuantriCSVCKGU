package com.ttloc.qtcsvc.tasks.internal;

import com.ttloc.qtcsvc.tasks.TaskStatus;
import com.ttloc.qtcsvc.tasks.TaskStep;
import com.ttloc.qtcsvc.tasks.TaskStepStatus;

import java.util.Collection;

/**
 * Quy tac tinh progressPercent + auto-status cua Task theo spec 7.4.
 */
final class TaskProgressCalculator {

    private TaskProgressCalculator() {
    }

    static int progressFromSteps(Collection<TaskStep> steps) {
        if (steps.isEmpty()) {
            return 0;
        }
        long done = steps.stream().filter(s -> s.status() == TaskStepStatus.HOAN_THANH).count();
        return (int) Math.round(done * 100.0 / steps.size());
    }

    /**
     * - 100% -> HOAN_THANH
     * - Con lai, co >=1 buoc VUONG_MAC -> VUONG_MAC
     * - progress > 0 hoac co buoc dang DANG_LAM -> DANG_LAM
     * - Nguoc lai -> CHUA_BAT_DAU
     */
    static TaskStatus statusFromSteps(Collection<TaskStep> steps, int progressPercent) {
        if (progressPercent == 100) {
            return TaskStatus.HOAN_THANH;
        }
        boolean anyBlocked = steps.stream().anyMatch(s -> s.status() == TaskStepStatus.VUONG_MAC);
        if (anyBlocked) {
            return TaskStatus.VUONG_MAC;
        }
        boolean anyInProgress = steps.stream().anyMatch(s -> s.status() == TaskStepStatus.DANG_LAM);
        if (progressPercent > 0 || anyInProgress) {
            return TaskStatus.DANG_LAM;
        }
        return TaskStatus.CHUA_BAT_DAU;
    }

    /**
     * Nhiem vu KHONG co buoc: status dat thu cong, progress suy ra theo bang
     * anh xa co dinh - rieng VUONG_MAC/TAM_DUNG/HUY giu nguyen progress hien tai.
     */
    static int manualProgressFor(TaskStatus status, int currentProgress) {
        return switch (status) {
            case CHUA_BAT_DAU -> 0;
            case DANG_LAM -> 50;
            case HOAN_THANH -> 100;
            case VUONG_MAC, TAM_DUNG, HUY -> currentProgress;
        };
    }

    static boolean isManualOverrideStatus(TaskStatus status) {
        return status == TaskStatus.TAM_DUNG || status == TaskStatus.HUY;
    }

}
