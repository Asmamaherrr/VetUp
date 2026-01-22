"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function generateCertificate(courseId: string) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // Check if course is completed
    const { data: enrollment, error: enrollError } = await supabase
      .from("enrollments")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single()

    if (enrollError || !enrollment) {
      throw new Error("Enrollment not found")
    }

    if (enrollment.completed_at === null) {
      throw new Error("Course must be completed to generate certificate")
    }

    // Check if certificate already exists
    const { data: existingCert } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single()

    if (existingCert) {
      return { success: true, certificateId: existingCert.id }
    }

    // Generate unique certificate number
    const certificateNumber = `CERT-${Date.now()}-${user.id.slice(0, 8).toUpperCase()}`

    // Create certificate
    const { data: certificate, error: certError } = await supabase
      .from("certificates")
      .insert({
        user_id: user.id,
        course_id: courseId,
        certificate_number: certificateNumber,
        issued_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (certError) throw certError

    return { success: true, certificateId: certificate.id, certificateNumber }
  } catch (error) {
    console.error("Generate certificate error:", error)
    throw error
  }
}

export async function getCertificates() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const { data: certificates, error } = await supabase
      .from("certificates")
      .select("*, course:courses(title, slug)")
      .eq("user_id", user.id)
      .order("issued_at", { ascending: false })

    if (error) throw error
    return certificates
  } catch (error) {
    console.error("Get certificates error:", error)
    throw error
  }
}

export async function verifyCertificate(certificateNumber: string) {
  try {
    const supabase = await createServerClient()

    const { data: certificate, error } = await supabase
      .from("certificates")
      .select("*, user:profiles(full_name), course:courses(title)")
      .eq("certificate_number", certificateNumber)
      .single()

    if (error || !certificate) {
      throw new Error("Certificate not found")
    }

    return {
      success: true,
      certificate: {
        number: certificate.certificate_number,
        recipientName: certificate.user?.full_name,
        courseName: certificate.course?.title,
        issuedAt: certificate.issued_at,
      },
    }
  } catch (error) {
    console.error("Verify certificate error:", error)
    throw error
  }
}
