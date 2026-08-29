package com.ttloc.qtcsvc.congvanlink.internal;

import com.ttloc.qtcsvc.shared.ExternalServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Optional;

/**
 * Doc van ban den ma phong (QTCSVC) duoc giao xu ly, qua API theo don vi cua
 * he thong Cong van (X-Api-Key, moi key gan dung 1 don vi - khong can truyen
 * ma don vi thu cong nhu truoc). Thay the hoan toan CongVanRepository cu (ket
 * noi thang SQL Server, chi chay duoc voi Windows Integrated Auth).
 */
@Component
class CongVanDenApiClient {

    private static final Logger log = LoggerFactory.getLogger(CongVanDenApiClient.class);

    private final RestClient restClient;
    private final String baseUrl;
    private final String apiKey;

    CongVanDenApiClient(RestClient.Builder builder,
                         @Value("${app.congvan.den-api-base-url}") String baseUrl,
                         @Value("${app.congvan.api-key:}") String apiKey) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.restClient = builder.build();
    }

    CongVanDenApiDtos.ListResponse list(Integer nam, String q, int page, int pageSize) {
        requireApiKey();
        String url = UriComponentsBuilder.fromUriString(baseUrl)
                .queryParamIfPresent("nam", Optional.ofNullable(nam))
                .queryParamIfPresent("q", Optional.ofNullable(q))
                .queryParam("page", page)
                .queryParam("pageSize", pageSize)
                .toUriString();
        try {
            return restClient.get().uri(url).header("X-Api-Key", apiKey).retrieve().body(CongVanDenApiDtos.ListResponse.class);
        } catch (Exception e) {
            log.error("Khong the doc danh sach van ban den tu he thong Cong van", e);
            throw new ExternalServiceException("Không thể kết nối API văn bản đến của hệ thống Công văn.", e);
        }
    }

    /**
     * Tra ve null neu van ban khong ton tai / khong thuoc don vi cua key (404).
     */
    CongVanDenApiDtos.Detail detail(String id) {
        requireApiKey();
        try {
            return restClient.get().uri(baseUrl + "/{id}", id).header("X-Api-Key", apiKey).retrieve().body(CongVanDenApiDtos.Detail.class);
        } catch (HttpClientErrorException.NotFound e) {
            return null;
        } catch (Exception e) {
            log.error("Khong the doc chi tiet van ban den id={} tu he thong Cong van", id, e);
            throw new ExternalServiceException("Không thể kết nối API văn bản đến của hệ thống Công văn.", e);
        }
    }

    /**
     * Tra ve null neu file khong ton tai / khong thuoc van ban cua don vi (404).
     */
    byte[] downloadFile(String id, long fileId, String[] contentTypeOut) {
        requireApiKey();
        try {
            ResponseEntity<byte[]> res = restClient.get()
                    .uri(baseUrl + "/{id}/files/{fileId}", id, fileId)
                    .header("X-Api-Key", apiKey)
                    .retrieve().toEntity(byte[].class);
            contentTypeOut[0] = res.getHeaders().getContentType() != null ? res.getHeaders().getContentType().toString() : "application/octet-stream";
            return res.getBody();
        } catch (HttpClientErrorException.NotFound e) {
            return null;
        } catch (Exception e) {
            log.error("Khong the tai file van ban den id={} fileId={} tu he thong Cong van", id, fileId, e);
            throw new ExternalServiceException("Không thể tải tệp văn bản từ hệ thống Công văn.", e);
        }
    }

    private void requireApiKey() {
        if (apiKey.isBlank()) {
            throw new ExternalServiceException("Chưa cấu hình API Key cho hệ thống Công văn (CONGVAN_API_KEY).");
        }
    }

}
