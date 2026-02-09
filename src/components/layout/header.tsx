"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-users";
import { useLogoutUser } from "@/hooks";
import { Button } from "@/components/ui/button";
// import Logo from "@/icons/logo.svg";
import Brand from "@/icons/brand.svg";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading } = useCurrentUser();
  const logoutMutation = useLogoutUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full flex items-center justify-between p-4 pt-2 bg-congress-blue-900 rounded-b-[calc(1rem+0.75rem)]">
      <div className="flex h-[4rem] items-center justify-between bg-background w-full rounded-b-xl rounded-t-md px-6">
        {/* Left Section: Home Button */}
        <div className="flex items-center w-auto">
          <Link href="/jobs">
            <Brand className="sm:h-10 md:h-10 lg:h-12 xl:h-12 min-h-10 bg-background" />
          </Link>
        </div>

        {/* Middle Section: Navigation Bar - Hidden on mobile */}
        <nav className="hidden sm:flex items-center justify-center gap-8 flex-1">
          {user && (
            <Link
              href="/jobs"
              className="text-congress-blue-900 hover:text-congress-blue-600 font-semibold sm:text-base md:text-lg text-xl transition-colors"
            >
              JOBS
            </Link>
          )}
          {/* Add more navigation links here as needed */}
        </nav>

        {/* Right Section: Login/Register or Profile - Hidden on mobile */}
        <div className="hidden sm:flex items-center justify-end gap-4">
          {isLoading ? (
            // Loading state placeholder
            <div className="h-10 w-20 bg-gray-200 animate-pulse rounded-md" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => router.push("/profile")}
                className="w-auto px-4 py-2"
              >
                Profile
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  try {
                    await logoutMutation.mutateAsync();
                  } finally {
                    router.replace("/login");
                  }
                }}
                disabled={logoutMutation.isPending}
                className="px-4 py-2"
              >
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2">
              {pathname === "/login" && (
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => router.push("/register")}
                  className="px-4 py-2"
                >
                  Register
                </Button>
              )}{" "}
              {
                pathname === "/register" && (
                  <Button
                    variant="primary"
                    type="button"
                    onClick={() => router.push("/login")}
                    className="px-4 py-2"
                  >
                    Login
                  </Button>
                )
              }
            </div>
          )}
        </div>

        {/* Mobile Menu Button - Visible only on mobile */}
        <div className="sm:hidden flex items-center justify-end">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-congress-blue-900 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Portal - Visible only on mobile when open */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed w-[33%] top-[calc(3rem+0.5rem)] right-3 bg-congress-blue-900 rounded-[calc(1rem+1.75rem)] z-50 border-2 border-background">
          <div className="flex flex-col gap-0 bg-background rounded-[calc(1rem+0.75rem)] m-4 p-4">
            {/* Navigation Links */}
            {user && (
              <Link
                href="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="text-congress-blue-900 hover:text-congress-blue-600 font-semibold text-lg py-3 px-4 transition-colors"
              >
                Jobs
              </Link>
            )}

            {/* Buttons */}
            {isLoading ? (
              <div className="h-10 bg-gray-200 animate-pulse rounded-md mx-4" />
            ) : user ? (
              <div className="flex flex-col gap-0 px-4">
                <button
                  type="button"
                  onClick={() => {
                    router.push("/profile");
                    setMobileMenuOpen(false);
                  }}
                  className="text-congress-blue-900 hover:text-congress-blue-600 font-semibold text-lg py-3 text-left transition-colors"
                >
                  Profile
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await logoutMutation.mutateAsync();
                    } finally {
                      router.replace("/login");
                      setMobileMenuOpen(false);
                    }
                  }}
                  disabled={logoutMutation.isPending}
                  className="text-congress-blue-900 hover:text-congress-blue-600 font-semibold text-lg py-3 text-left transition-colors disabled:opacity-50"
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-0 px-4">
                {pathname === "/login" && (
                  <button
                    type="button"
                    onClick={() => {
                      router.push("/register");
                      setMobileMenuOpen(false);
                    }}
                    className="text-congress-blue-900 hover:text-congress-blue-600 font-semibold text-lg py-3 text-left transition-colors"
                  >
                    Register
                  </button>
                )}{" "}
                {pathname === "/register" && (
                  <button
                    type="button"
                    onClick={() => {
                      router.push("/login");
                      setMobileMenuOpen(false);
                    }}
                    className="text-congress-blue-900 hover:text-congress-blue-600 font-semibold text-lg py-3 text-left transition-colors"
                  >
                    Login
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
