"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLoginUser } from "@/hooks/use-users";
import FilterOption from "@/components/jobs/filter-option";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLoginUser();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error on input change
  };

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
    <main className="mx-auto max-w-xl mt-8 px-4 py-6">
      <div className="bg-congress-blue-900 rounded-[calc(2rem+1rem)] p-4">
        <div className="flex flex-col items-center justify-center space-y-4 w-full rounded-4xl px-10 py-10 bg-white">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-xl font-semibold text-congress-blue-900">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-congress-blue-900/70">
              Sign in to your account to continue
            </p>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              <span className="font-semibold">Login failed</span>
              <span className="opacity-80"> — {error}</span>
            </div>
          ) : null}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="space-y-3 flex flex-col mt-4">
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
                type="password"
                value={formData.password}
                onChange={(v) => {
                  setFormData((prev) => ({ ...prev, password: v }));
                  setError("");
                }}
                placeholder="••••••••"
                className="max-w-none w-[500px]"
                labelBackground="bg-white"
              />
            </div>

            <div className="flex flex-col items-center justify-between gap-3 pt-2">
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className={cn(
                  "rounded-full w-[80%] border border-congress-blue-900 bg-congress-blue-900 px-5 py-2 text-xs font-semibold text-white hover:bg-congress-blue-500 hover:border-congress-blue-500",
                  loginMutation.isPending && "opacity-60 cursor-not-allowed"
                )}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </button>

              <div className="text-sm text-congress-blue-900/70">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-congress-blue-900 hover:text-congress-blue-500"
                >
                  Register
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
