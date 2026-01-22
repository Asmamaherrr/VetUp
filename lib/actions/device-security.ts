"use server"

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function trackDeviceSession(
  deviceName: string,
  deviceType: "laptop" | "mobile" | "tablet" | "other",
  ipAddress: string,
  userAgent: string
) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // Check current device count
    const { data: devices, error: devicesError } = await supabase
      .from("user_devices")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)

    if (devicesError) throw devicesError

    // If max devices exceeded, deactivate oldest device and log violation
    if (devices && devices.length >= 2) {
      const oldestDevice = devices.reduce((prev, current) => 
        new Date(prev.last_active_at) < new Date(current.last_active_at) ? prev : current
      )

      // Deactivate oldest device
      await supabase
        .from("user_devices")
        .update({ is_active: false })
        .eq("id", oldestDevice.id)

      // Log violation
      await supabase
        .from("device_violations")
        .insert({
          user_id: user.id,
          violation_type: "max_devices_exceeded",
          details: {
            deactivated_device: oldestDevice.device_name,
            new_device: deviceName,
          },
          status: "active",
        })
    }

    // Check if device already exists
    const { data: existingDevice } = await supabase
      .from("user_devices")
      .select("*")
      .eq("user_id", user.id)
      .eq("device_name", deviceName)
      .single()

    let deviceId: string

    if (existingDevice) {
      // Update existing device
      await supabase
        .from("user_devices")
        .update({
          last_active_at: new Date().toISOString(),
          is_active: true,
          ip_address: ipAddress,
        })
        .eq("id", existingDevice.id)

      deviceId = existingDevice.id
    } else {
      // Create new device
      const { data: newDevice, error: insertError } = await supabase
        .from("user_devices")
        .insert({
          user_id: user.id,
          device_name: deviceName,
          device_type: deviceType,
          ip_address: ipAddress,
          user_agent: userAgent,
          last_active_at: new Date().toISOString(),
          is_active: true,
        })
        .select("id")
        .single()

      if (insertError) throw insertError
      deviceId = newDevice.id
    }

    // Create session
    const { error: sessionError } = await supabase
      .from("device_sessions")
      .insert({
        user_id: user.id,
        device_id: deviceId,
        session_token: crypto.randomUUID(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })

    if (sessionError) throw sessionError

    return { success: true, deviceId }
  } catch (error) {
    console.error("Device tracking error:", error)
    throw error
  }
}

export async function getActiveDevices() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const { data: devices, error } = await supabase
      .from("user_devices")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("last_active_at", { ascending: false })

    if (error) throw error
    return devices
  } catch (error) {
    console.error("Get devices error:", error)
    throw error
  }
}

export async function forceLogoutDevice(deviceId: string) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // Get device to verify ownership
    const { data: device, error: getError } = await supabase
      .from("user_devices")
      .select("*")
      .eq("id", deviceId)
      .eq("user_id", user.id)
      .single()

    if (getError || !device) throw new Error("Device not found")

    // Deactivate device
    const { error: updateError } = await supabase
      .from("user_devices")
      .update({ is_active: false })
      .eq("id", deviceId)

    if (updateError) throw updateError

    // Log out all sessions for this device
    await supabase
      .from("device_sessions")
      .update({ logged_out_at: new Date().toISOString() })
      .eq("device_id", deviceId)

    return { success: true }
  } catch (error) {
    console.error("Force logout error:", error)
    throw error
  }
}

export async function getDeviceViolations() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const { data: violations, error } = await supabase
      .from("device_violations")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })

    if (error) throw error
    return violations
  } catch (error) {
    console.error("Get violations error:", error)
    throw error
  }
}
