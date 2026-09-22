package com.ttloc.qtcsvc.shared.internal;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@EnableConfigurationProperties(MinioProperties.class)
class MinioConfig {

    @Bean
    MinioClient minioClient(MinioProperties properties) {
        return MinioClient.builder()
                .endpoint(properties.endpoint())
                .credentials(properties.accessKey(), properties.secretKey())
                .build();
    }

    /**
     * Tu tao bucket neu chua co. Boc try/catch de KHONG lam sap ung dung khi
     * MinIO chua chay (vd dang dev chi test Postgres truoc) - tinh nang file
     * se loi khi thuc su goi toi cho den khi MinIO san sang.
     */
    @Bean
    ApplicationRunner ensureMinioBucketExists(MinioClient client, MinioProperties properties) {
        return args -> {
            try {
                boolean exists = client.bucketExists(BucketExistsArgs.builder().bucket(properties.bucket()).build());
                if (!exists) {
                    client.makeBucket(MakeBucketArgs.builder().bucket(properties.bucket()).build());
                    log.info("Da tao MinIO bucket '{}'", properties.bucket());
                }
            } catch (Exception e) {
                log.warn("Khong ket noi duoc MinIO luc khoi dong ({}). Tinh nang luu/doc file se loi cho den khi MinIO san sang.",
                        e.getMessage());
            }
        };
    }

}
