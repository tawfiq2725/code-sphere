"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({ showSpinner: false });
  }, []);

  useEffect(() => {
    NProgress.start();
    const timeoutId = setTimeout(() => {
      NProgress.done();
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      NProgress.done();
    };
  }, [pathname, searchParams]);

  return <>{children}</>;
}
