package com.ttloc.qtcsvc.shared;

import java.io.InputStream;

/**
 * Interface luu/doc file (MinIO). Cac module khac chi phu thuoc interface nay,
 * khong duoc dung thang MinioClient.
 */
public interface FileStorageService {

    StoredObject upload(String folder, String originalFileName, String contentType, InputStream data, long size);

    InputStream open(String objectKey);

    String contentType(String objectKey);

    void delete(String objectKey);

}
