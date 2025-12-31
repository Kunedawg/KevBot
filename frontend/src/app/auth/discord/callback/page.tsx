"use client";

import { useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api-browser-client";

const DEFAULT_REDIRECT = "/tracks";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // just a guard to prevent the code from being used twice when in development
  const codeConsumed = useRef(false);

  useEffect(() => {
    if (codeConsumed.current) {
      return;
    }
    codeConsumed.current = true;

    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const stateParam = searchParams.get("state");

    let redirectTarget = DEFAULT_REDIRECT;
    if (stateParam) {
      const storageKey = `oauth-state:${stateParam}`;
      try {
        const stored = sessionStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored) as { redirect?: string | null };
          if (parsed?.redirect && parsed.redirect.startsWith("/")) {
            redirectTarget = parsed.redirect;
          }
        }
      } catch (storageError) {
        console.warn("Failed to resolve OAuth redirect target:", storageError);
      } finally {
        try {
          sessionStorage.removeItem(storageKey);
        } catch (cleanupError) {
          console.warn("Failed to clean up OAuth redirect key:", cleanupError);
        }
      }
    }

    if (error) {
      console.error("OAuth error:", error);
      router.push("/?error=oauth_error");
      return;
    }

    if (!code) {
      console.error("No authorization code received");
      router.push("/?error=no_code");
      return;
    }

    const exchangeCode = async () => {
      try {
        const data = await api.auth.exchangeDiscordCode(code);
        if (data.access_token) {
          router.push(redirectTarget);
        } else {
          console.error("No access token in response");
          router.push("/?error=no_token");
        }
      } catch (error) {
        console.error("Error exchanging code:", error);
        const status = (error as { status?: number } | null)?.status;
        const errorCode = status && status >= 400 && status < 500 ? "exchange_failed" : "exchange_error";
        router.push(`/?error=${errorCode}`);
      }
    };

    exchangeCode();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Completing login...</h1>
        <p className="text-muted-foreground">Please wait while we authenticate you.</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
