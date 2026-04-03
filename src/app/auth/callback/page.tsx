"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Rocket } from "lucide-react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (accessToken && refreshToken) {
      login(accessToken, refreshToken).then(() => {
        router.replace("/dashboard");
      });
    } else {
      router.replace("/");
    }
  }, [searchParams, login, router]);

  return null;
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Rocket className="h-12 w-12 text-primary animate-bounce" />
          <p className="text-lg text-text-muted">Iniciando sesión...</p>
        </div>
      </div>
      <CallbackHandler />
    </Suspense>
  );
}
