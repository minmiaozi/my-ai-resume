'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function PayPage() {
  const [user, setUser] = useState(null)
  const [amount, setAmount] = useState(99)
  const [orderNo, setOrderNo] = useState(null)
  const [loading, setLoading] = useState(false)

  // 一进页面就获取登录用户
  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser()
      if (data?.user) setUser(data.user)
    }
    getUser()
  }, [])

  // 1. 创建订单
  async function createOrder() {
    if (!user) {
      alert('请先登录')
      return
    }

    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
    if (!accessToken) {
      alert('登录已过期，请重新登录')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          amount: amount,
          pay_type: 'simulation',
        }),
      })

      const data = await res.json()
      console.log('[pay] create-order response:', data)
      if (data.success) {
        setOrderNo(data.order.order_no)
        alert('订单创建成功！订单号：' + data.order.order_no)
      } else {
        const msg =
          typeof data.msg === 'string'
            ? data.msg
            : data.msg?.message || JSON.stringify(data.msg)
        alert('创建失败：' + msg)
      }
    } catch (err) {
      alert('请求异常：' + (err?.message || String(err)))
    } finally {
      setLoading(false)
    }
  }

  // 2. 模拟支付成功（假支付）
  async function simulatePaySuccess() {
    if (!orderNo) {
      alert('请先创建订单')
      return
    }

    setLoading(true)
    try {
      // 更新订单状态为已支付
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          paid_at: new Date(),
        })
        .eq('order_no', orderNo)

      if (error) throw error

      alert('🎉 模拟支付成功！订单状态已更新')
      // 这里可以加：跳转到会员页面、更新用户权限等逻辑
    } catch (err) {
      alert('更新失败：' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '30px', maxWidth: '500px', margin: '0 auto' }}>
      <h1>💳 模拟支付页面</h1>

      {user ? (
        <div style={{ margin: '20px 0', color: '#333' }}>
          当前登录：{user.email}
        </div>
      ) : (
        <div style={{ color: 'red' }}>未登录，请先登录</div>
      )}

      <div style={{ margin: '20px 0' }}>
        <label>支付金额：</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ padding: '8px', width: '100px', marginLeft: 10 }}
        />
        元
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={createOrder}
          disabled={loading}
          style={{
            padding: '12px 25px',
            backgroundColor: '#0071e3',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
          }}
        >
          创建订单
        </button>

        <button
          onClick={simulatePaySuccess}
          disabled={loading || !orderNo}
          style={{
            padding: '12px 25px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: (loading || !orderNo) ? 'not-allowed' : 'pointer',
            fontSize: '16px',
          }}
        >
          模拟支付成功
        </button>
      </div>
    </div>
  )
}