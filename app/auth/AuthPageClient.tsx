'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function AuthPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { openAuth } = useAuth()

  const verified = searchParams.get('verified')
  const error = searchParams.get('error')

  useEffect(() => {
    if (verified || error) return

    const mode = searchParams.get('mode') === 'register' ? 'register' : 'login'
    openAuth(mode)
    router.replace('/')
  }, [verified, error, searchParams, openAuth, router])

  if (!verified && !error) {
    return null
  }

  let message = ''
  let isSuccess = false

  if (verified === '1') {
    message = 'Your email has been verified. You can sign in now.'
    isSuccess = true
  } else if (error === 'verify_failed') {
    message = 'Email verification failed. Please register again or request a new link.'
  } else if (error === 'missing_code') {
    message = 'This verification link is invalid. Open the link from your email in Chrome or Safari.'
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center', padding: '32px 24px' }}>
        <h1 className="auth-title">{isSuccess ? 'Verification successful' : 'Verification failed'}</h1>
        <p style={{ margin: '16px 0', color: isSuccess ? '#15803d' : '#dc2626' }}>{message}</p>
        <button
          type="button"
          className="auth-submit"
          onClick={() => openAuth('login')}
        >
          Sign in
        </button>
        <p style={{ marginTop: 16 }}>
          <Link href="/">Back to home</Link>
        </p>
      </div>
    </div>
  )
}
