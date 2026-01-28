import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "API is working",
    timestamp: new Date().toISOString(),
    env: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "NOT SET",
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "NOT SET"
    }
  })
}
