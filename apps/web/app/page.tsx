'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, token } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && token) {
      router.push('/search')
    } else {
      router.push('/login')
    }
  }, [isAuthenticated, token, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-apple-gray-1">
      <div className="text-apple-gray-5">Loading...</div>
    </div>
  )
}

