"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-users";
import { useLogoutUser } from "@/hooks";
import { useAccessToken, useTokenValidity } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
// import Logo from "@/icons/logo.svg";
import Brand from "@/icons/brand.svg";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const { data: accessToken } = useAccessToken();
  const tokenValidity = useTokenValidity();
  const logoutMutation = useLogoutUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hasToken = !!accessToken;
  const isTokenValidationLoading = hasToken && tokenValidity.isLoading;
  const isAuthenticated =
    hasToken && tokenValidity.isSuccess && tokenValidity.data?.valid === true;
  const shouldShowAuthenticatedActions = isAuthenticated && !!user;
  const shouldShowLoadingState =
    isTokenValidationLoading || (isAuthenticated && isUserLoading);

  return (
    <header className="w-full bg-white border-b border-neutral-200 sticky top-0 z-40">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16">
        {/* Left: Brand/Logo */}
        <div className="flex items-center">
          <Link href="/jobs">
            <Brand className="sm:h-10 md:h-10 lg:h-12 xl:h-12 min-h-10" />
          </Link>
        </div>

        {/* Center: Navigation Links - Hidden on mobile */}
        <nav className="hidden sm:flex items-center gap-6">
          {shouldShowAuthenticatedActions && (
            <Link
              href="/jobs"
              className="text-neutral-700 font-medium hover:text-primary-600 transition-colors duration-150"
            >
              Jobs
            </Link>
          )}
        </nav>

        {/* Right: Auth buttons - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2">
          {shouldShowLoadingState ? (
            <div className="h-10 w-20 bg-neutral-200 animate-pulse rounded-md" />
          ) : shouldShowAuthenticatedActions ? (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/profile")}
                className="inline-flex w-auto items-center justify-center px-4 py-2 text-center"
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
                className="inline-flex w-auto items-center justify-center px-4 py-2 text-center"
              >
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            </>
          ) : (
            <>
              {pathname === "/login" && (
                <Button
                  variant="primary"
                  type="button"
                  onClick={() => router.push("/register")}
                  className="inline-flex w-auto items-center justify-center px-4 py-2 text-center"
                >
                  Register
                </Button>
              )}
              {pathname === "/register" && (
                <Button
                  variant="primary"
                  type="button"
                  onClick={() => router.push("/login")}
                  className="inline-flex w-auto items-center justify-center px-4 py-2 text-center"
                >
                  Login
                </Button>
              )}
            </>
          )}
        </div>

        {/* Hamburger button - Mobile only */}
        <button
          className="sm:hidden p-2 -mr-2 text-neutral-600 hover:text-primary-600 rounded-lg hover:bg-neutral-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed top-[3.6rem] right-3 z-50 bg-white border border-neutral-200 rounded-xl shadow-md w-48">
          <div className="py-2 px-1">
            {/* Nav links */}
            {shouldShowAuthenticatedActions && (
              <Link
                href="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg flex items-center min-h-[44px]"
              >
                Jobs
              </Link>
            )}

            {/* Auth actions */}
            {shouldShowLoadingState ? (
              <div className="h-10 w-full bg-neutral-200 animate-pulse rounded-md mx-1 my-1" />
            ) : shouldShowAuthenticatedActions ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    router.push("/profile");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2.5 text-sm font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg flex items-center min-h-[44px]"
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
                  className="w-full px-3 py-2.5 text-sm font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg flex items-center min-h-[44px] disabled:opacity-50"
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                {pathname === "/login" && (
                  <button
                    type="button"
                    onClick={() => {
                      router.push("/register");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-3 py-2.5 text-sm font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg flex items-center min-h-[44px]"
                  >
                    Register
                  </button>
                )}
                {pathname === "/register" && (
                  <button
                    type="button"
                    onClick={() => {
                      router.push("/login");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-3 py-2.5 text-sm font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg flex items-center min-h-[44px]"
                  >
                    Login
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
