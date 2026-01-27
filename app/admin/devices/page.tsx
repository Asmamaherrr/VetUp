import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { AdminSidebar } from '@/components/admin-sidebar'
import { AdminDevicesPanel } from '@/components/admin-devices-panel'

export const metadata = {
  title: 'Device Management | Admin',
  description: 'Monitor and manage user devices',
}

export default async function AdminDevicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is admin using same method as admin dashboard
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">
        <Header />
        <main className="bg-muted/30 p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <AdminDevicesPanel />
          </div>
        </main>
      </div>
    </div>
  )
}
