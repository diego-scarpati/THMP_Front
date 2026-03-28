"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateUser } from "@/hooks/use-users";
import { useAccessToken, useTokenValidity } from "@/hooks";
import { isAuthError, setStoredAccessToken } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { Input } from "@/components/ui/input";
import PasswordEye from "@/components/ui/password-eye";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createUserMutation = useCreateUser();
  const accessToken = useAccessToken();
  const tokenValidity = useTokenValidity();
  const [formData, setFormData] = useState({
    name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      return;
    }

    if (isTokenInvalid) {
      // If a token exists but it's invalid and the user is on Register,
      // clear it and redirect to Login.
      setStoredAccessToken(null);
      queryClient.setQueryData<string | null>(queryKeys.auth.token(), null);
      queryClient.removeQueries({
        queryKey: queryKeys.auth.validity(accessToken.data ?? ""),
      });
      router.replace("/login");
    }
  }, [
    hasStoredToken,
    tokenValidity.isSuccess,
    tokenValidity.data,
    isTokenInvalid,
    router,
    queryClient,
    accessToken.data,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await createUserMutation.mutateAsync({
        userData: {
          name: formData.name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
        },
      });
      // After successful registration, redirect to login
      router.push("/login");
    } catch (err: unknown) {
      console.error("Registration error:", err);
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Failed to create account";
      setError(message);
    }
  };

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4 py-6 sm:py-8">
      <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-sm px-6 py-8 sm:px-8 sm:py-10">
        <h1 className="text-2xl font-bold text-neutral-900 text-center mb-1">
          Create an account
        </h1>
        <p className="text-sm text-neutral-500 text-center mb-5 sm:mb-6">
          Join us to find your next opportunity
        </p>

        {error ? (
          <div className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 mb-4">
            <span className="font-semibold">Registration failed</span>
            <span className="opacity-80"> — {error}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-neutral-700">First Name</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  setError("");
                }}
                placeholder="John"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-neutral-700">Last Name</label>
              <Input
                type="text"
                value={formData.last_name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, last_name: e.target.value }));
                  setError("");
                }}
                placeholder="Doe"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-neutral-700">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, email: e.target.value }));
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
            <div className="space-y-1 relative">
              <label className="block text-sm font-medium text-neutral-700">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }));
                    setError("");
                  }}
                  className="pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <PasswordEye isVisible={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-5 sm:mt-6" disabled={createUserMutation.isPending}>
            {createUserMutation.isPending ? "Creating account..." : "Create account"}
          </Button>

          <div className="text-sm text-neutral-500 text-center mt-4">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary-600 font-semibold hover:text-primary-700"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
