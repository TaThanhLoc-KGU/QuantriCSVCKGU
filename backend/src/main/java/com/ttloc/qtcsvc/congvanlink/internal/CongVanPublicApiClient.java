package com.ttloc.qtcsvc.congvanlink.internal;

import com.ttloc.qtcsvc.congvanlink.CongVanOutgoingDocument;
import com.ttloc.qtcsvc.shared.ExternalServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * Doc van ban DI da duoc van thu gan "dau cong khai" tren he thong Cong van,
 * qua API cong khai (khong can dang nhap/API key) cua he thong do. Khac voi
 * CongVanRepository (van ban DEN, doc thang qua SQL Server) - day la mot
 * HTTP client don gian, khong can xu ly xac thuc gi ca.
 */
@Component
class CongVanPublicApiClient {

    private static final Logger log = LoggerFactory.getLogger(CongVanPublicApiClient.class);

    private final RestClient restClient;
    private final String baseUrl;

    CongVanPublicApiClient(RestClient.Builder builder, @Value("${app.congvan.public-api-base-url}") String baseUrl) {
        this.baseUrl = baseUrl;
        this.restClient = builder.build();
    }

    CongVanPublicApiDtos.ListResponse list(Integer nam, Integer maSCV, Integer maLVB, String q, int page, int pageSize) {
        String url = UriComponentsBuilder.fromUriString(baseUrl)
                .queryParamIfPresent("nam", java.util.Optional.ofNullable(nam))
                .queryParamIfPresent("maSCV", java.util.Optional.ofNullable(maSCV))
                .queryParamIfPresent("maLVB", java.util.Optional.ofNullable(maLVB))
                .queryParamIfPresent("q", java.util.Optional.ofNullable(q))
                .queryParam("page", page)
                .queryParam("pageSize", pageSize)
                .toUriString();
        try {
            return restClient.get().uri(url).retrieve().body(CongVanPublicApiDtos.ListResponse.class);
        } catch (Exception e) {
            log.error("Khong the doc danh sach van ban di cong khai tu he thong Cong van", e);
            throw new ExternalServiceException("Không thể kết nối API văn bản đi công khai của hệ thống Công văn.", e);
        }
    }

    /**
     * Tra ve null neu van ban khong ton tai / chua cong khai (404).
     */
    CongVanOutgoingDocument detail(String id) {
        try {
            return restClient.get().uri(baseUrl + "/{id}", id).retrieve().body(CongVanOutgoingDocument.class);
        } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
            return null;
        } catch (Exception e) {
            log.error("Khong the doc chi tiet van ban di cong khai id={} tu he thong Cong van", id, e);
            throw new ExternalServiceException("Không thể kết nối API văn bản đi công khai của hệ thống Công văn.", e);
        }
    }

    CongVanPublicApiDtos.CategoriesResponse categories() {
        try {
            return restClient.get().uri(baseUrl + "/danh-muc").retrieve().body(CongVanPublicApiDtos.CategoriesResponse.class);
        } catch (Exception e) {
            log.error("Khong the doc danh muc van ban di cong khai tu he thong Cong van", e);
            throw new ExternalServiceException("Không thể kết nối API văn bản đi công khai của hệ thống Công văn.", e);
        }
    }

    /**
     * Tra ve null neu van ban chua cong khai / khong ton tai (404).
     */
    byte[] downloadFile(String id, String[] contentTypeOut) {
        try {
            ResponseEntity<byte[]> res = restClient.get().uri(baseUrl + "/{id}/tai-file", id).retrieve().toEntity(byte[].class);
            contentTypeOut[0] = res.getHeaders().getContentType() != null ? res.getHeaders().getContentType().toString() : "application/octet-stream";
            return res.getBody();
        } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
            return null;
        } catch (Exception e) {
            log.error("Khong the tai file van ban di cong khai id={} tu he thong Cong van", id, e);
            throw new ExternalServiceException("Không thể tải tệp văn bản từ hệ thống Công văn.", e);
        }
    }

}
