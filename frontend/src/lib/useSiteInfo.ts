import { useEffect, useState } from "react";
import { api } from "./api";
import type { SiteInfo } from "./types";

const DEFAULTS: SiteInfo = {
  name: "Phòng Quản trị Cơ sở vật chất",
  subtitle: "Trường Đại học Kiên Giang",
  logoUrl: "/logo.ico",
  address: "",
  address2: "",
  phone: "",
  email: "",
  facebook: "",
  youtube: "",
  parentUrl: "https://vnkgu.edu.vn/",
  description: "",
};

let cache: SiteInfo | null = null;
let pending: Promise<SiteInfo> | null = null;

function load(): Promise<SiteInfo> {
  if (cache) return Promise.resolve(cache);
  pending ??= api
    .siteInfo()
    .then((info) => (cache = info))
    .catch(() => (cache = DEFAULTS));
  return pending;
}

/** Thong tin thuong hieu website (ten, logo, lien he...) - cache theo phien, doi duoc trong Cau hinh. */
export function useSiteInfo(): SiteInfo {
  const [info, setInfo] = useState<SiteInfo>(cache ?? DEFAULTS);
  useEffect(() => {
    let cancelled = false;
    load().then((i) => !cancelled && setInfo(i));
    return () => {
      cancelled = true;
    };
  }, []);
  return info;
}
