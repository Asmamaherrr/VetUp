"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } from "@/lib/actions/notifications"
import { Bell, Loader2 } from "lucide-react"
import type { Notification } from "@/lib/types"

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [])

  async function loadNotifications() {
    try {
      setIsLoading(true)
      const [notifs, count] = await Promise.all([getNotifications(), getUnreadCount()])
      setNotifications(notifs || [])
      setUnreadCount(count)
    } catch (error) {
      console.error("Load notifications error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleMarkAsRead(id: string) {
    await markAsRead(id)
    await loadNotifications()
  }

  async function handleMarkAllAsRead() {
    await markAllAsRead()
    await loadNotifications()
  }

  async function handleDelete(id: string) {
    await deleteNotification(id)
    await loadNotifications()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return "⚠️"
      case "completion":
        return "✅"
      case "enrollment":
        return "📚"
      case "message":
        return "💬"
      case "update":
        return "🔔"
      default:
        return "📢"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs">
              Mark all as read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            No notifications yet
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`px-4 py-3 border-b last:border-0 cursor-pointer hover:bg-muted ${
                  !notif.read ? "bg-muted/50" : ""
                }`}
                onClick={() => !notif.read && handleMarkAsRead(notif.id)}
              >
                <div className="flex gap-3 items-start">
                  <span className="text-lg">{getNotificationIcon(notif.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{notif.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(notif.id)
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
