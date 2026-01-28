'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Smartphone, Laptop, AlertTriangle, Loader2, Shield, LogOut } from 'lucide-react'
import { getAllUsersWithDevices, forceLogoutUserDevice } from '@/lib/actions/admin-device-security'
import type { UserDevice } from '@/lib/types'

interface UserWithDevices {
  user_id: string
  email: string
  full_name: string | null
  devices: UserDevice[]
  violation_count: number
  has_violations: boolean
}

export function AdminDevicesPanel() {
  // Component for managing and monitoring all user devices
  const [users, setUsers] = useState<UserWithDevices[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserWithDevices[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [logoutingDevice, setLogoutingDevice] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  useEffect(() => {
    loadUsersWithDevices()
  }, [])

  useEffect(() => {
    if (!users || users.length === 0) {
      setFilteredUsers([])
      return
    }

    const searchLower = (searchTerm || '').toLowerCase()
    if (!searchLower) {
      setFilteredUsers(users)
      return
    }

    const filtered = users.filter(user => {
      const email = user.email ? user.email.toLowerCase() : ''
      const fullName = user.full_name ? user.full_name.toLowerCase() : ''
      return email.includes(searchLower) || fullName.includes(searchLower)
    })
    setFilteredUsers(filtered)
  }, [searchTerm, users])

  async function loadUsersWithDevices() {
    try {
      setIsLoading(true)
      const data = await getAllUsersWithDevices()
      console.log('[v0] Admin devices panel loaded:', data)
      setUsers(data || [])
      setError(null)
    } catch (err) {
      console.error('[v0] Admin devices panel error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleForceLogout(userId: string, deviceId: string) {
    try {
      setLogoutingDevice(deviceId)
      await forceLogoutUserDevice(userId, deviceId)
      
      // Update local state
      setUsers(users.map(user => ({
        ...user,
        devices: user.devices.filter(d => d.id !== deviceId)
      })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout device')
    } finally {
      setLogoutingDevice(null)
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />
      case 'laptop':
        return <Laptop className="h-5 w-5" />
      case 'tablet':
        return <Smartphone className="h-5 w-5" />
      default:
        return <Laptop className="h-5 w-5" />
    }
  }

  const violationStats = {
    total: users.length,
    withViolations: users.filter(u => u.has_violations).length,
    totalDevices: users.reduce((sum, u) => sum + u.devices.length, 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Device Management</h1>
        <p className="text-muted-foreground mt-2">Monitor all user devices and force logout suspicious accounts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold mt-2">{violationStats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Users with Violations</p>
              <p className="text-3xl font-bold text-destructive mt-2">{violationStats.withViolations}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Active Devices</p>
              <p className="text-3xl font-bold mt-2">{violationStats.totalDevices}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and View Toggle */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search by email or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <div className="flex gap-2 ml-auto">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            Table View
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            Card View
          </Button>
        </div>
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No users found.
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        // Table View
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">User</th>
                    <th className="px-6 py-3 text-left font-medium">Email</th>
                    <th className="px-6 py-3 text-center font-medium">Devices</th>
                    <th className="px-6 py-3 text-left font-medium">Device Details</th>
                    <th className="px-6 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, idx) => (
                    <tr key={user.user_id} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                      <td className="px-6 py-3 font-medium">{user.full_name || 'User'}</td>
                      <td className="px-6 py-3 text-muted-foreground">{user.email}</td>
                      <td className="px-6 py-3 text-center">
                        <Badge variant={user.devices.length > 0 ? 'default' : 'outline'}>
                          {user.devices.length}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {user.devices.length > 0 ? (
                          <div className="space-y-1">
                            {user.devices.map(device => (
                              <div key={device.id} className="text-xs">
                                <p>{device.device_name} ({device.device_type})</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No devices</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-right">
                        {user.devices.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('cards')}
                            className="text-xs"
                          >
                            View Details
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Card View
        <div className="space-y-4">
          {filteredUsers.map(user => (
            <Card key={user.user_id} className={user.has_violations ? 'border-destructive/50 bg-destructive/5' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{user.full_name || 'User'}</CardTitle>
                      {user.has_violations && (
                        <Badge variant="destructive" className="flex gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {user.violation_count} Violation{user.violation_count > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mt-1">{user.email}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{user.devices.length} Device{user.devices.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </CardHeader>

              {user.devices.length > 0 && (
                <CardContent className="space-y-3">
                  {user.devices.map(device => (
                    <div key={device.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                          {getDeviceIcon(device.device_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{device.device_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {device.device_type} • {device.ip_address}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last active: {new Date(device.last_activity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleForceLogout(user.user_id, device.id)}
                        disabled={logoutingDevice === device.id}
                        className="ml-2 flex-shrink-0"
                      >
                        {logoutingDevice === device.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <LogOut className="h-4 w-4 mr-1" />
                            Logout
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
