package com.ttloc.qtcsvc.shared;

/**
 * He thong ben ngoai (vd CSDL Cong van) khong the truy cap duoc luc goi -
 * anh xa sang 503 Service Unavailable, khong phai loi cua ung dung nay.
 */
public class ExternalServiceException extends RuntimeException {

    public ExternalServiceException(String message, Throwable cause) {
        super(message, cause);
    }

    public ExternalServiceException(String message) {
        super(message);
    }

}
