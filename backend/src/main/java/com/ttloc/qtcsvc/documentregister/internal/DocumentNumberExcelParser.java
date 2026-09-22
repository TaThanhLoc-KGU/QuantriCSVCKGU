package com.ttloc.qtcsvc.documentregister.internal;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

/**
 * Doc file Excel nhap so van ban (spec 6.2). Cot khop voi file xuat
 * (DocumentNumberExportService): So | Ngay | Trich yeu | Nguoi | [Noi gui |
 * So goc | Ngay den - chi voi INCOMING] | Ghi chu. Dong 1 la header, bo qua.
 */
@Component
class DocumentNumberExcelParser {

    private static final List<DateTimeFormatter> DATE_FORMATS = List.of(
            DateTimeFormatter.ISO_LOCAL_DATE,
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("d/M/yyyy"));

    record ParsedRow(int rowNumber, Integer numberInt, LocalDate issueDate, String title, String person,
                      String senderUnit, String originalRef, LocalDate receivedDate, String note) {
    }

    record ParseError(int rowNumber, String message) {
    }

    record ParseResult(List<ParsedRow> rows, List<ParseError> errors) {
    }

    ParseResult parse(InputStream inputStream, boolean incoming) {
        List<ParsedRow> rows = new ArrayList<>();
        List<ParseError> errors = new ArrayList<>();
        DataFormatter formatter = new DataFormatter();

        try (Workbook workbook = WorkbookFactory.create(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                int excelRowNumber = r + 1;
                if (row == null || isBlank(row, formatter)) {
                    continue;
                }
                try {
                    rows.add(parseRow(row, formatter, incoming, excelRowNumber));
                } catch (RuntimeException e) {
                    errors.add(new ParseError(excelRowNumber, e.getMessage()));
                }
            }
        } catch (IOException e) {
            throw new IllegalStateException("Khong doc duoc file Excel", e);
        }
        return new ParseResult(rows, errors);
    }

    private ParsedRow parseRow(Row row, DataFormatter formatter, boolean incoming, int rowNumber) {
        int c = 0;
        Integer numberInt = readInt(row.getCell(c++), formatter);
        LocalDate issueDate = readDate(row.getCell(c++), formatter);
        String title = readString(row.getCell(c++), formatter);
        String person = readString(row.getCell(c++), formatter);
        String senderUnit = null;
        String originalRef = null;
        LocalDate receivedDate = null;
        if (incoming) {
            senderUnit = readString(row.getCell(c++), formatter);
            originalRef = readString(row.getCell(c++), formatter);
            receivedDate = readDate(row.getCell(c++), formatter);
        }
        String note = readString(row.getCell(c), formatter);

        if (numberInt == null || numberInt <= 0) {
            throw new IllegalArgumentException("Thieu hoac sai cot \"So\"");
        }
        if (issueDate == null) {
            throw new IllegalArgumentException("Thieu hoac sai dinh dang cot \"Ngay\"");
        }
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Thieu cot \"Trich yeu\"");
        }
        return new ParsedRow(rowNumber, numberInt, issueDate, title, person, senderUnit, originalRef, receivedDate, note);
    }

    private boolean isBlank(Row row, DataFormatter formatter) {
        for (Cell cell : row) {
            if (!formatter.formatCellValue(cell).isBlank()) {
                return false;
            }
        }
        return true;
    }

    private Integer readInt(Cell cell, DataFormatter formatter) {
        if (cell == null) {
            return null;
        }
        if (cell.getCellType() == CellType.NUMERIC) {
            return (int) cell.getNumericCellValue();
        }
        String text = formatter.formatCellValue(cell).trim();
        if (text.isEmpty()) {
            return null;
        }
        try {
            return Integer.parseInt(text);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("So khong hop le: \"" + text + "\"");
        }
    }

    private LocalDate readDate(Cell cell, DataFormatter formatter) {
        if (cell == null) {
            return null;
        }
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getLocalDateTimeCellValue().toLocalDate();
        }
        String text = formatter.formatCellValue(cell).trim();
        if (text.isEmpty()) {
            return null;
        }
        for (DateTimeFormatter fmt : DATE_FORMATS) {
            try {
                return LocalDate.parse(text, fmt);
            } catch (DateTimeParseException ignored) {
                // thu dinh dang tiep theo
            }
        }
        throw new IllegalArgumentException("Ngay khong dung dinh dang (dd/MM/yyyy hoac yyyy-MM-dd): \"" + text + "\"");
    }

    private String readString(Cell cell, DataFormatter formatter) {
        if (cell == null) {
            return null;
        }
        String text = formatter.formatCellValue(cell).trim();
        return text.isEmpty() ? null : text;
    }

}
