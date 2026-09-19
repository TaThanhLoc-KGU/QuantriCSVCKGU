package com.ttloc.qtcsvc.sitestats.internal;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Bo dem truy cap: "tong luot truy cap" luu DB (tang khi FE bao 1 luot moi
 * trong phien), "dang online" giu trong bo nho theo heartbeat (het han sau 5 phut).
 */
@RestController
@RequestMapping("/api/public/stats")
class SiteStatsController {

    record PingRequest(String visitorId, boolean newVisit) {
    }

    private static final Duration ONLINE_WINDOW = Duration.ofMinutes(5);

    private final JdbcClient jdbc;
    private final Map<String, Instant> lastSeen = new ConcurrentHashMap<>();

    SiteStatsController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @PostMapping("/ping")
    Map<String, Long> ping(@RequestBody PingRequest req) {
        Instant now = Instant.now();
        if (req.visitorId() != null && !req.visitorId().isBlank() && req.visitorId().length() <= 64) {
            lastSeen.put(req.visitorId(), now);
        }
        lastSeen.values().removeIf(t -> t.isBefore(now.minus(ONLINE_WINDOW)));
        if (req.newVisit()) {
            jdbc.sql("UPDATE site_counters SET value = value + 1 WHERE name = 'visits'").update();
        }
        long total = jdbc.sql("SELECT value FROM site_counters WHERE name = 'visits'").query(Long.class).single();
        return Map.of("total", total, "online", (long) Math.max(1, lastSeen.size()));
    }

}
