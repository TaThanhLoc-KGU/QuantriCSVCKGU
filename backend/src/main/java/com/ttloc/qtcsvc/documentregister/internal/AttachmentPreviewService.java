package com.ttloc.qtcsvc.documentregister.internal;

import com.ttloc.qtcsvc.shared.FileStorageService;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;

/**
 * Trich van ban thuan (khong giu dinh dang) tu file .doc/.docx dinh kem, de
 * hien thi xem truoc ngay trong trang admin - trinh duyet khong co san cong
 * cu xem Word nen day la cach duy nhat "mo" duoc noi dung ma khong can tai
 * ve/mo bang Word.
 */
@Service
class AttachmentPreviewService {

    private final FileStorageService fileStorage;

    AttachmentPreviewService(FileStorageService fileStorage) {
        this.fileStorage = fileStorage;
    }

    boolean supports(String filename) {
        String ext = extensionOf(filename);
        return ext.equals("docx") || ext.equals("doc");
    }

    String extractText(String objectKey, String filename) {
        String ext = extensionOf(filename);
        try (InputStream in = fileStorage.open(objectKey)) {
            if (ext.equals("docx")) {
                try (XWPFDocument doc = new XWPFDocument(in); XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
                    return extractor.getText();
                }
            }
            if (ext.equals("doc")) {
                try (HWPFDocument doc = new HWPFDocument(in); WordExtractor extractor = new WordExtractor(doc)) {
                    return extractor.getText();
                }
            }
            throw new IllegalArgumentException("Dinh dang khong ho tro xem truoc: " + ext);
        } catch (IOException e) {
            throw new IllegalStateException("Khong the doc noi dung file dinh kem", e);
        }
    }

    private String extensionOf(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot < 0 ? "" : filename.substring(dot + 1).toLowerCase();
    }
}
