"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLoginUser } from "@/hooks/use-users";
import { cn } from "@/lib/utils";
import { useAccessToken, useTokenValidity } from "@/hooks";
import { isAuthError, setStoredAccessToken } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { Input } from "@/components/ui/input";
import PasswordEye from "@/components/ui/password-eye";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const loginMutation = useLoginUser();
  const accessToken = useAccessToken();
  const tokenValidity = useTokenValidity();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const hasStoredToken = !!accessToken.data;
  const isTokenInvalid = useMemo(() => {
    if (!hasStoredToken) return false;
    if (!tokenValidity.isError) return false;
    return isAuthError(tokenValidity.error);
  }, [hasStoredToken, tokenValidity.isError, tokenValidity.error]);

  useEffect(() => {
    if (!hasStoredToken) return;
    if (tokenValidity.isSuccess && tokenValidity.data?.valid) {
      router.replace("/jobs");
    }
  }, [hasStoredToken, tokenValidity.isSuccess, tokenValidity.data, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await loginMutation.mutateAsync(formData);
      router.push("/jobs"); // Redirect to jobs page after login
    } catch (err: unknown) {
      console.error("Login error:", err);
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Invalid email or password";
      setError(message);
    }
  };

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4 py-6 sm:py-8">
      <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-sm px-6 py-8 sm:px-8 sm:py-10">
        <h1 className="text-2xl font-bold text-neutral-900 text-center mb-1">
          Welcome back
        </h1>
        <p className="text-sm text-neutral-500 text-center mb-5 sm:mb-6">
          Sign in to your account to continue
        </p>

        {error ? (
          <div className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 mb-4">
            <span className="font-semibold">Login failed</span>
            <span className="opacity-80"> — {error}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-neutral-700">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, email: e.target.value.trim() }));
                  setError("");
                }}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1 relative">
              <label className="block text-sm font-medium text-neutral-700">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, password: e.target.value }));
                    setError("");
                  }}
                  className="pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <PasswordEye isVisible={showPassword} onClick={() => setShowPassword(!showPassword)} />
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full mt-5 sm:mt-6" disabled={loginMutation.isPending} variant="primary">
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </Button>

          <div className="text-sm text-neutral-500 text-center mt-4">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              onClick={(e) => {
                if (!isTokenInvalid) return;
                // If the stored token is known to be invalid and the user goes to Register,
                // clear it to avoid bouncing/loops.
                e.preventDefault();
                setStoredAccessToken(null);
                queryClient.setQueryData<string | null>(
                  queryKeys.auth.token(),
                  null
                );
                queryClient.removeQueries({
                  queryKey: queryKeys.auth.validity(accessToken.data ?? ""),
                });
                router.push("/register");
              }}
              className="text-primary-600 font-semibold hover:text-primary-700"
            >
              Register
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
