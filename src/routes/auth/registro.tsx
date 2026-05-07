import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useSeo } from '@/hooks/use-seo'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { registerSchema, type RegisterForm } from '@/lib/validators/auth'
import { useAuth } from '@/hooks/use-auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const Route = createFileRoute('/auth/registro')({
  component: RegisterPage,
})

function RegisterPage() {
  useSeo('Crear cuenta')
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { dni_type: 'DNI', gender: 'M' },
  })

  const onSubmit = async (data: RegisterForm) => {
    const { error } = await signUp({
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      dni: data.dni,
      dni_type: data.dni_type,
      birth_date: data.birth_date,
      gender: data.gender,
      phone: data.phone,
    })

    if (error) {
      toast.error(
        error.message.includes('already registered')
          ? 'Ese email ya está registrado'
          : 'Error al registrarse. Intentá de nuevo.'
      )
      return
    }

    toast.success('¡Cuenta creada! Revisá tu email para confirmar.')
    navigate({ to: '/auth/login' })
  }

  const fieldCls = "h-11 rounded-[10px] border-line bg-white text-navy"
  const labelCls = "font-mono text-[12px] uppercase tracking-[0.1em] text-navy"

  return (
    <div className="bg-paper min-h-[calc(100vh-4rem)] px-4 py-12">
      <div className="max-w-lg mx-auto">

        <div className="mb-8">
          <div className="flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-terra mb-3">
            <span className="w-6 h-px bg-terra" />
            Nueva cuenta
          </div>
          <h1 className="font-display text-[36px] leading-none tracking-[-0.01em] text-navy mb-2">
            Crear cuenta gratis
          </h1>
          <p className="text-brand-muted text-[15px]">
            Completá tus datos para inscribirte a eventos y armar tu race‑cation.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white border border-line rounded-[18px] p-6 space-y-5">

            {/* Acceso */}
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-terra mb-3">Acceso</p>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className={labelCls}>Email</Label>
                  <Input id="email" type="email" placeholder="tu@email.com" className={fieldCls} {...register('email')} />
                  {errors.email && <p className="text-[13px] text-terra">{errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className={labelCls}>Contraseña</Label>
                    <Input id="password" type="password" autoComplete="new-password" className={fieldCls} {...register('password')} />
                    {errors.password && <p className="text-[13px] text-terra">{errors.password.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirm_password" className={labelCls}>Repetir contraseña</Label>
                    <Input id="confirm_password" type="password" autoComplete="new-password" className={fieldCls} {...register('confirm_password')} />
                    {errors.confirm_password && <p className="text-[13px] text-terra">{errors.confirm_password.message}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-line" />

            {/* Datos personales */}
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-terra mb-3">Datos personales</p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="first_name" className={labelCls}>Nombre</Label>
                    <Input id="first_name" placeholder="Juan" className={fieldCls} {...register('first_name')} />
                    {errors.first_name && <p className="text-[13px] text-terra">{errors.first_name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="last_name" className={labelCls}>Apellido</Label>
                    <Input id="last_name" placeholder="Pérez" className={fieldCls} {...register('last_name')} />
                    {errors.last_name && <p className="text-[13px] text-terra">{errors.last_name.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1.5">
                    <Label className={labelCls}>Tipo doc.</Label>
                    <Select defaultValue="DNI" onValueChange={(v) => setValue('dni_type', v as 'DNI' | 'PASAPORTE' | 'CI')}>
                      <SelectTrigger className="h-11 rounded-[10px] border-line bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DNI">DNI</SelectItem>
                        <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                        <SelectItem value="CI">CI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label htmlFor="dni" className={labelCls}>Número de documento</Label>
                    <Input id="dni" placeholder="12345678" className={fieldCls} {...register('dni')} />
                    {errors.dni && <p className="text-[13px] text-terra">{errors.dni.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="birth_date" className={labelCls}>Fecha de nacimiento</Label>
                    <Input id="birth_date" type="date" className={fieldCls} {...register('birth_date')} />
                    {errors.birth_date && <p className="text-[13px] text-terra">{errors.birth_date.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className={labelCls}>Sexo</Label>
                    <Select defaultValue="M" onValueChange={(v) => setValue('gender', v as 'M' | 'F' | 'X')}>
                      <SelectTrigger className="h-11 rounded-[10px] border-line bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Femenino</SelectItem>
                        <SelectItem value="X">No binario / Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && <p className="text-[13px] text-terra">{errors.gender.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className={labelCls}>Teléfono (con código de área)</Label>
                  <Input id="phone" type="tel" placeholder="+54 376 4123456" className={fieldCls} {...register('phone')} />
                  {errors.phone && <p className="text-[13px] text-terra">{errors.phone.message}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-full bg-navy text-paper text-[15px] font-semibold hover:bg-terra transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
            <p className="text-[14px] text-brand-muted text-center">
              ¿Ya tenés cuenta?{' '}
              <Link to="/auth/login" className="text-navy font-semibold hover:text-terra transition-colors">
                Iniciá sesión
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
