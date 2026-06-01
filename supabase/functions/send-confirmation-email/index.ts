import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const SUPABASE_URL   = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_KEY    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const APP_URL        = Deno.env.get('APP_URL') ?? 'https://ticket-misiones-run.vercel.app'

const FROM_EMAIL = 'tevent <onboarding@resend.dev>'

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

    const { data: reg, error: regError } = await admin
      .from('registrations')
      .select(`
        id, category, status,
        buyer:buyer_id ( id, first_name, last_name ),
        ticket_type:ticket_type_id ( name, distance_km, start_time ),
        event:event_id ( name, starts_at, location, cover_image_url )
      `)
      .eq('id', registration_id)
      .single()

    if (regError || !reg) {
      return new Response(JSON.stringify({ error: 'Inscripción no encontrada' }), { status: 404, headers: cors })
    }

    const { data: userData } = await admin.auth.admin.getUserById((reg.buyer as any).id ?? '')
    const buyerEmail = userData?.user?.email
    if (!buyerEmail) {
      return new Response(JSON.stringify({ error: 'Email del comprador no encontrado' }), { status: 404, headers: cors })
    }

    const buyer      = reg.buyer as any
    const event      = reg.event as any
    const ticketType = reg.ticket_type as any
    const location   = event.location as { city: string; province: string; address?: string }

    const formattedDate = new Date(event.starts_at).toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })

    const html = buildConfirmationEmail({
      firstName:      buyer.first_name,
      lastName:       buyer.last_name,
      eventName:      event.name,
      eventDate:      formattedDate,
      city:           location.city,
      province:       location.province,
      ticketName:     ticketType.name,
      distanceKm:     ticketType.distance_km ?? null,
      startTime:      ticketType.start_time ?? null,
      category:       reg.category ?? null,
      registrationId: reg.id,
    })

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from:    FROM_EMAIL,
        to:      [buyerEmail],
        subject: `¡Estás inscripto! — ${event.name}`,
        html,
      }),
    })

    const resendData = await resendRes.json()

    if (!resendRes.ok) {
      console.error('Resend error:', JSON.stringify(resendData))
      await logEmail(admin, {
        registrationId: reg.id, recipientEmail: buyerEmail,
        status: 'failed', error: JSON.stringify(resendData),
        subject: `¡Estás inscripto! — ${event.name}`,
      })
      return new Response(JSON.stringify({ error: resendData?.message ?? 'Error al enviar email' }), { status: 500, headers: cors })
    }

    await logEmail(admin, {
      registrationId: reg.id, recipientEmail: buyerEmail,
      resendId: resendData.id, status: 'sent',
      subject: `¡Estás inscripto! — ${event.name}`,
    })

    console.log(`Email enviado a ${buyerEmail} — resend_id: ${resendData.id}`)
    return new Response(JSON.stringify({ ok: true, resend_id: resendData.id }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })

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
    recipient_email:         params.recipientEmail,
    template:                'registration_confirmation',
    subject:                 params.subject,
    resend_id:               params.resendId ?? null,
    status:                  params.status,
    error:                   params.error ?? null,
    related_registration_id: params.registrationId,
    sent_at:                 params.status === 'sent' ? new Date().toISOString() : null,
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
  registrationId: string
}

function buildConfirmationEmail(d: TemplateData): string {
  const confirmationUrl = `${APP_URL}/confirmacion/${d.registrationId}`

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>¡Estás inscripto!</title>
</head>
<body style="margin:0;padding:0;background:#F5F1EB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F1EB;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:#0D1B2A;padding:36px 32px 28px;text-align:center;">
            <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#F5C913;letter-spacing:3px;text-transform:uppercase;">tevent</p>
            <h1 style="margin:0;font-size:28px;font-weight:800;color:#ffffff;line-height:1.2;">¡Estás inscripto${d.firstName ? '' : ''}!</h1>
            <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,.7);">
              Hola <strong style="color:#ffffff;">${d.firstName}</strong>, tu lugar está reservado en<br/>
              <strong style="color:#F5C913;">${d.eventName}</strong>
            </p>
          </td>
        </tr>

        <!-- Event details -->
        <tr>
          <td style="padding:28px 32px 8px;">
            <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#F5C913;letter-spacing:3px;text-transform:uppercase;">Tu inscripción</p>
            <h2 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#0D1B2A;">${d.eventName}</h2>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" style="padding:10px 12px;background:#F5F1EB;border-radius:10px;vertical-align:top;">
                  <span style="display:block;font-size:10px;font-weight:700;color:#F5C913;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">Fecha</span>
                  <span style="font-size:13px;font-weight:600;color:#0D1B2A;text-transform:capitalize;">${d.eventDate}</span>
                </td>
                <td width="4px"></td>
                <td width="50%" style="padding:10px 12px;background:#F5F1EB;border-radius:10px;vertical-align:top;">
                  <span style="display:block;font-size:10px;font-weight:700;color:#F5C913;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">Lugar</span>
                  <span style="font-size:13px;font-weight:600;color:#0D1B2A;">${d.city}, ${d.province}</span>
                </td>
              </tr>
              <tr><td colspan="3" style="padding:4px 0;"></td></tr>
              <tr>
                <td width="50%" style="padding:10px 12px;background:#F5F1EB;border-radius:10px;vertical-align:top;">
                  <span style="display:block;font-size:10px;font-weight:700;color:#F5C913;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">Entrada</span>
                  <span style="font-size:13px;font-weight:600;color:#0D1B2A;">${d.ticketName}${d.distanceKm != null ? ` — ${d.distanceKm} km` : ''}${d.startTime ? `<br/><span style="font-weight:400;font-size:12px;color:#6b7280;">Largada: ${d.startTime}</span>` : ''}</span>
                </td>
                <td width="4px"></td>
                <td width="50%" style="padding:10px 12px;background:#F5F1EB;border-radius:10px;vertical-align:top;">
                  ${d.category ? `
                  <span style="display:block;font-size:10px;font-weight:700;color:#F5C913;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">Categoría</span>
                  <span style="font-size:13px;font-weight:600;color:#0D1B2A;">${d.category}</span>
                  ` : '<span style="display:block;font-size:13px;color:transparent;">—</span>'}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:28px 32px;text-align:center;">
            <a href="${confirmationUrl}"
               style="display:inline-block;background:#F5C913;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:100px;letter-spacing:0.3px;">
              Ver mi inscripción →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0D1B2A;padding:20px 32px;text-align:center;">
            <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#F5C913;letter-spacing:2px;text-transform:uppercase;">tevent</p>
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,.45);">
              Experiencias que dejan huella · Misiones, Argentina<br/>
              Si no realizaste esta inscripción, ignorá este mensaje.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
