import { useEffect, useRef, useState } from 'react'
import { Loader2, CreditCard, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

// Ambient type for Decidir.js global
declare global {
  interface Window {
    Decidir: new (apiUrl: string) => {
      setPublishableKey: (key: string) => void
      setTimeout: (ms: number) => void
      createToken: (form: HTMLFormElement, cb: (status: number, response: DecidirTokenResponse) => void) => void
    }
  }
}

interface DecidirTokenResponse {
  id: string
  bin: string
  error?: { message: string }[]
  validation_errors?: { message: string }[]
  message?: string
}

interface CheckoutFormProps {
  totalAmount: number
  onSuccess: () => void
  onSubmit: (params: { token: string; bin: string; paymentMethodId: number; installments: number }) => Promise<void>
}

const API_URL    = import.meta.env.VITE_PAYWAY_API_URL as string
const PUBLIC_KEY = import.meta.env.VITE_PAYWAY_PUBLIC_KEY as string
const SCRIPT_URL = import.meta.env.VITE_PAYWAY_SCRIPT_URL as string
const IS_TEST    = import.meta.env.VITE_PAYWAY_API_URL?.includes('developers')

function formatCardNumber(val: string) {
  return val.replace(/\D/g, '').substring(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
}

function getPaymentMethodId(num: string, credit: boolean): number {
  const n   = num.replace(/\D/g, '')
  const two = n.substring(0, 2)
  if (n[0] === '4') return credit ? 1 : 6
  if (['51', '52', '53', '54', '55'].includes(two) ||
      (parseInt(n.substring(0, 4)) >= 2221 && parseInt(n.substring(0, 4)) <= 2720))
    return credit ? 15 : 23
  if (two === '34' || two === '37') return 30
  if (n.startsWith('6042') || n.startsWith('6043')) return 28
  if (n.startsWith('589562')) return 24
  return credit ? 1 : 6
}

const formatARS = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

export default function CheckoutForm({ totalAmount, onSubmit }: CheckoutFormProps) {
  const [sdkReady, setSdkReady]         = useState(false)
  const [isCredit, setIsCredit]         = useState(true)
  const [cardNumber, setCardNumber]     = useState('')
  const [paymentMethodId, setPaymentMethodId] = useState(1)
  const [installments, setInstallments] = useState(1)
  const [processing, setProcessing]     = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const decidirRef = useRef<InstanceType<Window['Decidir']> | null>(null)
  const formRef    = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (window.Decidir) { initSDK(); return }
    if (document.querySelector(`script[src="${SCRIPT_URL}"]`)) return
    const s       = document.createElement('script')
    s.src         = SCRIPT_URL
    s.async       = true
    s.onload      = initSDK
    document.body.appendChild(s)
  }, [])

  function initSDK() {
    decidirRef.current = new window.Decidir(API_URL)
    decidirRef.current.setPublishableKey(PUBLIC_KEY)
    decidirRef.current.setTimeout(5000)
    setSdkReady(true)
  }

  function handleCardNumber(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatCardNumber(e.target.value)
    setCardNumber(formatted)
    setPaymentMethodId(getPaymentMethodId(formatted, isCredit))
  }

  function handleCreditToggle(credit: boolean) {
    setIsCredit(credit)
    setPaymentMethodId(getPaymentMethodId(cardNumber, credit))
    if (!credit) setInstallments(1)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sdkReady || !decidirRef.current || !formRef.current) return
    setError(null)
    setProcessing(true)

    decidirRef.current.createToken(formRef.current, async (status, response) => {
      if (status !== 200 && status !== 201) {
        const msg = response?.validation_errors?.[0]?.message
          ?? response?.error?.[0]?.message
          ?? response?.message
          ?? 'Verificá los datos de la tarjeta'
        setError(msg)
        setProcessing(false)
        return
      }

      try {
        await onSubmit({
          token: response.id,
          bin: response.bin,
          paymentMethodId,
          installments,
        })
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al procesar el pago')
        setProcessing(false)
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {/* Test mode notice */}
      {IS_TEST && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 space-y-1">
          <p className="font-semibold">Modo sandbox — usá estas tarjetas de prueba:</p>
          <p>Visa crédito: <span className="font-mono">4507990000004905</span></p>
          <p>Mastercard crédito: <span className="font-mono">5299910010000015</span></p>
          <p>Visa débito: <span className="font-mono">4517721004856075</span></p>
          <p className="text-amber-600">CVV: 123 · Venc: 03/30 · DNI: cualquiera</p>
        </div>
      )}

      {/* Crédito / Débito */}
      <div className="flex gap-2">
        {[{ label: 'Crédito', val: true }, { label: 'Débito', val: false }].map(({ label, val }) => (
          <button
            key={label}
            type="button"
            onClick={() => handleCreditToggle(val)}
            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors
              ${isCredit === val
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:border-primary/50'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Número de tarjeta */}
      <div className="space-y-1.5">
        <Label>Número de tarjeta *</Label>
        <Input
          type="text"
          data-decidir="card_number"
          value={cardNumber}
          onChange={handleCardNumber}
          placeholder="1234 5678 9012 3456"
          className="tracking-widest"
          maxLength={19}
          required
        />
      </div>

      {/* Nombre */}
      <div className="space-y-1.5">
        <Label>Nombre en la tarjeta *</Label>
        <Input
          type="text"
          data-decidir="card_holder_name"
          placeholder="NOMBRE APELLIDO"
          className="uppercase"
          required
        />
      </div>

      {/* DNI titular */}
      <div className="space-y-1.5">
        <Label>DNI del titular *</Label>
        <input type="hidden" data-decidir="card_holder_doc_type" value="dni" readOnly />
        <Input
          type="text"
          data-decidir="card_holder_doc_number"
          placeholder="27859328"
          maxLength={8}
          required
        />
      </div>

      {/* Vencimiento + CVV */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>Mes *</Label>
          <Input
            type="text"
            data-decidir="card_expiration_month"
            placeholder="MM"
            className="text-center"
            maxLength={2}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Año *</Label>
          <Input
            type="text"
            data-decidir="card_expiration_year"
            placeholder="AA"
            className="text-center"
            maxLength={2}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>CVV *</Label>
          <Input
            type="text"
            data-decidir="security_code"
            placeholder="123"
            className="text-center"
            maxLength={4}
            required
          />
        </div>
      </div>

      {/* Cuotas (sólo crédito) */}
      {isCredit && (
        <div className="space-y-1.5">
          <Label>Cuotas</Label>
          <Select
            value={String(installments)}
            onValueChange={v => setInstallments(Number(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 cuota — {formatARS(totalAmount)}</SelectItem>
              <SelectItem value="3">3 cuotas — {formatARS(totalAmount / 3)}/mes</SelectItem>
              <SelectItem value="6">6 cuotas — {formatARS(totalAmount / 6)}/mes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
      )}

      <Separator />

      <Button
        type="submit"
        size="lg"
        className="w-full gap-2"
        disabled={processing || !sdkReady}
      >
        {processing ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Procesando pago...</>
        ) : !sdkReady ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Cargando...</>
        ) : (
          <><Lock className="h-4 w-4" /> Pagar {formatARS(totalAmount)}</>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
        <CreditCard className="h-3.5 w-3.5" />
        Pago procesado por PayWay · Visa · Mastercard · Débito
      </p>
    </form>
  )
}
