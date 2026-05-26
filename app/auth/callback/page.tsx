'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Session } from '@supabase/supabase-js'
import { setSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

function syncLocalSession(session: Session | null) {
  if (!session?.user) return

  const email = session.user.email ?? session.user.id
  const name =
    session.user.user_metadata?.full_name ||
    session.user.user_metadata?.name ||
    email.split('@')[0]
  const isGoogle =
    session.user.app_metadata?.provider === 'google' ||
    session.user.identities?.some((i) => i.provider === 'google')

  setSession({
    type: isGoogle ? 'google' : 'email',
    identifier: email,
    displayName: name,
  })
}

export default function AuthCallbackPage() {
  const router = useRouter()
  const [message, setMessage] = useState('正在处理登录...')

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const tokenHash = params.get('token_hash')
      const type = params.get('type')

      try {
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          syncLocalSession(data.session)
          router.replace('/')
          return
        }

        if (tokenHash && type) {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as 'signup' | 'email' | 'recovery' | 'invite' | 'email_change',
          })
          if (error) throw error
          syncLocalSession(data.session)
          router.replace('/auth?verified=1')
          return
        }

        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData.session) {
          syncLocalSession(sessionData.session)
          router.replace('/')
          return
        }

        router.replace('/auth?error=missing_code')
      } catch (err) {
        console.error('[auth/callback]', err)
        setMessage('登录失败，正在返回...')
        router.replace('/auth?error=verify_failed')
      }
    }

    void handleCallback()
  }, [router])

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center', padding: '32px 24px' }}>
        <p>{message}</p>
      </div>
    </div>
  )
}
