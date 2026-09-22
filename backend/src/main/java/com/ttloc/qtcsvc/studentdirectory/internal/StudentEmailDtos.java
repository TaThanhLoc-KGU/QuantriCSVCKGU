package com.ttloc.qtcsvc.studentdirectory.internal;

import java.util.List;

final class StudentEmailDtos {

    private StudentEmailDtos() {
    }

    record ImportPreview(int validCount, List<String> errors) {
    }

    record ImportResult(int importedCount) {
    }

    record LookupResult(String studentId, String fullName, String className, String major, String email) {
    }

}
