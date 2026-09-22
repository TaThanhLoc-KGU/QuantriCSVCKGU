-- V14 da chen 1 dong to trinh MAU (demo) voi so 3/2026, nay bi trung voi du lieu
-- that nhap tu file excel (V15). Xoa dong mau de tranh trung so gay nham lan.
DELETE FROM document_numbers
WHERE document_type_id = (SELECT id FROM document_types WHERE code = 'TTR')
  AND year = 2026
  AND number_int = 3
  AND title = 'Đề nghị bổ sung kinh phí sửa chữa dãy phòng học B';
