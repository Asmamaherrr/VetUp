"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: "enrollment" | "completion" | "message" | "update" | "warning",
  data?: Record<string, unknown>
) {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        title,
        message,
        type,
        data: data || null,
        read: false,
      })

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Create notification error:", error)
    throw error
  }
}

export async function getNotifications() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) throw error
    return notifications
  } catch (error) {
    console.error("Get notifications error:", error)
    throw error
  }
}

export async function getUnreadCount() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return 0

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .eq("read", false)

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error("Get unread count error:", error)
    return 0
  }
}

export async function markAsRead(notificationId: string) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .eq("user_id", user.id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Mark as read error:", error)
    throw error
  }
}

export async function markAllAsRead() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Mark all as read error:", error)
    throw error
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId)
      .eq("user_id", user.id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Delete notification error:", error)
    throw error
  }
}
