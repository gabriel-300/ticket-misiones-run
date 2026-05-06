import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useSeo } from '@/hooks/use-seo'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { registerSchema, type RegisterForm } from '@/lib/validators/auth'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Crear cuenta</CardTitle>
          <CardDescription>Completá tus datos para registrarte</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Acceso */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="tu@email.com" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Repetir contraseña</Label>
                <Input id="confirm_password" type="password" autoComplete="new-password" {...register('confirm_password')} />
                {errors.confirm_password && <p className="text-sm text-destructive">{errors.confirm_password.message}</p>}
              </div>
            </div>

            <Separator />

            {/* Datos personales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nombre</Label>
                <Input id="first_name" placeholder="Juan" {...register('first_name')} />
                {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Apellido</Label>
                <Input id="last_name" placeholder="Pérez" {...register('last_name')} />
                {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select defaultValue="DNI" onValueChange={(v) => setValue('dni_type', v as 'DNI' | 'PASAPORTE' | 'CI')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DNI">DNI</SelectItem>
                    <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                    <SelectItem value="CI">CI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="dni">Número de documento</Label>
                <Input id="dni" placeholder="12345678" {...register('dni')} />
                {errors.dni && <p className="text-sm text-destructive">{errors.dni.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birth_date">Fecha de nacimiento</Label>
                <Input id="birth_date" type="date" {...register('birth_date')} />
                {errors.birth_date && <p className="text-sm text-destructive">{errors.birth_date.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Sexo</Label>
                <Select defaultValue="M" onValueChange={(v) => setValue('gender', v as 'M' | 'F' | 'X')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Femenino</SelectItem>
                    <SelectItem value="X">No binario / Otro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (con código de área)</Label>
              <Input id="phone" type="tel" placeholder="+54 376 4123456" {...register('phone')} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              ¿Ya tenés cuenta?{' '}
              <Link to="/auth/login" className="text-primary hover:underline font-medium">
                Iniciá sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
