'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'

export function InactivityWarning() {
  const { data: session, status } = useSession()
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(10)

  const logout = useCallback(() => {
    signOut({ 
      callbackUrl: '/admin/login?message=Session expired due to inactivity',
      redirect: true 
    })
  }, [])

  useEffect(() => {
    if (status !== 'authenticated') return

    let lastActivity = Date.now()
    let warningTimer: NodeJS.Timeout
    let logoutTimer: NodeJS.Timeout
    let countdownTimer: NodeJS.Timeout

    const updateActivity = () => {
      lastActivity = Date.now()
      setShowWarning(false)
      clearTimeout(warningTimer)
      clearTimeout(logoutTimer)
      clearTimeout(countdownTimer)
      setupTimers()
    }

    const setupTimers = () => {
      // Show warning after 20 seconds of inactivity
      warningTimer = setTimeout(() => {
        setShowWarning(true)
        setCountdown(10)
        
        // Start countdown
        countdownTimer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              logout()
              return 0
            }
            return prev - 1
          })
        }, 1000)
        
        // Auto logout after 30 seconds total
        logoutTimer = setTimeout(() => {
          logout()
        }, 10000)
      }, 20000)
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true })
    })

    setupTimers()

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity)
      })
      clearTimeout(warningTimer)
      clearTimeout(logoutTimer)
      clearInterval(countdownTimer)
    }
  }, [status, logout])

  if (!showWarning) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
        <h3 className="text-lg font-semibold mb-2">Session Expiring</h3>
        <p className="mb-4">
          You will be logged out in {countdown} seconds due to inactivity.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowWarning(false)
              // This will trigger the updateActivity function
              document.dispatchEvent(new Event('click'))
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Stay Logged In
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  )
}
