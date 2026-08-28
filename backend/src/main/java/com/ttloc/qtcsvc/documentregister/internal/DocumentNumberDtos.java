package com.ttloc.qtcsvc.documentregister.internal;

import java.time.LocalDate;

record DocumentNumberRequest(Long documentTypeId, Integer year, Integer numberInt, String title, String person,
                              LocalDate issueDate, String note, String senderUnit, String originalRef,
                              LocalDate receivedDate, Boolean confirmDuplicate) {
}
