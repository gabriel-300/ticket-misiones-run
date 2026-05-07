import { useState } from 'react'
import { Heart, MessageCircle, Mail, Bed, Car, UtensilsCrossed, Sparkles, Compass, Package } from 'lucide-react'
import { toast } from 'sonner'
import { useToggleServiceInterest } from '@/hooks/use-complementary-services'
import { formatARS } from '@/lib/utils'

const CATEGORY_LABELS: Record<string, string> = {
  hospedaje:    'Hospedaje',
  comida:       'Gastronomía',
  transporte:   'Traslados',
  wellness:     'Wellness',
  experiencia:  'Experiencias',
  equipamiento: 'Equipamiento',
  otro:         'Servicio',
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  hospedaje:    <Bed className="h-3.5 w-3.5" />,
  comida:       <UtensilsCrossed className="h-3.5 w-3.5" />,
  transporte:   <Car className="h-3.5 w-3.5" />,
  wellness:     <Sparkles className="h-3.5 w-3.5" />,
  experiencia:  <Compass className="h-3.5 w-3.5" />,
  equipamiento: <Package className="h-3.5 w-3.5" />,
}

interface ServiceCardProps {
  service: {
    id: string
    category: string
    partner_name: string
    title: string
    description: string | null
    image_url: string | null
    price_from: number | null
    currency: string | null
    contact_method: string
    contact_value: string | null
  }
  registrationId: string
  isInterested: boolean
}

export default function ServiceCard({ service, registrationId, isInterested }: ServiceCardProps) {
  const [optimisticInterested, setOptimisticInterested] = useState(isInterested)
  const { mutate: toggle, isPending } = useToggleServiceInterest(registrationId)

  function handleContact() {
    if (service.contact_method === 'whatsapp' && service.contact_value) {
      const phone = service.contact_value.replace(/\D/g, '')
      const msg = encodeURIComponent(`Hola, me interesa el servicio "${service.title}" de MISIONA HUB`)
      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
    } else if (service.contact_method === 'email' && service.contact_value) {
      window.open(`mailto:${service.contact_value}?subject=Consulta: ${encodeURIComponent(service.title)}`, '_blank')
    }
  }

  function handleInterest() {
    const next = !optimisticInterested
    setOptimisticInterested(next)
    toggle(
      { serviceId: service.id, alreadyInterested: optimisticInterested },
      {
        onError: () => {
          setOptimisticInterested(!next)
          toast.error('No se pudo guardar tu interés')
        },
        onSuccess: () => {
          if (next) toast.success('Guardado en tu lista')
        },
      }
    )
  }

  return (
    <div className="bg-white border border-line rounded-[14px] overflow-hidden hover:shadow-[0_8px_24px_-8px_rgba(11,27,43,0.15)] transition-shadow group">
      {service.image_url && (
        <div className="overflow-hidden h-36">
          <img
            src={service.image_url}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full bg-cream text-navy">
                {CATEGORY_ICONS[service.category]}
                {CATEGORY_LABELS[service.category] ?? service.category}
              </span>
            </div>
            <h3 className="font-display text-[17px] leading-[1.1] text-navy">{service.title}</h3>
            {service.partner_name && (
              <p className="font-mono text-[11px] text-brand-muted mt-0.5">{service.partner_name}</p>
            )}
          </div>
          <button
            onClick={handleInterest}
            disabled={isPending}
            className="shrink-0 mt-0.5 p-1.5 rounded-full hover:bg-cream transition-colors"
            aria-label={optimisticInterested ? 'Quitar interés' : 'Me interesa'}
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                optimisticInterested ? 'fill-terra text-terra' : 'text-brand-muted hover:text-terra'
              }`}
            />
          </button>
        </div>

        {service.description && (
          <p className="text-[13px] text-brand-muted leading-[1.5]">{service.description}</p>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-line">
          {service.price_from ? (
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-brand-muted block">Desde</span>
              <span className="font-display text-[18px] leading-none text-navy">{formatARS(service.price_from)}</span>
            </div>
          ) : (
            <span className="font-mono text-[12px] text-brand-muted">Precio a consultar</span>
          )}

          {service.contact_method !== 'form' && service.contact_value ? (
            <button
              onClick={handleContact}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-navy text-paper text-[12px] font-semibold hover:bg-terra transition-colors"
            >
              {service.contact_method === 'whatsapp'
                ? <><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</>
                : <><Mail className="h-3.5 w-3.5" /> Email</>
              }
            </button>
          ) : (
            <button
              onClick={handleInterest}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-semibold transition-colors ${
                optimisticInterested
                  ? 'bg-terra/10 text-terra'
                  : 'bg-cream text-navy hover:bg-navy hover:text-paper'
              }`}
            >
              <Heart className="h-3.5 w-3.5" />
              {optimisticInterested ? 'Guardado' : 'Me interesa'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
