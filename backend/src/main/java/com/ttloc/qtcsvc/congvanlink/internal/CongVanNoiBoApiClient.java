package com.ttloc.qtcsvc.congvanlink.internal;

import com.ttloc.qtcsvc.congvanlink.CongVanInternalDocument;
import com.ttloc.qtcsvc.shared.ExternalServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

/**
 * Doc/ghi so van ban noi bo cua chinh phong (QTCSVC) tren he thong Cong van,
 * qua API rieng cho don vi (X-Api-Key). Khac voi van ban den/di (chi doc),
 * day la du lieu cua chinh don vi minh nen co day du CRUD + file dinh kem.
 */
@Component
class CongVanNoiBoApiClient {

    private static final Logger log = LoggerFactory.getLogger(CongVanNoiBoApiClient.class);

    private final RestClient restClient;
    private final String baseUrl;
    private final String apiKey;

    CongVanNoiBoApiClient(RestClient.Builder builder,
                           @Value("${app.congvan.noibo-api-base-url}") String baseUrl,
                           @Value("${app.congvan.api-key:}") String apiKey) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.restClient = builder.build();
    }

    List<CongVanInternalDocument> list(Integer nam, String tuKhoa) {
        requireApiKey();
        String url = UriComponentsBuilder.fromUriString(baseUrl)
                .queryParamIfPresent("nam", Optional.ofNullable(nam))
                .queryParamIfPresent("tuKhoa", Optional.ofNullable(tuKhoa))
                .toUriString();
        try {
            return restClient.get().uri(url).header("X-Api-Key", apiKey).retrieve().body(new org.springframework.core.ParameterizedTypeReference<List<CongVanInternalDocument>>() {
            });
        } catch (Exception e) {
            log.error("Khong the doc danh sach van ban noi bo tu he thong Cong van", e);
            throw new ExternalServiceException("Không thể kết nối API văn bản nội bộ của hệ thống Công văn.", e);
        }
    }

    CongVanNoiBoApiDtos.Detail detail(long id) {
        requireApiKey();
        try {
            return restClient.get().uri(baseUrl + "/{id}", id).header("X-Api-Key", apiKey).retrieve().body(CongVanNoiBoApiDtos.Detail.class);
        } catch (HttpClientErrorException.NotFound e) {
            return null;
        } catch (Exception e) {
            log.error("Khong the doc chi tiet van ban noi bo id={} tu he thong Cong van", id, e);
            throw new ExternalServiceException("Không thể kết nối API văn bản nội bộ của hệ thống Công văn.", e);
        }
    }

    CongVanInternalDocument create(CongVanNoiBoApiDtos.SaveRequest body) {
        requireApiKey();
        try {
            return restClient.post().uri(baseUrl).header("X-Api-Key", apiKey).body(body).retrieve().body(CongVanInternalDocument.class);
        } catch (HttpClientErrorException.BadRequest e) {
            throw new IllegalArgumentException("Dữ liệu văn bản nội bộ không hợp lệ (thiếu tiêu đề hoặc ngày ban hành).");
        } catch (Exception e) {
            log.error("Khong the tao van ban noi bo tren he thong Cong van", e);
            throw new ExternalServiceException("Không thể tạo văn bản nội bộ trên hệ thống Công văn.", e);
        }
    }

    CongVanInternalDocument update(long id, CongVanNoiBoApiDtos.SaveRequest body) {
        requireApiKey();
        try {
            return restClient.put().uri(baseUrl + "/{id}", id).header("X-Api-Key", apiKey).body(body).retrieve().body(CongVanInternalDocument.class);
        } catch (HttpClientErrorException.NotFound e) {
            return null;
        } catch (Exception e) {
            log.error("Khong the sua van ban noi bo id={} tren he thong Cong van", id, e);
            throw new ExternalServiceException("Không thể sửa văn bản nội bộ trên hệ thống Công văn.", e);
        }
    }

    boolean delete(long id) {
        requireApiKey();
        try {
            restClient.delete().uri(baseUrl + "/{id}", id).header("X-Api-Key", apiKey).retrieve().toBodilessEntity();
            return true;
        } catch (HttpClientErrorException.NotFound e) {
            return false;
        } catch (Exception e) {
            log.error("Khong the xoa van ban noi bo id={} tren he thong Cong van", id, e);
            throw new ExternalServiceException("Không thể xoá văn bản nội bộ trên hệ thống Công văn.", e);
        }
    }

    CongVanNoiBoApiDtos.FileRef uploadFile(long id, MultipartFile file) {
        requireApiKey();
        try {
            MultiValueMap<String, Object> form = new LinkedMultiValueMap<>();
            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
            form.add("file", resource);
            return restClient.post().uri(baseUrl + "/{id}/files", id).header("X-Api-Key", apiKey)
                    .contentType(MediaType.MULTIPART_FORM_DATA).body(form).retrieve().body(CongVanNoiBoApiDtos.FileRef.class);
        } catch (IOException e) {
            throw new IllegalArgumentException("Không đọc được tệp đã chọn.");
        } catch (Exception e) {
            log.error("Khong the tai len file cho van ban noi bo id={} tren he thong Cong van", id, e);
            throw new ExternalServiceException("Không thể tải tệp lên hệ thống Công văn.", e);
        }
    }

    byte[] downloadFile(long id, long fileId, String[] contentTypeOut) {
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
            log.error("Khong the tai file van ban noi bo id={} fileId={} tu he thong Cong van", id, fileId, e);
            throw new ExternalServiceException("Không thể tải tệp văn bản từ hệ thống Công văn.", e);
        }
    }

    void deleteFile(long id, long fileId) {
        requireApiKey();
        try {
            restClient.delete().uri(baseUrl + "/{id}/files/{fileId}", id, fileId).header("X-Api-Key", apiKey).retrieve().toBodilessEntity();
        } catch (Exception e) {
            log.error("Khong the xoa file van ban noi bo id={} fileId={} tren he thong Cong van", id, fileId, e);
            throw new ExternalServiceException("Không thể xoá tệp trên hệ thống Công văn.", e);
        }
    }

    private void requireApiKey() {
        if (apiKey.isBlank()) {
            throw new ExternalServiceException("Chưa cấu hình API Key cho hệ thống Công văn (CONGVAN_API_KEY).");
        }
    }

}
