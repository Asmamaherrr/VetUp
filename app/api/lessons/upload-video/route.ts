import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = `${Date.now()}-${file.name}`

    const { error } = await supabase.storage
      .from("lesson-videos")
      .upload(fileName, buffer, {
        contentType: file.type,
      })

    if (error) {
      console.error("Upload error:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const { data } = supabase.storage
      .from("lesson-videos")
      .getPublicUrl(fileName)

    return NextResponse.json({ url: data.publicUrl })
  } catch (err) {
    console.error("API crash:", err)
    return NextResponse.json(
      { error: "Server crashed" },
      { status: 500 }
    )
  }
}
