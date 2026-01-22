"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function applyCoupon(courseId: string, couponCode: string) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // Get coupon
    const { data: coupon, error: couponError } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode.toUpperCase())
      .eq("is_active", true)
      .single()

    if (couponError || !coupon) {
      throw new Error("Invalid coupon code")
    }

    // Check if coupon is valid
    const now = new Date().toISOString()
    if (now < coupon.valid_from || now > coupon.valid_until) {
      throw new Error("Coupon has expired")
    }

    // Check max uses
    if (coupon.current_uses >= coupon.max_uses) {
      throw new Error("Coupon has reached maximum uses")
    }

    // Check if user already redeemed this coupon for this course
    const { data: existingRedemption } = await supabase
      .from("coupon_redemptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("coupon_id", coupon.id)
      .eq("course_id", courseId)
      .single()

    if (existingRedemption) {
      throw new Error("You have already used this coupon for this course")
    }

    // Record redemption
    const { error: redeemError } = await supabase
      .from("coupon_redemptions")
      .insert({
        user_id: user.id,
        coupon_id: coupon.id,
        course_id: courseId,
        redeemed_at: new Date().toISOString(),
      })

    if (redeemError) throw redeemError

    // Update coupon uses
    await supabase
      .from("coupons")
      .update({ current_uses: coupon.current_uses + 1 })
      .eq("id", coupon.id)

    return {
      success: true,
      discount: coupon.discount_percentage,
    }
  } catch (error) {
    console.error("Apply coupon error:", error)
    throw error
  }
}

export async function validateCoupon(couponCode: string) {
  try {
    const supabase = await createServerClient()

    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode.toUpperCase())
      .eq("is_active", true)
      .single()

    if (error || !coupon) {
      throw new Error("Invalid coupon code")
    }

    const now = new Date().toISOString()
    if (now < coupon.valid_from || now > coupon.valid_until) {
      throw new Error("Coupon has expired")
    }

    if (coupon.current_uses >= coupon.max_uses) {
      throw new Error("Coupon has reached maximum uses")
    }

    return {
      valid: true,
      discountPercentage: coupon.discount_percentage,
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid coupon",
    }
  }
}
