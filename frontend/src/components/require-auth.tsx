"use client";

import { ReactNode, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";

interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirectInitiatedRef = useRef(false);
  const { isAuthenticated, isLoading } = useAuth();

  const searchString = useMemo(() => (searchParams ? searchParams.toString() : ""), [searchParams]);

  const redirectTarget = useMemo(() => {
    if (!pathname || pathname === "/login") {
      return null;
    }
    const suffix = searchString ? `?${searchString}` : "";
    return `${pathname}${suffix}`;
  }, [pathname, searchString]);

  useEffect(() => {
    if (isAuthenticated) {
      redirectInitiatedRef.current = false;
      return;
    }

    if (!isLoading && !isAuthenticated && !redirectInitiatedRef.current) {
      redirectInitiatedRef.current = true;
      const params = new URLSearchParams();
      if (redirectTarget && redirectTarget.startsWith("/")) {
        params.set("redirect", redirectTarget);
      }
      const query = params.toString();
      router.replace(query ? `/login?${query}` : "/login");
    }
  }, [isAuthenticated, isLoading, redirectTarget, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Checking your session...</h1>
          <p className="text-muted-foreground mt-2">Hold tight while we verify your credentials.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
