// src/proxy.ts
// Redirects /login and /register to /jobs when APP_ENV=preview.
// Runs at the edge before any page renders.

import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV

  if (appEnv !== 'preview') {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL('/jobs', request.url))
}

export const config = {
  matcher: ['/login', '/register'],
}
