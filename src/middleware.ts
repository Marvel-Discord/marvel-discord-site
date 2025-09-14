import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pollsBaseUrl = process.env.NEXT_PUBLIC_POLLS_BASE_URL;

  // If external polls URL is configured and request is for /polls
  if (pollsBaseUrl && request.nextUrl.pathname.startsWith("/polls")) {
    // Extract the hostname from the polls base URL to compare
    const pollsHostname = new URL(pollsBaseUrl).hostname;

    // Don't redirect if the request is already coming from the polls domain
    if (request.nextUrl.hostname === pollsHostname) {
      return NextResponse.next();
    }

    // Get the path after /polls (e.g., /polls/123 -> /123)
    const pollsPath = request.nextUrl.pathname.replace("/polls", "");
    const searchParams = request.nextUrl.search;

    // Redirect to external polls domain, preserving any sub-paths and query params
    const redirectUrl = `${pollsBaseUrl}${pollsPath}${searchParams}`;
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match /polls and any sub-paths
    "/polls/:path*",
  ],
};
