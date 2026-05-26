import { createClient } from '@supabase/supabase-js'

function createAuthedClient(accessToken: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    }
  )
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message: unknown }).message
    if (typeof msg === 'string') return msg
  }
  return String(err)
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const accessToken = authHeader?.replace(/^Bearer\s+/i, '')

    if (!accessToken) {
      return Response.json({ success: false, msg: '未登录，请先登录' })
    }

    const { amount, pay_type, user_id } = await request.json()

    if (!user_id || amount == null) {
      return Response.json({ success: false, msg: '缺少 user_id 或 amount' })
    }

    const supabase = createAuthedClient(accessToken)

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      return Response.json({
        success: false,
        msg: userError?.message || '登录已过期，请重新登录',
      })
    }

    if (userData.user.id !== user_id) {
      return Response.json({ success: false, msg: '用户身份不匹配' })
    }

    const order_no = 'ORDER' + Date.now()

    const { data, error } = await supabase
      .from('payments')
      .insert([
        {
          user_id,
          order_no,
          amount: Number(amount),
          pay_type,
          status: 'pending',
        },
      ])
      .select()

    if (error) {
      console.error('[create-order] insert failed:', error)
      return Response.json({ success: false, msg: error.message })
    }

    return Response.json({ success: true, order: data[0] })
  } catch (err) {
    console.error('[create-order] unexpected error:', err)
    return Response.json({ success: false, msg: errorMessage(err) })
  }
}
