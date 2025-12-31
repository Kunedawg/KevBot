"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginButton } from "@/components/login-button";
import { useAuth } from "@/lib/contexts/auth-context";

const DEFAULT_REDIRECT = "/tracks";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  const redirectParam = searchParams?.get("redirect") ?? DEFAULT_REDIRECT;

  const redirectTarget = useMemo(() => {
    if (!redirectParam.startsWith("/")) {
      return DEFAULT_REDIRECT;
    }
    try {
      const normalized = new URL(redirectParam, "https://placeholder.local");
      const path = `${normalized.pathname}${normalized.search}`;
      if (path === "/login" || path.startsWith("/auth/discord/callback")) {
        return DEFAULT_REDIRECT;
      }
      return path;
    } catch {
      return DEFAULT_REDIRECT;
    }
  }, [redirectParam]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTarget);
    }
  }, [isAuthenticated, isLoading, redirectTarget, router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Sign in to KevBot</h1>
          <p className="text-muted-foreground">
            {isLoading ? "Checking your account..." : "You need to sign in to continue."}
          </p>
        </div>
        <div className="space-y-4 rounded-xl border bg-background/80 p-6 shadow-sm backdrop-blur">
          <LoginButton redirect={redirectTarget} />
          <p className="text-xs text-muted-foreground">
            By continuing you agree to share your Discord profile so we can personalize your experience.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Loading login page...</h1>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
