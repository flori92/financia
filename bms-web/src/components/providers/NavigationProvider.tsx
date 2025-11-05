"use client";
import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function NavigationListener({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Force re-render on navigation
  }, [pathname, searchParams]);

  return <>{children}</>;
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <NavigationListener>{children}</NavigationListener>
    </Suspense>
  );
}
