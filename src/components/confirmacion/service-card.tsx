import { useState } from 'react'
import { Heart, MessageCircle, Mail, ExternalLink, Bed, Car, UtensilsCrossed, Sparkles, Compass, Package } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useToggleServiceInterest } from '@/hooks/use-complementary-services'

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
  hospedaje:    <Bed className="h-4 w-4" />,
  comida:       <UtensilsCrossed className="h-4 w-4" />,
  transporte:   <Car className="h-4 w-4" />,
  wellness:     <Sparkles className="h-4 w-4" />,
  experiencia:  <Compass className="h-4 w-4" />,
  equipamiento: <Package className="h-4 w-4" />,
}

const CATEGORY_COLORS: Record<string, string> = {
  hospedaje:    'bg-blue-50 text-blue-700 border-blue-200',
  comida:       'bg-orange-50 text-orange-700 border-orange-200',
  transporte:   'bg-purple-50 text-purple-700 border-purple-200',
  wellness:     'bg-pink-50 text-pink-700 border-pink-200',
  experiencia:  'bg-green-50 text-green-700 border-green-200',
  equipamiento: 'bg-gray-50 text-gray-700 border-gray-200',
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

const formatARS = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

export default function ServiceCard({ service, registrationId, isInterested }: ServiceCardProps) {
  const [optimisticInterested, setOptimisticInterested] = useState(isInterested)
  const { mutate: toggle, isPending } = useToggleServiceInterest(registrationId)

  const colorClass = CATEGORY_COLORS[service.category] ?? CATEGORY_COLORS.otro

  function handleContact() {
    if (service.contact_method === 'whatsapp' && service.contact_value) {
      const phone = service.contact_value.replace(/\D/g, '')
      const msg = encodeURIComponent(`Hola, me interesa el servicio "${service.title}" relacionado a MISIONA HUB`)
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
          if (next) toast.success('Guardado en tu lista de intereses')
        },
      }
    )
  }

  return (
    <div className="bg-card border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {service.image_url && (
        <img src={service.image_url} alt={service.title} className="w-full h-36 object-cover" />
      )}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border mb-2 ${colorClass}`}>
              {CATEGORY_ICONS[service.category]}
              {CATEGORY_LABELS[service.category] ?? service.category}
            </div>
            <h3 className="font-semibold text-sm leading-tight">{service.title}</h3>
            <p className="text-xs text-muted-foreground">{service.partner_name}</p>
          </div>
          <button
            onClick={handleInterest}
            disabled={isPending}
            className="shrink-0 mt-1"
            aria-label={optimisticInterested ? 'Quitar interés' : 'Me interesa'}
          >
            <Heart
              className={`h-5 w-5 transition-colors ${optimisticInterested ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-red-400'}`}
            />
          </button>
        </div>

        {service.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{service.description}</p>
        )}

        <div className="flex items-center justify-between pt-1">
          {service.price_from ? (
            <span className="text-sm font-semibold">
              Desde {formatARS(service.price_from)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Precio a consultar</span>
          )}

          {service.contact_method !== 'form' && service.contact_value ? (
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={handleContact}>
              {service.contact_method === 'whatsapp'
                ? <><MessageCircle className="h-3 w-3" /> WhatsApp</>
                : <><Mail className="h-3 w-3" /> Email</>
              }
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={handleInterest}>
              <ExternalLink className="h-3 w-3" />
              {optimisticInterested ? 'Guardado' : 'Me interesa'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
