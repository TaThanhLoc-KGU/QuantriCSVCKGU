-- Theo xac nhan cua chu du an: 2 dong "Bao cao tham dinh" (BCTD) nhap tu sheet
-- "van ban di" thuc ra thuoc loai To trinh (TTR) - loai BCTD la minh tu suy
-- dien sai tu ky hieu trong file, khong phai loai van ban chinh thuc rieng.
-- Gop lai vao TTR, cap so tiep theo (68, 69) va xoa loai BCTD vua tao thua.

UPDATE document_numbers
SET document_type_id = (SELECT id FROM document_types WHERE code = 'TTR'),
    number_int = 68,
    number_display = '68/' || (SELECT symbol_code FROM document_types WHERE code = 'TTR')
WHERE document_type_id = (SELECT id FROM document_types WHERE code = 'BCTD')
  AND title = 'báo cáo thẩm định công trình bảo dưỡng sửa chữa nhà A';

UPDATE document_numbers
SET document_type_id = (SELECT id FROM document_types WHERE code = 'TTR'),
    number_int = 69,
    number_display = '69/' || (SELECT symbol_code FROM document_types WHERE code = 'TTR')
WHERE document_type_id = (SELECT id FROM document_types WHERE code = 'BCTD')
  AND title = 'báo cáo thẩm định công trình xây dựng nhà xưởng thực hành cơ khí';

DELETE FROM document_types WHERE code = 'BCTD';
