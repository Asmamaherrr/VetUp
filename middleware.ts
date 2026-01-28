import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/proxy"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // ❌ تجاهل كل API routes
  if (pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  return updateSession(request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
