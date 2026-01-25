"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateUser } from "@/hooks/use-users";
import FilterOption from "@/components/jobs/filter-option";
import PasswordEye from "@/components/ui/password-eye";
import { cn } from "@/lib/utils";
import { useAccessToken, useTokenValidity } from "@/hooks";
import { isAuthError, setStoredAccessToken } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

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
    <main className="mx-auto max-w-xl mt-10 px-4 py-6">
      <div className="bg-congress-blue-900 rounded-[calc(2rem+1rem)] p-4">
        <div className="flex flex-col items-center justify-center space-y-4 w-full rounded-4xl px-10 py-10 bg-white">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-xl font-semibold text-congress-blue-900">
              Create an account
            </h1>
            <p className="mt-1 text-sm text-congress-blue-900/70">
              Join us to find your next opportunity
            </p>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              <span className="font-semibold">Registration failed</span>
              <span className="opacity-80"> — {error}</span>
            </div>
          ) : null}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="space-y-3 flex flex-col mt-4">
              <FilterOption
                title="First Name"
                type="text"
                value={formData.name}
                onChange={(v) => {
                  setFormData((prev) => ({ ...prev, name: v }));
                  setError("");
                }}
                placeholder="John"
                className="max-w-none w-[500px]"
                labelBackground="bg-white"
              />
              <FilterOption
                title="Last Name"
                type="text"
                value={formData.last_name}
                onChange={(v) => {
                  setFormData((prev) => ({ ...prev, last_name: v }));
                  setError("");
                }}
                placeholder="Doe"
                className="max-w-none w-[500px]"
                labelBackground="bg-white"
              />

              <FilterOption
                title="Email"
                type="text"
                value={formData.email}
                onChange={(v) => {
                  setFormData((prev) => ({ ...prev, email: v }));
                  setError("");
                }}
                placeholder="you@example.com"
                className="max-w-none w-[500px]"
                labelBackground="bg-white"
              />

              <FilterOption
                title="Password"
                type={"password"}
                value={formData.password}
                onChange={(v) => {
                  setFormData((prev) => ({ ...prev, password: v }));
                  setError("");
                }}
                placeholder="••••••••"
                className="max-w-none w-[500px]"
                labelBackground="bg-white"
                isVisible={showPassword}
                onClick={() => setShowPassword((prev) => !prev)}
              />

              <FilterOption
                title="Confirm Password"
                type={"password"}
                value={formData.confirmPassword}
                onChange={(v) => {
                  setFormData((prev) => ({ ...prev, confirmPassword: v }));
                  setError("");
                }}
                placeholder="••••••••"
                className="max-w-none w-[500px]"
                labelBackground="bg-white"
                isVisible={showConfirmPassword}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              />
            </div>

            <div className="flex flex-col items-center justify-between gap-3 pt-2">
              <button
                type="submit"
                disabled={createUserMutation.isPending}
                className={cn(
                  "rounded-full w-[80%] border border-congress-blue-900 bg-congress-blue-900 px-5 py-2 text-xs font-semibold text-white hover:bg-congress-blue-500 hover:border-congress-blue-500",
                  createUserMutation.isPending &&
                    "opacity-60 cursor-not-allowed"
                )}
              >
                {createUserMutation.isPending
                  ? "Creating account..."
                  : "Create account"}
              </button>

              <div className="text-sm text-congress-blue-900/70">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-congress-blue-900 hover:text-congress-blue-500"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
