'use client'

import { useSession } from 'next-auth/react'
import { useIdleLogout } from '@/hooks/use-idle-logout'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Enable idle logout with 30 second timeout
  useIdleLogout({ 
    idleTimeout: 30000, // 30 seconds
    checkInterval: 1000 // Check every second
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (status === 'unauthenticated') {
    return null
  }

  return <>{children}</>
}
