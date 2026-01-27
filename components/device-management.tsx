"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getActiveDevices, forceLogoutDevice } from "@/lib/actions/device-security"
import { Smartphone, Laptop, AlertTriangle, Loader2 } from "lucide-react"
import type { UserDevice } from "@/lib/types"

export function DeviceManagement() {
  const [devices, setDevices] = useState<UserDevice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logoutingDevice, setLogoutingDevice] = useState<string | null>(null)

  useEffect(() => {
    loadDevices()
  }, [])

  async function loadDevices() {
    try {
      setIsLoading(true)
      const activeDevices = await getActiveDevices()
      setDevices(activeDevices || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load devices")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLogout(deviceId: string) {
    try {
      setLogoutingDevice(deviceId)
      await forceLogoutDevice(deviceId)
      setDevices(devices.filter((d) => d.id !== deviceId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to logout device")
    } finally {
      setLogoutingDevice(null)
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return <Smartphone className="h-5 w-5" />
      case "laptop":
        return <Laptop className="h-5 w-5" />
      default:
        return <Laptop className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Active Devices</h3>
        <p className="text-sm text-muted-foreground">
          You can have maximum 1 active device. Manage your devices to maintain account security.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : devices.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No active devices found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {devices.map((device) => (
            <Card key={device.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-3 text-primary">
                    {getDeviceIcon(device.device_type)}
                  </div>
                  <div>
                    <p className="font-medium">{device.device_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {device.device_type} • {device.ip_address}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last active: {new Date(device.last_active_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLogout(device.id)}
                  disabled={logoutingDevice === device.id}
                >
                  {logoutingDevice === device.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Logout"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          For security reasons, your account is limited to 1 active device. If you shared the account,
          you will be automatically logged out.
        </AlertDescription>
      </Alert>
    </div>
  )
}
