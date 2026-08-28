package com.ttloc.qtcsvc.documentregister.internal;

import java.util.List;

record ImportPreviewRow(int rowNumber, Integer numberInt, String issueDate, String title, boolean duplicateWarning,
                         String error) {
}

record ImportPreviewResult(int totalRows, int validRows, int errorRows, List<ImportPreviewRow> rows) {
}

record ImportRowError(int rowNumber, String message) {
}

record ImportResult(String status, long readCount, long writeCount, long skipCount, List<ImportRowError> errors) {
}
