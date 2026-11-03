package com.ttloc.qtcsvc.studentdirectory.internal;

import java.util.List;

final class StudentEmailDtos {

    private StudentEmailDtos() {
    }

    record ImportPreview(int validCount, int newCount, int updateCount, List<String> errors) {
    }

    record ImportResult(int addedCount, int updatedCount) {
    }

    record LookupResult(String studentId, String fullName, String className, String major, String email) {
    }

}
