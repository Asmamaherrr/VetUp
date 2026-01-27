'use server'

import { createServerClient } from '@/lib/supabase/server'

export async function getAllUsersWithDevices() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Check if user is admin
    if (!user) throw new Error('Unauthorized')

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminProfile?.role !== 'admin') throw new Error('Not an admin')

    console.log('[v0] === STARTING DEVICE QUERY ===')

    // Get all user devices
    const { data: allDevices, error: devicesError } = await supabase
      .from('user_devices')
      .select('*')

    if (devicesError) {
      console.error('[v0] Devices query error:', devicesError)
      throw devicesError
    }

    // Get all profiles with emails
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email')

    if (profilesError) {
      console.error('[v0] Profiles query error:', profilesError)
      throw profilesError
    }

    // Filter only active devices
    const activeDevices = (allDevices || []).filter(d => d.is_active === true)

    if (activeDevices.length === 0) {
      return []
    }

    // Group devices by user
    const usersMap = new Map<string, any>()

    for (const device of activeDevices) {
      const userProfile = allProfiles?.find(u => u.id === device.user_id)
      
      if (userProfile) {
        if (!usersMap.has(device.user_id)) {
          usersMap.set(device.user_id, {
            user_id: device.user_id,
            email: userProfile.email || 'unknown',
            full_name: userProfile.full_name || null,
            devices: [],
            violation_count: 0,
            has_violations: false,
          })
        }

        usersMap.get(device.user_id).devices.push(device)
      }
    }

    // Convert to array
    const result = Array.from(usersMap.values())

    return result
  } catch (error) {
    console.error('[v0] Get all users with devices FAILED:', error)
    throw error
  }
}

export async function forceLogoutUserDevice(userId: string, deviceId: string) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Check if user is admin
    if (!user) throw new Error('Unauthorized')

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminProfile?.role !== 'admin') throw new Error('Not an admin')

    // Get device to verify it exists
    const { data: device, error: getError } = await supabase
      .from('user_devices')
      .select('*')
      .eq('id', deviceId)
      .eq('user_id', userId)
      .single()

    if (getError || !device) throw new Error('Device not found')

    // Deactivate device
    const { error: updateError } = await supabase
      .from('user_devices')
      .update({ is_active: false })
      .eq('id', deviceId)

    if (updateError) throw updateError

    console.log(`[v0] Admin ${user.id} force logged out device ${deviceId} for user ${userId}`)

    return { success: true }
  } catch (error) {
    console.error('[v0] Force logout user device error:', error)
    throw error
  }
}
