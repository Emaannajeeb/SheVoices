import { useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'

interface UseIdleLogoutProps {
  idleTimeout?: number // in milliseconds
  checkInterval?: number // in milliseconds
}

export function useIdleLogout({ 
  idleTimeout = 30000, // 30 seconds
  checkInterval = 1000 // 1 second
}: UseIdleLogoutProps = {}) {
  const { data: session, status } = useSession()

  const logout = useCallback(() => {
    signOut({ 
      callbackUrl: '/admin/login?message=Session expired due to inactivity',
      redirect: true 
    })
  }, [])

  const checkSessionExpiry = useCallback(() => {
    if (!session?.expires) return

    const expiryTime = new Date(session.expires).getTime()
    const currentTime = Date.now()
    
    if (currentTime >= expiryTime) {
      logout()
    }
  }, [session, logout])

  useEffect(() => {
    if (status !== 'authenticated') return

    let lastActivity = Date.now()
    let activityTimer: NodeJS.Timeout
    let sessionCheckTimer: NodeJS.Timeout

    // Track user activity
    const updateActivity = () => {
      lastActivity = Date.now()
    }

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true })
    })

    // Check for inactivity
    const checkInactivity = () => {
      const timeSinceActivity = Date.now() - lastActivity
      if (timeSinceActivity >= idleTimeout) {
        logout()
      }
    }

    // Set up timers
    activityTimer = setInterval(checkInactivity, checkInterval)
    sessionCheckTimer = setInterval(checkSessionExpiry, checkInterval)

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity)
      })
      clearInterval(activityTimer)
      clearInterval(sessionCheckTimer)
    }
  }, [status, idleTimeout, checkInterval, logout, checkSessionExpiry])

  return { logout }
}
