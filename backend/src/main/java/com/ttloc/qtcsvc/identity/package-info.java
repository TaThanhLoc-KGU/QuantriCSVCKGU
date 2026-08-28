// Ghi chu: identity CHUA phu thuoc settings (SSO domain check qua
// sso.allowedDomains chua code - se bo sung khi lam Google SSO that. Luc do
// neu can du lieu settings o day, uu tien de identity tu so huu cau hinh SSO
// domain thay vi tao vong lap nguoc voi settings (settings dang phu thuoc
// identity de biet ai dang dang nhap - xem settings/package-info.java).
@org.springframework.modulith.ApplicationModule(
        displayName = "Nguoi dung & Xac thuc",
        allowedDependencies = {"shared"}
)
package com.ttloc.qtcsvc.identity;
