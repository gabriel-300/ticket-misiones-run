import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

const searchSchema = z.object({
  type: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
})

export const Route = createFileRoute('/auth/callback')({
  validateSearch: searchSchema,
  component: AuthCallbackPage,
})

function AuthCallbackPage() {
  const navigate = useNavigate()
  const { type, error, error_description } = Route.useSearch()

  useEffect(() => {
    if (error) {
      toast.error(error_description ?? 'Error al confirmar. Intentá de nuevo.')
      navigate({ to: '/auth/login' })
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate({ to: '/auth/login' })
        return
      }
      if (type === 'recovery') {
        navigate({ to: '/auth/nueva-contrasena' })
      } else {
        toast.success('¡Email confirmado! Ya podés usar tu cuenta.')
        navigate({ to: '/' })
      }
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Verificando...</p>
    </div>
  )
}
