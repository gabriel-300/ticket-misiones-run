import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PRIVATE_KEY  = Deno.env.get('PAYWAY_PRIVATE_KEY') ?? ''
const IS_TEST      = Deno.env.get('PAYWAY_TEST_MODE') !== 'false'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''

// Support both legacy keys and new SUPABASE_SECRET_KEYS / SUPABASE_PUBLISHABLE_KEYS formats
function parseJsonKey(envVar: string): string {
  try { return JSON.parse(Deno.env.get(envVar) ?? '{}').default ?? '' } catch { return '' }
}
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || parseJsonKey('SUPABASE_SECRET_KEYS')
const ANON_KEY    = Deno.env.get('SUPABASE_ANON_KEY')         || parseJsonKey('SUPABASE_PUBLISHABLE_KEYS')

const PAYWAY_API = IS_TEST
  ? 'https://developers.decidir.com/api/v2'
  : 'https://ventasonline.payway.com.ar/api/v2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    // Verify authenticated user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'No autorizado' }, 401)

    const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: authError } = await anonClient.auth.getUser()
    if (authError || !user) return json({ error: 'No autorizado' }, 401)

    const { order_id, token, bin, payment_method_id, installments = 1 } = await req.json()

    if (!order_id || !token) return json({ error: 'Datos incompletos' }, 400)

    // Fetch order with service role (bypasses RLS for updates)
    const admin = createClient(SUPABASE_URL, SERVICE_KEY)

    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('id, buyer_id, total_amount, status, registration_id')
      .eq('id', order_id)
      .eq('buyer_id', user.id)
      .single()

    if (orderError || !order) return json({ error: 'Orden no encontrada' }, 404)
    if (order.status !== 'pending') return json({ error: 'Esta orden ya fue procesada' }, 409)

    // Build Payway payload
    // Decidir amount: pesos sin decimales × 100 (43500 ARS = 4350000)
    const amount = Math.round(Number(order.total_amount) * 100)
    const siteTransactionId = `TMR-${order_id.split('-')[0].toUpperCase()}-${Date.now()}`

    const paywayBody = {
      site_transaction_id: siteTransactionId,
      token,
      payment_method_id: payment_method_id ?? 1,
      bin: bin ?? '',
      amount,
      currency: 'ARS',
      installments,
      payment_type: 'single',
      sub_payments: [],
      customer: {
        id: user.id,
        email: user.email,
      },
    }

    const paywayRes = await fetch(`${PAYWAY_API}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: PRIVATE_KEY },
      body: JSON.stringify(paywayBody),
    })

    const paywayData = await paywayRes.json()

    if (!paywayRes.ok) {
      console.error('Payway API error:', JSON.stringify(paywayData))
      await admin.from('orders').update({
        status: 'failed',
        failed_reason: paywayData?.error_message ?? JSON.stringify(paywayData),
        payway_site_transaction_id: siteTransactionId,
        updated_at: new Date().toISOString(),
      }).eq('id', order_id)

      return json({ aprobado: false, mensaje: paywayData?.error_message ?? 'Error al procesar el pago' })
    }

    const approved = paywayData.status === 'approved'

    // Update order
    await admin.from('orders').update({
      status: approved ? 'paid' : 'failed',
      payway_site_transaction_id: siteTransactionId,
      payway_payment_id: String(paywayData.id ?? ''),
      payway_status: paywayData.status,
      payway_response: paywayData,
      payway_card_brand: paywayData.payment_method_id ? String(paywayData.payment_method_id) : null,
      payway_card_last4: paywayData.card_data?.last4 ?? null,
      payway_installments: installments,
      paid_at: approved ? new Date().toISOString() : null,
      failed_reason: !approved ? (paywayData.status_details?.ticket ?? paywayData.status) : null,
      updated_at: new Date().toISOString(),
    }).eq('id', order_id)

    // Update registration status using registration_id from order (FK is orders.registration_id)
    let registrationId: string | null = (order as any).registration_id ?? null
    if (approved && registrationId) {
      await admin
        .from('registrations')
        .update({ status: 'paid', updated_at: new Date().toISOString() })
        .eq('id', registrationId)

      // Fire-and-forget confirmation email
      if (registrationId) {
        fetch(`${SUPABASE_URL}/functions/v1/send-confirmation-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({ registration_id: registrationId }),
        }).catch((e: unknown) => console.error('Email dispatch error:', e))
      }
    }

    const mensaje = approved
      ? '¡Pago aprobado! Tu inscripción está confirmada.'
      : paywayData.status === 'rejected'
        ? 'Pago rechazado por el banco. Verificá los datos o usá otra tarjeta.'
        : `Estado del pago: ${paywayData.status}`

    console.log(`Pago ${paywayData.status} — ${siteTransactionId} — $${order.total_amount} ARS`)

    return json({ aprobado: approved, mensaje, registration_id: registrationId })

  } catch (err) {
    console.error('payway-checkout error:', err)
    return json({ error: String(err) }, 500)
  }
})
