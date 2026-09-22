package com.ttloc.qtcsvc.shared.internal;

import com.ttloc.qtcsvc.shared.FileStorageService;
import com.ttloc.qtcsvc.shared.StoredObject;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.StatObjectArgs;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.UUID;

@Service
class MinioFileStorageService implements FileStorageService {

    private final MinioClient client;
    private final MinioProperties properties;

    MinioFileStorageService(MinioClient client, MinioProperties properties) {
        this.client = client;
        this.properties = properties;
    }

    @Override
    public StoredObject upload(String folder, String originalFileName, String contentType, InputStream data, long size) {
        String objectKey = folder + "/" + UUID.randomUUID() + "-" + sanitize(originalFileName);
        try {
            client.putObject(PutObjectArgs.builder()
                    .bucket(properties.bucket())
                    .object(objectKey)
                    .stream(data, size, -1)
                    .contentType(contentType)
                    .build());
        } catch (Exception e) {
            throw new IllegalStateException("Khong the tai file len MinIO: " + originalFileName, e);
        }
        return new StoredObject(objectKey, originalFileName, size);
    }

    @Override
    public InputStream open(String objectKey) {
        try {
            return client.getObject(GetObjectArgs.builder()
                    .bucket(properties.bucket())
                    .object(objectKey)
                    .build());
        } catch (Exception e) {
            throw new IllegalStateException("Khong the doc file tren MinIO: " + objectKey, e);
        }
    }

    @Override
    public String contentType(String objectKey) {
        try {
            return client.statObject(StatObjectArgs.builder()
                    .bucket(properties.bucket())
                    .object(objectKey)
                    .build()).contentType();
        } catch (Exception e) {
            throw new IllegalStateException("Khong the lay thong tin file tren MinIO: " + objectKey, e);
        }
    }

    @Override
    public void delete(String objectKey) {
        try {
            client.removeObject(RemoveObjectArgs.builder()
                    .bucket(properties.bucket())
                    .object(objectKey)
                    .build());
        } catch (Exception e) {
            throw new IllegalStateException("Khong the xoa file tren MinIO: " + objectKey, e);
        }
    }

    private static String sanitize(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "file";
        }
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

}
