'use client';

import Link from 'next/link';
import { useCurrentUser } from '@/hooks/use-users';

export function Header() {
  const { data: user, isLoading } = useCurrentUser();

  return (
    <header className="h-[80px] w-full flex items-center justify-between px-8 bg-white shadow-sm">
      {/* Left Section: Home Button */}
      <div className="flex items-center">
        <Link 
          href="/" 
          className="text-xl font-bold text-congress-blue-900 hover:text-congress-blue-700 transition-colors"
        >
          Home
        </Link>
      </div>

      {/* Middle Section: Navigation Bar */}
      <nav className="flex items-center gap-8">
        <Link 
          href="/jobs" 
          className="text-congress-blue-900 hover:text-congress-blue-600 font-medium transition-colors"
        >
          Jobs
        </Link>
        {/* Add more navigation links here as needed */}
      </nav>

      {/* Right Section: Login/Register or Profile */}
      <div className="flex items-center gap-4">
        {isLoading ? (
          // Loading state placeholder
          <div className="h-10 w-20 bg-gray-200 animate-pulse rounded-md" />
        ) : user ? (
          <Link 
            href="/profile"
            className="px-6 py-2 bg-congress-blue-500 text-white rounded-full hover:bg-congress-blue-600 transition-colors font-medium"
          >
            Profile
          </Link>
        ) : (
          <div className="flex items-center gap-4">
            <Link 
              href="/login"
              className="text-congress-blue-900 hover:text-congress-blue-600 font-medium transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/register"
              className="px-6 py-2 bg-congress-blue-500 text-white rounded-full hover:bg-congress-blue-600 transition-colors font-medium"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
