import { createFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useSeo } from '@/hooks/use-seo'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'
import { loginSchema, type LoginForm } from '@/lib/validators/auth'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

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
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Iniciar sesión</CardTitle>
          <CardDescription>Ingresá con tu email y contraseña</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link to="/auth/recuperar" className="text-sm text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              ¿No tenés cuenta?{' '}
              <Link to="/auth/registro" className="text-primary hover:underline font-medium">
                Registrate
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
