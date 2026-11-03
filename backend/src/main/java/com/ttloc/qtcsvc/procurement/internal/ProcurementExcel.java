package com.ttloc.qtcsvc.procurement.internal;

import com.ttloc.qtcsvc.procurement.ProcurementItem;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.SummaryRow;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.UnitRef;
import com.ttloc.qtcsvc.procurement.internal.ProcurementService.ExportData;
import com.ttloc.qtcsvc.procurement.internal.ProcurementService.ExportLine;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.text.Normalizer;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Doc danh muc hang tu Excel va xuat file tong hop theo mau sheet TongHop cu. */
@Component
class ProcurementExcel {

    record ParseError(int rowNumber, String message) {
    }

    record ParseResult(List<ProcurementItem> items, List<ParseError> errors) {
    }

    private static final DateTimeFormatter STAMP = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy")
            .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    /**
     * Cot nhan theo ten o dong tieu de: "Ten hang" bat buoc; "Ma hang" (de trong = he thong tu tang ma),
     * "Nhom", "DVT", "Hien thi" tuy chon. Hien thi = Khong/false/0 thi an khoi form.
     */
    ParseResult parseItems(InputStream in, String audience) {
        List<ProcurementItem> items = new ArrayList<>();
        List<ParseError> errors = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        DataFormatter fmt = new DataFormatter();
        try (Workbook wb = WorkbookFactory.create(in)) {
            // Uu tien sheet ten "DanhMuc", roi sheet co cot "Nhom"; cuoi cung sheet dau tien co du cot bat buoc
            // (tranh nham voi sheet tong hop cung co "Ma hang"/"Ten hang" nhung toan cong thuc).
            Sheet sheet = null;
            Map<String, Integer> cols = new HashMap<>();
            int bestScore = -1;
            for (Sheet candidate : wb) {
                Row header = candidate.getRow(0);
                if (header == null) {
                    continue;
                }
                Map<String, Integer> found = new HashMap<>();
                for (Cell c : header) {
                    found.putIfAbsent(normalize(fmt.formatCellValue(c)), c.getColumnIndex());
                }
                if (column(found, "ten hang") < 0) {
                    continue;
                }
                int score = (normalize(candidate.getSheetName()).replace(" ", "").equals("danhmuc") ? 2 : 0)
                        + (column(found, "nhom") >= 0 ? 1 : 0);
                if (score > bestScore) {
                    bestScore = score;
                    sheet = candidate;
                    cols = found;
                }
            }
            if (sheet == null) {
                throw new IllegalArgumentException("Không tìm thấy sheet nào có cột \"Tên hàng\" ở dòng tiêu đề.");
            }
            int code = column(cols, "ma hang");
            int name = column(cols, "ten hang");
            int group = column(cols, "nhom");
            int unit = column(cols, "dvt");
            int visible = column(cols, "hien thi");

            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) {
                    continue;
                }
                String c = read(row, code, fmt);
                String n = read(row, name, fmt);
                if (c == null && n == null) {
                    continue;
                }
                if (n == null) {
                    errors.add(new ParseError(r + 1, "Thiếu \"Tên hàng\""));
                    continue;
                }
                if (c != null ? !seen.add("c:" + c) : !seen.add("n:" + normalize(n))) {
                    errors.add(new ParseError(r + 1, c != null ? "Mã hàng \"" + c + "\" bị trùng trong file" : "Tên hàng \"" + n + "\" bị trùng trong file"));
                    continue;
                }
                String v = read(row, visible, fmt);
                boolean show = v == null || v.matches("(?i)(có|co|true|x|1|yes)");
                String g = read(row, group, fmt);
                String u = read(row, unit, fmt);
                items.add(new ProcurementItem(null, audience, c, g == null ? "Khác" : g, n, u == null ? "" : u,
                        items.size() + 1, show));
            }
        } catch (IOException e) {
            throw new IllegalStateException("Không đọc được file Excel", e);
        }
        return new ParseResult(items, errors);
    }

    /** File mau nhap danh muc: sheet DanhMuc (chi co dong tieu de de dien) + sheet HuongDan. */
    byte[] itemTemplate() {
        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Font bold = wb.createFont();
            bold.setBold(true);
            CellStyle head = wb.createCellStyle();
            head.setFont(bold);
            head.setBorderBottom(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            head.setFillForegroundColor(org.apache.poi.ss.usermodel.IndexedColors.LIGHT_YELLOW.getIndex());
            head.setFillPattern(org.apache.poi.ss.usermodel.FillPatternType.SOLID_FOREGROUND);

            Sheet data = wb.createSheet("DanhMuc");
            String[] cols = {"Mã hàng", "Nhóm", "Tên hàng", "ĐVT", "Hiển thị"};
            Row h = data.createRow(0);
            for (int i = 0; i < cols.length; i++) {
                cell(h, i, cols[i], head);
            }
            int[] widths = {12, 28, 52, 10, 10};
            for (int i = 0; i < widths.length; i++) {
                data.setColumnWidth(i, widths[i] * 256);
            }
            data.createFreezePane(0, 1);

            Sheet guide = wb.createSheet("HuongDan");
            String[] lines = {
                    "HƯỚNG DẪN NHẬP DANH MỤC HÀNG TỪ EXCEL",
                    "",
                    "Điền dữ liệu vào sheet DanhMuc, mỗi mặt hàng một dòng. Dòng 1 là tiêu đề, không xóa, không đổi tên cột.",
                    "Tên hàng: bắt buộc.",
                    "Mã hàng: để TRỐNG thì hệ thống tự tăng (phòng: VPP078, VPP079...; khoa: KH001, KH002...). Chỉ điền khi muốn tự đặt mã hoặc cập nhật một mặt hàng đã có theo mã.",
                    "Nhóm: tên nhóm hiển thị trên form (vd: Giấy & bìa in). Để trống thì xếp vào nhóm \"Khác\".",
                    "ĐVT: đơn vị tính (Thùng, Cây, Hộp, Cái...).",
                    "Hiển thị: Có hoặc Không. Để trống = Có. Chọn Không để ẩn mặt hàng khỏi form mà không xóa.",
                    "",
                    "Nhập lại file nhiều lần không bị trùng: dòng để trống mã mà tên hàng đã có sẵn thì cập nhật mặt hàng đó, không tạo thêm.",
                    "Mặt hàng mới được thêm xuống cuối danh mục; mặt hàng đã có giữ nguyên thứ tự."
            };
            for (int i = 0; i < lines.length; i++) {
                Cell c = guide.createRow(i).createCell(0);
                c.setCellValue(lines[i]);
                if (i == 0) {
                    c.setCellStyle(head);
                }
            }
            guide.setColumnWidth(0, 120 * 256);

            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Không tạo được file mẫu", e);
        }
    }

    byte[] export(ExportData data) {
        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Font bold = wb.createFont();
            bold.setBold(true);
            CellStyle head = wb.createCellStyle();
            head.setFont(bold);
            head.setWrapText(true);
            head.setBorderBottom(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            head.setFillForegroundColor(org.apache.poi.ss.usermodel.IndexedColors.GREY_25_PERCENT.getIndex());
            head.setFillPattern(org.apache.poi.ss.usermodel.FillPatternType.SOLID_FOREGROUND);
            CellStyle strong = wb.createCellStyle();
            strong.setFont(bold);

            // TongHop: hang = mat hang, cot = don vi, cot cuoi = tong
            Sheet total = wb.createSheet("TongHop");
            List<UnitRef> units = data.summary().units();
            Row h = total.createRow(0);
            String[] fixed = {"STT", "Mã hàng", "Tên hàng", "ĐVT"};
            for (int i = 0; i < fixed.length; i++) {
                cell(h, i, fixed[i], head);
            }
            for (int i = 0; i < units.size(); i++) {
                cell(h, fixed.length + i, units.get(i).name(), head);
            }
            cell(h, fixed.length + units.size(), "Tổng", head);

            int r = 1;
            int stt = 1;
            for (SummaryRow row : data.summary().rows()) {
                Row x = total.createRow(r++);
                x.createCell(0).setCellValue(stt++);
                x.createCell(1).setCellValue(row.code());
                x.createCell(2).setCellValue(row.name());
                x.createCell(3).setCellValue(row.unit());
                for (int i = 0; i < units.size(); i++) {
                    Integer q = row.qtyByUnit().get(units.get(i).id());
                    if (q != null) {
                        x.createCell(fixed.length + i).setCellValue(q);
                    }
                }
                Cell t = x.createCell(fixed.length + units.size());
                t.setCellValue(row.total());
                t.setCellStyle(strong);
            }
            total.createFreezePane(4, 1);
            total.setColumnWidth(0, 6 * 256);
            total.setColumnWidth(1, 11 * 256);
            total.setColumnWidth(2, 48 * 256);
            total.setColumnWidth(3, 9 * 256);
            for (int i = 0; i <= units.size(); i++) {
                total.setColumnWidth(fixed.length + i, 14 * 256);
            }

            // ChiTiet: tung dong don vi da dang ky
            Sheet detail = wb.createSheet("ChiTiet");
            String[] dh = {"Mã ĐV", "Tên đơn vị", "Mã hàng", "Tên hàng", "ĐVT", "Số lượng", "Ghi chú", "Cập nhật lúc"};
            Row d0 = detail.createRow(0);
            for (int i = 0; i < dh.length; i++) {
                cell(d0, i, dh[i], head);
            }
            int dr = 1;
            for (ExportLine l : data.lines()) {
                Row x = detail.createRow(dr++);
                x.createCell(0).setCellValue(l.unitCode());
                x.createCell(1).setCellValue(l.unitName());
                x.createCell(2).setCellValue(l.itemCode());
                x.createCell(3).setCellValue(l.itemName());
                x.createCell(4).setCellValue(l.unitLabel());
                x.createCell(5).setCellValue(l.qty());
                x.createCell(6).setCellValue(l.note() == null ? "" : l.note());
                x.createCell(7).setCellValue(l.updatedAt() == null ? "" : STAMP.format(l.updatedAt()));
            }
            int[] dw = {10, 24, 11, 48, 9, 10, 36, 18};
            for (int i = 0; i < dw.length; i++) {
                detail.setColumnWidth(i, dw[i] * 256);
            }
            detail.createFreezePane(0, 1);

            // TrangThai: don vi nao da nop
            Sheet st = wb.createSheet("TrangThai");
            String[] sh = {"Mã ĐV", "Tên đơn vị", "Đã nộp", "Số mặt hàng", "Tổng số lượng",
                    "Đề xuất khác / ghi chú chung", "Cập nhật lúc", "Số lần lưu"};
            Row s0 = st.createRow(0);
            for (int i = 0; i < sh.length; i++) {
                cell(s0, i, sh[i], head);
            }
            int sr = 1;
            for (ProcurementDtos.StatusRow s : data.status()) {
                Row x = st.createRow(sr++);
                x.createCell(0).setCellValue(s.unitCode());
                x.createCell(1).setCellValue(s.unitName());
                x.createCell(2).setCellValue(s.submitted() ? "Có" : "Chưa");
                x.createCell(3).setCellValue(s.itemCount());
                x.createCell(4).setCellValue(s.totalQty());
                x.createCell(5).setCellValue(s.generalNote() == null ? "" : s.generalNote());
                x.createCell(6).setCellValue(s.updatedAt() == null ? "" : STAMP.format(s.updatedAt()));
                x.createCell(7).setCellValue(s.timesSaved());
            }
            int[] sw = {10, 24, 9, 12, 14, 60, 18, 10};
            for (int i = 0; i < sw.length; i++) {
                st.setColumnWidth(i, sw[i] * 256);
            }
            st.createFreezePane(0, 1);

            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Không tạo được file Excel", e);
        }
    }

    private static void cell(Row row, int col, String value, CellStyle style) {
        Cell c = row.createCell(col);
        c.setCellValue(value);
        c.setCellStyle(style);
    }

    /** Tim cot theo ten da chuan hoa; chap nhan ghi chu trong ngoac, vd "Ma hang (de trong = tu tang)". */
    private static int column(Map<String, Integer> cols, String key) {
        Integer exact = cols.get(key);
        if (exact != null) {
            return exact;
        }
        for (Map.Entry<String, Integer> e : cols.entrySet()) {
            if (e.getKey().startsWith(key + " (")) {
                return e.getValue();
            }
        }
        return -1;
    }

    static String normalizeName(String s) {
        return normalize(s);
    }

    private static int require(Map<String, Integer> cols, String name) {
        Integer idx = cols.get(name);
        if (idx == null) {
            throw new IllegalArgumentException("File thiếu cột \"" + name + "\" ở dòng tiêu đề.");
        }
        return idx;
    }

    private static String normalize(String s) {
        return Normalizer.normalize(s == null ? "" : s, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replace('đ', 'd').replace('Đ', 'd')
                .toLowerCase().trim().replaceAll("\\s+", " ");
    }

    private static String read(Row row, int col, DataFormatter fmt) {
        if (col < 0) {
            return null;
        }
        Cell cell = row.getCell(col);
        if (cell == null) {
            return null;
        }
        String t = fmt.formatCellValue(cell).trim();
        return t.isEmpty() ? null : t;
    }

}
