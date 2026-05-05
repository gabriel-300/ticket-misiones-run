import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useState } from 'react'
import { resetPasswordSchema, type ResetPasswordForm } from '@/lib/validators/auth'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/auth/recuperar')({
  component: RecuperarPage,
})

function RecuperarPage() {
  const { resetPassword } = useAuth()
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordForm) => {
    const { error } = await resetPassword(data.email)
    if (error) {
      toast.error('No pudimos enviar el email. Verificá la dirección.')
      return
    }
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Recuperar contraseña</CardTitle>
          <CardDescription>
            {sent
              ? 'Revisá tu bandeja de entrada'
              : 'Te enviamos un link para restablecer tu contraseña'}
          </CardDescription>
        </CardHeader>

        {sent ? (
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Si el email está registrado, vas a recibir un mensaje con las instrucciones para
              restablecer tu contraseña.
            </p>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="tu@email.com" {...register('email')} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar link de recuperación'}
              </Button>
            </CardFooter>
          </form>
        )}

        <CardFooter>
          <Link to="/auth/login" className="text-sm text-primary hover:underline mx-auto">
            ← Volver al inicio de sesión
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
