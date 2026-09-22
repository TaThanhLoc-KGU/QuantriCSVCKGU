package com.ttloc.qtcsvc.tasks.internal;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
class DashboardController {

    private final TaskDashboardService service;

    DashboardController(TaskDashboardService service) {
        this.service = service;
    }

    @GetMapping("/kpi")
    TaskDashboardService.Kpi kpi(@RequestParam(required = false) Integer year,
                                  @RequestParam(required = false) Integer quarter,
                                  @RequestParam(required = false) Integer month) {
        return service.kpi(year, quarter, month);
    }

    @GetMapping("/members")
    List<TaskDashboardService.MemberRow> members(@RequestParam int year) {
        return service.memberTable(year);
    }

}
