import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold tracking-tight text-foreground">
        TicketMisionesRun
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Plataforma de inscripción a eventos de running en Misiones
      </p>
    </main>
  )
}
