import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const SUPABASE_URL   = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_KEY    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// Use onboarding@resend.dev until a custom domain is verified in Resend
const FROM_EMAIL = 'MISIONA HUB <onboarding@resend.dev>'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { registration_id } = await req.json()
    if (!registration_id) {
      return new Response(JSON.stringify({ error: 'registration_id requerido' }), { status: 400, headers: cors })
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY)

    // Fetch registration with all needed data
    const { data: reg, error: regError } = await admin
      .from('registrations')
      .select(`
        id, bib_number, category, status,
        buyer:buyer_id ( id, first_name, last_name ),
        ticket_type:ticket_type_id ( name, distance_km, start_time ),
        event:event_id ( name, starts_at, location, cover_image_url )
      `)
      .eq('id', registration_id)
      .single()

    if (regError || !reg) {
      return new Response(JSON.stringify({ error: 'Inscripción no encontrada' }), { status: 404, headers: cors })
    }

    // Get buyer email from auth.users
    const { data: userData } = await admin.auth.admin.getUserById((reg.buyer as any).id ?? '')
    const buyerEmail = userData?.user?.email
    if (!buyerEmail) {
      return new Response(JSON.stringify({ error: 'Email del comprador no encontrado' }), { status: 404, headers: cors })
    }

    const buyer      = reg.buyer as any
    const event      = reg.event as any
    const ticketType = reg.ticket_type as any
    const location   = event.location as { city: string; province: string; address?: string }

    const eventDate = new Date(event.starts_at)
    const formattedDate = eventDate.toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })

    const html = buildConfirmationEmail({
      firstName:    buyer.first_name,
      lastName:     buyer.last_name,
      eventName:    event.name,
      eventDate:    formattedDate,
      city:         location.city,
      province:     location.province,
      ticketName:   ticketType.name,
      distanceKm:   ticketType.distance_km ?? null,
      startTime:    ticketType.start_time ?? null,
      category:     reg.category ?? null,
      bibNumber:    reg.bib_number ?? null,
      registrationId: reg.id,
    })

    // Send via Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from:    FROM_EMAIL,
        to:      [buyerEmail],
        subject: `✅ Inscripción confirmada — ${event.name}`,
        html,
      }),
    })

    const resendData = await resendRes.json()

    if (!resendRes.ok) {
      console.error('Resend error:', JSON.stringify(resendData))
      await logEmail(admin, { registrationId: reg.id, recipientEmail: buyerEmail, status: 'failed', error: JSON.stringify(resendData), subject: `Inscripción confirmada — ${event.name}` })
      return new Response(JSON.stringify({ error: resendData?.message ?? 'Error al enviar email' }), { status: 500, headers: cors })
    }

    // Log success
    await logEmail(admin, { registrationId: reg.id, recipientEmail: buyerEmail, resendId: resendData.id, status: 'sent', subject: `Inscripción confirmada — ${event.name}` })

    console.log(`Email enviado a ${buyerEmail} — resend_id: ${resendData.id}`)
    return new Response(JSON.stringify({ ok: true, resend_id: resendData.id }), { headers: { ...cors, 'Content-Type': 'application/json' } })

  } catch (err) {
    console.error('send-confirmation-email error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: cors })
  }
})

async function logEmail(admin: ReturnType<typeof createClient>, params: {
  registrationId: string
  recipientEmail: string
  resendId?: string
  status: string
  error?: string
  subject: string
}) {
  await admin.from('email_log').insert({
    recipient_email:           params.recipientEmail,
    template:                  'registration_confirmation',
    subject:                   params.subject,
    resend_id:                 params.resendId ?? null,
    status:                    params.status,
    error:                     params.error ?? null,
    related_registration_id:   params.registrationId,
    sent_at:                   params.status === 'sent' ? new Date().toISOString() : null,
  })
}

// ─── HTML template ────────────────────────────────────────────────────────────

interface TemplateData {
  firstName: string
  lastName: string
  eventName: string
  eventDate: string
  city: string
  province: string
  ticketName: string
  distanceKm: number | null
  startTime: string | null
  category: string | null
  bibNumber: number | null
  registrationId: string
}

function buildConfirmationEmail(d: TemplateData): string {
  const appUrl = Deno.env.get('APP_URL') ?? 'https://misionahub.com.ar'
  const confirmationUrl = `${appUrl}/confirmacion/${d.registrationId}`

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Inscripción confirmada</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px 32px 24px;text-align:center;">
            <p style="margin:0 0 8px;font-size:14px;color:rgba(255,255,255,.8);letter-spacing:2px;text-transform:uppercase;">🏃 MISIONA HUB</p>
            <div style="display:inline-block;background:rgba(255,255,255,.15);border-radius:50%;width:64px;height:64px;line-height:64px;font-size:32px;text-align:center;margin-bottom:12px;">✅</div>
            <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;">¡Inscripción confirmada!</h1>
            <p style="margin:8px 0 0;font-size:15px;color:rgba(255,255,255,.85);">Hola ${d.firstName}, tu lugar está reservado</p>
          </td>
        </tr>

        <!-- Event info -->
        <tr>
          <td style="padding:28px 32px 0;">
            <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#111827;">${d.eventName}</h2>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
                  <span style="font-size:13px;color:#6b7280;">📅 Fecha</span><br/>
                  <span style="font-size:14px;font-weight:600;color:#111827;text-transform:capitalize;">${d.eventDate}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
                  <span style="font-size:13px;color:#6b7280;">📍 Lugar</span><br/>
                  <span style="font-size:14px;font-weight:600;color:#111827;">${d.city}, ${d.province}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
                  <span style="font-size:13px;color:#6b7280;">🎟️ Entrada</span><br/>
                  <span style="font-size:14px;font-weight:600;color:#111827;">${d.ticketName}${d.distanceKm != null ? ` — ${d.distanceKm} km` : ''}${d.startTime ? ` · Largada: ${d.startTime}` : ''}</span>
                </td>
              </tr>
              ${d.category ? `
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
                  <span style="font-size:13px;color:#6b7280;">🏅 Categoría</span><br/>
                  <span style="font-size:14px;font-weight:600;color:#111827;">${d.category}</span>
                </td>
              </tr>` : ''}
            </table>
          </td>
        </tr>

        <!-- Bib number -->
        ${d.bibNumber ? `
        <tr>
          <td style="padding:24px 32px;">
            <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:12px;padding:20px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#16a34a;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Número de dorsal</p>
              <p style="margin:0;font-size:56px;font-weight:900;color:#15803d;line-height:1;">#${d.bibNumber}</p>
            </div>
          </td>
        </tr>` : ''}

        <!-- CTA -->
        <tr>
          <td style="padding:0 32px 28px;text-align:center;">
            <a href="${confirmationUrl}"
               style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;">
              Ver mi inscripción y race‑cation →
            </a>
            <p style="margin:16px 0 0;font-size:13px;color:#9ca3af;">
              También podés armar tu estadía y traslados desde la plataforma.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #f3f4f6;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              MISIONA HUB · Misiones, Argentina<br/>
              Si no solicitaste esta inscripción, ignorá este mensaje.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
