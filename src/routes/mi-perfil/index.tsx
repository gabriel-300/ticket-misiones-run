import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/mi-perfil/')({
  beforeLoad: () => {
    throw redirect({ to: '/perfil', replace: true })
  },
  component: () => null,
})
