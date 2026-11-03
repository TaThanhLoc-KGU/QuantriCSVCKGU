package com.ttloc.qtcsvc.procurement.internal;

import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.HandoverLine;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.HandoverRequest;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.PrintSetup;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

/** Xuat bien ban ban giao hang hoa (Excel) theo mau cua phong: dien san tu danh muc don vi de nghi. */
@Component
class ProcurementHandover {

    private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final String TITLE = "BIÊN BẢN BÀN GIAO, TRANG THIẾT BỊ, CÔNG CỤ, DỤNG CỤ, VĂN PHÒNG PHẨM";
    private static final int MAX_LINES = 300;
    private static final int COLS = 5;

    byte[] build(HandoverRequest req) {
        List<HandoverLine> lines = cleanLines(req.lines());
        LocalDate date = req.date() != null ? req.date() : LocalDate.now(ZONE);

        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Font normal = font(wb, 12, false, false);
            Font bold = font(wb, 12, true, false);
            Font title = font(wb, 13, true, false);
            Font italic = font(wb, 11, false, true);

            CellStyle left = style(wb, normal, HorizontalAlignment.LEFT, false, false);
            CellStyle leftWrap = style(wb, normal, HorizontalAlignment.LEFT, true, false);
            CellStyle center = style(wb, normal, HorizontalAlignment.CENTER, false, false);
            CellStyle boldCenter = style(wb, bold, HorizontalAlignment.CENTER, true, false);
            CellStyle titleStyle = style(wb, title, HorizontalAlignment.CENTER, true, false);
            CellStyle hint = style(wb, italic, HorizontalAlignment.CENTER, false, false);
            CellStyle cellLeft = style(wb, normal, HorizontalAlignment.LEFT, true, true);
            CellStyle cellCenter = style(wb, normal, HorizontalAlignment.CENTER, true, true);
            CellStyle cellHead = style(wb, bold, HorizontalAlignment.CENTER, true, true);

            Sheet sheet = wb.createSheet("BienBanBanGiao");
            int[] widths = {7, 58, 12, 14, 28};
            for (int i = 0; i < widths.length; i++) {
                sheet.setColumnWidth(i, widths[i] * 256);
            }

            int r = 0;
            r = merged(sheet, r, 0, 1, "TRƯỜNG ĐẠI HỌC KIÊN GIANG", center, 18);
            r = merged(sheet, r, 0, 1, "PHÒNG QUẢN TRỊ CƠ SỞ VẬT CHẤT", boldCenter, 18);
            r = blank(sheet, r, 10);
            r = merged(sheet, r, 0, COLS - 1, TITLE, titleStyle, 36);
            r = merged(sheet, r, 0, COLS - 1,
                    "Ngày " + date.getDayOfMonth() + " tháng " + date.getMonthValue() + " năm " + date.getYear(), center, 20);
            r = blank(sheet, r, 8);

            r = twoColumn(sheet, r, "- Họ tên người giao: " + nz(req.giverName()), "Địa chỉ: " + nz(req.giverAddress()), leftWrap);
            r = twoColumn(sheet, r, "- Họ tên người nhận: " + nz(req.receiverName()), "Địa chỉ: " + nz(req.receiverAddress()), leftWrap);
            r = merged(sheet, r, 0, COLS - 1, "- Địa điểm giao nhận: " + nz(req.place()), leftWrap, heightFor("- Địa điểm giao nhận: " + nz(req.place()), 120));
            r = blank(sheet, r, 8);
            r = merged(sheet, r, 0, COLS - 1, "Nội dung: " + nz(req.content()), leftWrap, heightFor("Nội dung: " + nz(req.content()), 120));
            r = blank(sheet, r, 6);

            Row head = sheet.createRow(r++);
            head.setHeightInPoints(34);
            String[] heads = {"STT", "Tên nhãn hiệu, quy cách, phẩm chất nguyên liệu, vật liệu, công cụ, dụng cụ", "ĐVT", "Số lượng", "Ghi chú"};
            for (int i = 0; i < heads.length; i++) {
                cell(head, i, heads[i], cellHead);
            }

            int stt = 1;
            for (HandoverLine l : lines) {
                Row row = sheet.createRow(r++);
                row.setHeightInPoints(heightFor(l.name(), 55));
                cell(row, 0, String.valueOf(stt++), cellCenter);
                cell(row, 1, l.name(), cellLeft);
                cell(row, 2, nz(l.unit()), cellCenter);
                Cell q = row.createCell(3);
                q.setCellValue(l.qty());
                q.setCellStyle(cellCenter);
                cell(row, 4, nz(l.note()), cellLeft);
            }
            if (lines.isEmpty()) {
                Row row = sheet.createRow(r++);
                for (int i = 0; i < COLS; i++) {
                    cell(row, i, "", cellLeft);
                }
            }

            r = blank(sheet, r, 10);
            Row sign1 = sheet.createRow(r);
            sign1.setHeightInPoints(20);
            mergeCell(sheet, r, 0, 1, "Bên giao", boldCenter);
            mergeCell(sheet, r, 2, 4, "Bên nhận", boldCenter);
            r++;
            Row sign2 = sheet.createRow(r);
            sign2.setHeightInPoints(20);
            mergeCell(sheet, r, 0, 1, "(Ký, ghi rõ họ tên)", hint);
            mergeCell(sheet, r, 2, 3, "Lãnh đạo đơn vị", boldCenter);
            cell(sign2, 4, "Người nhận", boldCenter);
            r++;
            Row space = sheet.createRow(r);
            space.setHeightInPoints(70);
            r++;
            Row names = sheet.createRow(r);
            names.setHeightInPoints(20);
            mergeCell(sheet, r, 0, 1, nz(req.giverName()), boldCenter);
            cell(names, 4, nz(req.receiverName()), boldCenter);

            sheet.getPrintSetup().setPaperSize(PrintSetup.A4_PAPERSIZE);
            sheet.getPrintSetup().setFitWidth((short) 1);
            sheet.getPrintSetup().setFitHeight((short) 0);
            sheet.setFitToPage(true);
            sheet.setHorizontallyCenter(true);
            sheet.setMargin(Sheet.LeftMargin, 0.5);
            sheet.setMargin(Sheet.RightMargin, 0.4);
            sheet.setMargin(Sheet.TopMargin, 0.6);
            sheet.setMargin(Sheet.BottomMargin, 0.6);
            sheet.setDisplayGridlines(false);

            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Không tạo được biên bản bàn giao", e);
        }
    }

    private List<HandoverLine> cleanLines(List<HandoverLine> in) {
        List<HandoverLine> out = new ArrayList<>();
        if (in == null) {
            return out;
        }
        if (in.size() > MAX_LINES) {
            throw new IllegalArgumentException("Số dòng hàng quá nhiều (tối đa " + MAX_LINES + ").");
        }
        for (HandoverLine l : in) {
            if (l == null || l.name() == null || l.name().isBlank() || l.qty() <= 0) {
                continue;
            }
            if (l.name().length() > 300 || (l.note() != null && l.note().length() > 300) || (l.unit() != null && l.unit().length() > 50)) {
                throw new IllegalArgumentException("Nội dung một dòng hàng quá dài.");
            }
            out.add(new HandoverLine(l.name().trim(), l.unit() == null ? "" : l.unit().trim(), l.qty(),
                    l.note() == null ? "" : l.note().trim()));
        }
        return out;
    }

    private static Font font(XSSFWorkbook wb, int size, boolean bold, boolean italic) {
        Font f = wb.createFont();
        f.setFontName("Times New Roman");
        f.setFontHeightInPoints((short) size);
        f.setBold(bold);
        f.setItalic(italic);
        return f;
    }

    private static CellStyle style(XSSFWorkbook wb, Font font, HorizontalAlignment h, boolean wrap, boolean border) {
        CellStyle s = wb.createCellStyle();
        s.setFont(font);
        s.setAlignment(h);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        s.setWrapText(wrap);
        if (border) {
            s.setBorderTop(BorderStyle.THIN);
            s.setBorderBottom(BorderStyle.THIN);
            s.setBorderLeft(BorderStyle.THIN);
            s.setBorderRight(BorderStyle.THIN);
        }
        return s;
    }

    private static int blank(Sheet sheet, int r, int height) {
        sheet.createRow(r).setHeightInPoints(height);
        return r + 1;
    }

    private static int merged(Sheet sheet, int r, int from, int to, String text, CellStyle style, float height) {
        Row row = sheet.createRow(r);
        row.setHeightInPoints(height);
        mergeCell(sheet, r, from, to, text, style);
        return r + 1;
    }

    private static void mergeCell(Sheet sheet, int r, int from, int to, String text, CellStyle style) {
        Row row = sheet.getRow(r) != null ? sheet.getRow(r) : sheet.createRow(r);
        cell(row, from, text, style);
        for (int c = from + 1; c <= to; c++) {
            row.createCell(c).setCellStyle(style);
        }
        if (to > from) {
            sheet.addMergedRegion(new CellRangeAddress(r, r, from, to));
        }
    }

    private static int twoColumn(Sheet sheet, int r, String leftText, String rightText, CellStyle style) {
        Row row = sheet.createRow(r);
        row.setHeightInPoints(Math.max(heightFor(leftText, 70), heightFor(rightText, 40)));
        mergeCell(sheet, r, 0, 2, leftText, style);
        mergeCell(sheet, r, 3, 4, rightText, style);
        return r + 1;
    }

    private static void cell(Row row, int col, String text, CellStyle style) {
        Cell c = row.createCell(col);
        c.setCellValue(text);
        c.setCellStyle(style);
    }

    private static float heightFor(String text, int charsPerLine) {
        int lines = Math.max(1, (int) Math.ceil(text.length() / (double) charsPerLine));
        return Math.max(20, lines * 16.5f + 4);
    }

    private static String nz(String s) {
        return s == null ? "" : s.trim();
    }

}
