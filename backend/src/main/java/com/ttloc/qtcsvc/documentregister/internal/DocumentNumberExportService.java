package com.ttloc.qtcsvc.documentregister.internal;

import com.ttloc.qtcsvc.documentregister.Direction;
import com.ttloc.qtcsvc.documentregister.DocumentNumber;
import com.ttloc.qtcsvc.documentregister.DocumentType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
class DocumentNumberExportService {

    private static final List<String> OUTGOING_HEADERS = List.of("So", "Ngay", "Trich yeu", "Nguoi", "Ghi chu");
    private static final List<String> INCOMING_HEADERS =
            List.of("So", "Ngay", "Trich yeu", "Nguoi", "Noi gui", "So/ky hieu goc", "Ngay den", "Ghi chu");

    private final DocumentNumberRepository repository;
    private final DocumentTypeService documentTypeService;

    DocumentNumberExportService(DocumentNumberRepository repository, DocumentTypeService documentTypeService) {
        this.repository = repository;
        this.documentTypeService = documentTypeService;
    }

    byte[] export(Long documentTypeId, int year) {
        DocumentType type = documentTypeService.get(documentTypeId);
        boolean incoming = type.direction() == Direction.INCOMING;
        List<String> headers = incoming ? INCOMING_HEADERS : OUTGOING_HEADERS;
        List<DocumentNumber> rows = repository.findByDocumentTypeIdAndYearOrderByNumberInt(documentTypeId, year);

        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet(type.name());

            Row header = sheet.createRow(0);
            for (int i = 0; i < headers.size(); i++) {
                header.createCell(i).setCellValue(headers.get(i));
            }

            int r = 1;
            for (DocumentNumber dn : rows) {
                Row row = sheet.createRow(r++);
                int c = 0;
                row.createCell(c++).setCellValue(dn.numberDisplay());
                row.createCell(c++).setCellValue(dn.issueDate().toString());
                row.createCell(c++).setCellValue(nullToEmpty(dn.title()));
                row.createCell(c++).setCellValue(nullToEmpty(dn.person()));
                if (incoming) {
                    row.createCell(c++).setCellValue(nullToEmpty(dn.senderUnit()));
                    row.createCell(c++).setCellValue(nullToEmpty(dn.originalRef()));
                    row.createCell(c++).setCellValue(dn.receivedDate() == null ? "" : dn.receivedDate().toString());
                }
                row.createCell(c).setCellValue(nullToEmpty(dn.note()));
            }

            for (int i = 0; i < headers.size(); i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Khong xuat duoc file Excel", e);
        }
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

}
