import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useSiteInfo } from "../lib/useSiteInfo";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

export function PublicLayout() {
  const site = useSiteInfo();
  useEffect(() => {
    document.title = `${site.name} - ${site.subtitle}`;
  }, [site.name, site.subtitle]);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
