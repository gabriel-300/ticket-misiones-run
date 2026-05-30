import { createFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useSeo } from '@/hooks/use-seo'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'
import { loginSchema, type LoginForm } from '@/lib/validators/auth'
import { useAuth } from '@/hooks/use-auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const searchSchema = z.object({ next: z.string().optional() })

export const Route = createFileRoute('/auth/login')({
  validateSearch: searchSchema,
  component: LoginPage,
})

function LoginPage() {
  useSeo('Iniciar sesión')
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const { next } = useSearch({ from: '/auth/login' })

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    const { error } = await signIn(data.email, data.password)
    if (error) {
      toast.error(
        error.message === 'Email not confirmed'
          ? 'Confirmá tu email antes de ingresar'
          : error.message === 'Invalid login credentials'
            ? 'Email o contraseña incorrectos'
            : 'Error al iniciar sesión. Intentá de nuevo.'
      )
      return
    }
    toast.success('¡Bienvenido!')
    navigate({ to: next ?? '/' })
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy flex-col justify-between p-16">
        <Link to="/" className="flex items-center gap-2.5 font-display text-[18px] tracking-[0.02em] text-paper">
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="38" height="38" rx="9" fill="#C84B22"/>
            <circle cx="19" cy="19" r="12" stroke="#071A2F" strokeWidth="2.6" fill="none"
              strokeDasharray="67 9" strokeLinecap="round" transform="rotate(-30 19 19)"/>
            <line x1="11" y1="18.5" x2="27" y2="18.5" stroke="white" strokeWidth="3.2" strokeLinecap="round"/>
            <line x1="19" y1="18.5" x2="19" y2="29" stroke="white" strokeWidth="3.2" strokeLinecap="round"/>
          </svg>
          <span className="font-display text-[18px] tracking-[0.04em] text-paper">TEVEN<span className="text-[#C84B22]">T</span></span>
        </Link>
        <div>
          <h2 className="font-display text-[clamp(36px,4vw,56px)] leading-[0.97] tracking-[-0.02em] text-paper mb-4">
            Las mejores<br />carreras del NEA<br />te esperan.
          </h2>
          <p className="text-paper/60 text-[16px]">
            Inscribite, pagá y viví los mejores eventos de Misiones.
          </p>
        </div>
        <div className="flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-yellow">
          <span className="w-6 h-px bg-yellow" />
          Plataforma oficial · Misiones, Argentina
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-paper">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="font-display text-[32px] leading-none tracking-[-0.01em] text-navy mb-2">
              Iniciar sesión
            </h1>
            <p className="text-brand-muted text-[15px]">Ingresá con tu email y contraseña</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-mono text-[12px] uppercase tracking-[0.1em] text-navy">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                className="h-12 rounded-[10px] border-line bg-white text-navy"
                {...register('email')}
              />
              {errors.email && <p className="text-[13px] text-terra">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-mono text-[12px] uppercase tracking-[0.1em] text-navy">Contraseña</Label>
                <Link to="/auth/recuperar" className="text-[13px] text-brand-muted hover:text-navy transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                className="h-12 rounded-[10px] border-line bg-white text-navy"
                {...register('password')}
              />
              {errors.password && <p className="text-[13px] text-terra">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-full bg-navy text-paper text-[15px] font-semibold hover:bg-terra transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>

            <p className="text-[14px] text-brand-muted text-center">
              ¿No tenés cuenta?{' '}
              <Link to="/auth/registro" className="text-navy font-semibold hover:text-terra transition-colors">
                Registrate gratis
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
