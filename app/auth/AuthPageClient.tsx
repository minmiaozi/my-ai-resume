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
    message = '邮箱验证成功！现在可以登录了。'
    isSuccess = true
  } else if (error === 'verify_failed') {
    message = '邮箱验证失败，请重新注册或重新发送验证邮件。'
  } else if (error === 'missing_code') {
    message = '验证链接无效，请用 Chrome/Safari 重新打开邮件中的链接。'
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center', padding: '32px 24px' }}>
        <h1 className="auth-title">{isSuccess ? '验证成功' : '验证失败'}</h1>
        <p style={{ margin: '16px 0', color: isSuccess ? '#15803d' : '#dc2626' }}>{message}</p>
        <button
          type="button"
          className="auth-submit"
          onClick={() => openAuth('login')}
        >
          去登录
        </button>
        <p style={{ marginTop: 16 }}>
          <Link href="/">返回首页</Link>
        </p>
      </div>
    </div>
  )
}
