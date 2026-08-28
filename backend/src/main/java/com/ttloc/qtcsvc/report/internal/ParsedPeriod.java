package com.ttloc.qtcsvc.report.internal;

import com.ttloc.qtcsvc.report.PeriodType;

record ParsedPeriod(PeriodType type, int year, int value) {

    static ParsedPeriod parse(String periodId) {
        if (periodId == null || periodId.isBlank()) {
            throw new IllegalArgumentException("periodId khong duoc de trong");
        }
        String[] parts = periodId.split("-");
        if (parts.length != 2 || parts[1].isEmpty()) {
            throw new IllegalArgumentException("periodId khong dung dinh dang (vd 2026-M3 hoac 2026-Q1): " + periodId);
        }

        int year;
        try {
            year = Integer.parseInt(parts[0]);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Nam khong hop le trong periodId: " + periodId);
        }

        char kind = Character.toUpperCase(parts[1].charAt(0));
        int value;
        try {
            value = Integer.parseInt(parts[1].substring(1));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Gia tri thang/quy khong hop le trong periodId: " + periodId);
        }

        if (kind == 'M') {
            if (value < 1 || value > 12) {
                throw new IllegalArgumentException("Thang phai tu 1-12: " + periodId);
            }
            return new ParsedPeriod(PeriodType.MONTH, year, value);
        }
        if (kind == 'Q') {
            if (value < 1 || value > 4) {
                throw new IllegalArgumentException("Quy phai tu 1-4: " + periodId);
            }
            return new ParsedPeriod(PeriodType.QUARTER, year, value);
        }
        throw new IllegalArgumentException("periodId phai bat dau bang M (thang) hoac Q (quy): " + periodId);
    }

    Integer quarterOrNull() {
        return type == PeriodType.QUARTER ? value : null;
    }

    Integer monthOrNull() {
        return type == PeriodType.MONTH ? value : null;
    }

}
