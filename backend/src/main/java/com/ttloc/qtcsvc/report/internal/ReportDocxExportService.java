package com.ttloc.qtcsvc.report.internal;

import com.ttloc.qtcsvc.report.PeriodType;
import com.ttloc.qtcsvc.report.Report;
import com.ttloc.qtcsvc.settings.SettingKeys;
import com.ttloc.qtcsvc.settings.SettingsService;
import org.apache.poi.xwpf.usermodel.ParagraphAlignment;
import org.apache.poi.xwpf.usermodel.UnderlinePatterns;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTPageMar;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTSectPr;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigInteger;
import java.util.List;
import java.util.Map;

/**
 * Xuat bao cao ra .docx theo mau the thuc hanh chinh (spec 8.2/8.4): quoc
 * hieu, ten don vi, tieu de, than bai theo cac muc co dinh. Dung Apache POI
 * XWPF. Day la layout DON GIAN HOA (khong lam bang 2 cot quoc hieu/don vi
 * dung chuan van thu chinh thuc) - du de dung ngay, co the tinh chinh sau.
 */
@Service
class ReportDocxExportService {

    private record SectionHeading(String key, String label, boolean optional) {
    }

    private static final List<SectionHeading> BEFORE_MUC3 = List.of(
            new SectionHeading("muc1", "I. ĐẶC ĐIỂM TÌNH HÌNH", false),
            new SectionHeading("muc2", "II. CÔNG TÁC CHỈ ĐẠO, ĐIỀU HÀNH", false)
    );

    private static final List<SectionHeading> MUC3_SUB = List.of(
            new SectionHeading("muc3.xay_dung", "1. Về công tác xây dựng, bảo dưỡng, sửa chữa", false),
            new SectionHeading("muc3.mang_muasam", "2. Về công tác quản trị mạng, mua sắm và quản lý tài sản", false),
            new SectionHeading("muc3.canh_quan", "3. Về công tác cảnh quan và môi trường", false),
            new SectionHeading("muc3.phoi_hop", "4. Về công tác phối hợp", true)
    );

    private static final SectionHeading MUC4 = new SectionHeading("muc4", "IV. CÔNG TÁC ĐOÀN THỂ VÀ PHỤC VỤ CỘNG ĐỒNG", false);
    private static final SectionHeading MUC5 = new SectionHeading("muc5", "V. PHƯƠNG HƯỚNG KỲ TỚI", true);

    private final ReportService reportService;
    private final SettingsService settingsService;

    ReportDocxExportService(ReportService reportService, SettingsService settingsService) {
        this.reportService = reportService;
        this.settingsService = settingsService;
    }

    byte[] export(String periodId) {
        Report report = reportService.getOrCreate(periodId);
        Map<String, String> sections = reportService.readSections(report);
        ParsedPeriod period = ParsedPeriod.parse(periodId);

        try (XWPFDocument doc = new XWPFDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            setAdministrativeMargins(doc);
            writeHeader(doc, period);
            writeTitle(doc, period);

            for (SectionHeading h : BEFORE_MUC3) {
                writeSection(doc, h, sections.get(h.key()));
            }

            writeHeadingOnly(doc, "III. CÔNG TÁC CHUYÊN MÔN");
            for (SectionHeading h : MUC3_SUB) {
                writeSection(doc, h, sections.get(h.key()));
            }

            writeSection(doc, MUC4, sections.get(MUC4.key()));
            writeSection(doc, MUC5, sections.get(MUC5.key()));

            doc.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Khong the xuat file Word", e);
        }
    }

    private void setAdministrativeMargins(XWPFDocument doc) {
        CTSectPr sectPr = doc.getDocument().getBody().isSetSectPr()
                ? doc.getDocument().getBody().getSectPr()
                : doc.getDocument().getBody().addNewSectPr();
        CTPageMar pageMar = sectPr.isSetPgMar() ? sectPr.getPgMar() : sectPr.addNewPgMar();
        pageMar.setTop(BigInteger.valueOf(1134));    // ~20mm
        pageMar.setBottom(BigInteger.valueOf(1134)); // ~20mm
        pageMar.setLeft(BigInteger.valueOf(1701));   // ~30mm
        pageMar.setRight(BigInteger.valueOf(1134));  // ~20mm
    }

    private void writeHeader(XWPFDocument doc, ParsedPeriod period) {
        String orgDept = settingsService.getOrDefault(SettingKeys.ORG_DEPT, "PHÒNG QUẢN TRỊ CƠ SỞ VẬT CHẤT");
        centeredBoldRun(doc, orgDept.toUpperCase(), 13, false);

        centeredBoldRun(doc, "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", 13, false);
        XWPFParagraph slogan = doc.createParagraph();
        slogan.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun sloganRun = slogan.createRun();
        sloganRun.setBold(true);
        sloganRun.setFontFamily("Times New Roman");
        sloganRun.setFontSize(13);
        sloganRun.setUnderline(UnderlinePatterns.SINGLE);
        sloganRun.setText("Độc lập - Tự do - Hạnh phúc");

        XWPFParagraph numberLine = doc.createParagraph();
        numberLine.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun numberRun = numberLine.createRun();
        numberRun.setItalic(true);
        numberRun.setFontFamily("Times New Roman");
        numberRun.setFontSize(13);
        numberRun.setText("Số: ......../BC-QTCSVC");

        doc.createParagraph();
    }

    private void writeTitle(XWPFDocument doc, ParsedPeriod period) {
        centeredBoldRun(doc, "BÁO CÁO", 15, false);
        centeredBoldRun(doc, "Kết quả công tác " + periodLabel(period), 14, true);
        doc.createParagraph();
    }

    private String periodLabel(ParsedPeriod period) {
        return period.type() == PeriodType.MONTH
                ? "tháng " + period.value() + " năm " + period.year()
                : "quý " + period.value() + " năm " + period.year();
    }

    private void writeSection(XWPFDocument doc, SectionHeading heading, String content) {
        if (heading.optional() && (content == null || content.isBlank())) {
            return;
        }
        writeHeadingOnly(doc, heading.label());
        writeBody(doc, content);
    }

    private void writeHeadingOnly(XWPFDocument doc, String text) {
        XWPFParagraph p = doc.createParagraph();
        p.setSpacingBefore(200);
        XWPFRun r = p.createRun();
        r.setBold(true);
        r.setFontFamily("Times New Roman");
        r.setFontSize(13);
        r.setText(text);
    }

    private void writeBody(XWPFDocument doc, String text) {
        String value = (text == null || text.isBlank()) ? "(Chưa có nội dung)" : text;
        XWPFParagraph p = doc.createParagraph();
        p.setAlignment(ParagraphAlignment.BOTH);
        p.setIndentationFirstLine(720);
        XWPFRun r = p.createRun();
        r.setFontFamily("Times New Roman");
        r.setFontSize(13);
        r.setText(value);
    }

    private void centeredBoldRun(XWPFDocument doc, String text, int fontSize, boolean italic) {
        XWPFParagraph p = doc.createParagraph();
        p.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun r = p.createRun();
        r.setBold(true);
        r.setItalic(italic);
        r.setFontFamily("Times New Roman");
        r.setFontSize(fontSize);
        r.setText(text);
    }

}
