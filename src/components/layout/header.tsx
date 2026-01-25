"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-users";
import { useLogoutUser } from "@/hooks";
import { Button } from "@/components/ui/button";
// import Logo from "@/icons/logo.svg";
import Brand from "@/icons/brand.svg";

export function Header() {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();
  const logoutMutation = useLogoutUser();

  return (
    <header className="w-full flex items-center justify-between p-4 pt-2 bg-congress-blue-900 rounded-b-[calc(1rem+0.75rem)]">
      <div className="flex h-[4rem] items-center justify-between bg-background w-full rounded-b-xl rounded-t-md px-6">
        {/* Left Section: Home Button */}
        <div className="flex items-center w-[20%]">
          <Link href="/jobs">
            <Brand className="h-12 bg-background" />
          </Link>
        </div>

        {/* Middle Section: Navigation Bar */}
        <nav className="flex items-center justify-center gap-8 w-[50%]">
          {user && <Link
            href="/jobs"
            className="text-congress-blue-900 hover:text-congress-blue-600 font-semibold text-xl transition-colors"
          >
            JOBS
          </Link>}
          {/* Add more navigation links here as needed */}
        </nav>

        {/* Right Section: Login/Register or Profile */}
        <div className="flex items-center justify-end w-[20%] gap-4">
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
            <div className="flex items-center gap-4">
              <Button
                variant="primary"
                type="button"
                onClick={() => router.push("/login")}
                className="px-4 py-2"
              >
                Login
                
              </Button>
              <Button
                variant="secondary"
                type="button"
                onClick={() => router.push("/register")}
                className="px-4 py-2"
              >
                Register
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
