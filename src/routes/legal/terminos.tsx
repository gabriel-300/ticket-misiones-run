import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSeo } from '@/hooks/use-seo'

export const Route = createFileRoute('/legal/terminos')({
  component: TerminosPage,
})

function TerminosPage() {
  useSeo('Términos y condiciones — MISIONA HUB')

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link to="/eventos">
          <Button variant="ghost" size="sm" className="gap-1.5 mb-4">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-extrabold">Términos y condiciones</h1>
        <p className="text-muted-foreground mt-2">Última actualización: mayo 2026</p>
      </div>

      <div className="prose prose-sm max-w-none space-y-6 text-sm leading-relaxed">

        <section>
          <h2 className="text-lg font-bold mt-6 mb-2">1. Aceptación</h2>
          <p>
            Al inscribirte en cualquier evento a través de MISIONA HUB, aceptás estos términos en su totalidad.
            Si no estás de acuerdo, no debés completar la inscripción.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mt-6 mb-2">2. Servicio</h2>
          <p>
            MISIONA HUB es una plataforma de gestión de inscripciones para eventos deportivos y de entretenimiento
            en la provincia de Misiones, Argentina, operada por Misiones Online.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mt-6 mb-2">3. Inscripciones y pagos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Las inscripciones son personales e intransferibles salvo comunicación previa al organizador.</li>
            <li>El pago se procesa a través de Payway (Decidir). MISIONA HUB no almacena datos de tarjeta.</li>
            <li>Una vez confirmado el pago, la inscripción es definitiva.</li>
            <li>El fee de servicio (indicado en cada evento) no es reembolsable.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mt-6 mb-2">4. Cancelaciones y reembolsos</h2>
          <p>
            Las políticas de cancelación y reembolso son definidas por cada organizador. Consultá las condiciones
            específicas de cada evento antes de inscribirte. MISIONA HUB no es responsable de los reembolsos,
            que son gestionados directamente por el organizador del evento.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mt-6 mb-2">5. Deslinde de responsabilidad</h2>
          <p>
            La participación en eventos deportivos implica riesgos inherentes a la actividad física. Al inscribirte,
            declarás que estás en condiciones físicas aptas para participar, que contás con apto médico cuando
            el evento lo requiere, y que relevás a MISIONA HUB y a los organizadores de toda responsabilidad
            por accidentes o daños derivados de tu participación.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mt-6 mb-2">6. Datos personales</h2>
          <p>
            Tus datos son tratados conforme a la Ley 25.326 de Protección de Datos Personales de la República Argentina.
            Los utilizamos exclusivamente para gestionar tu inscripción y comunicarte información relevante del evento.
            No los compartimos con terceros sin tu consentimiento, salvo obligación legal.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mt-6 mb-2">7. Uso de imagen</h2>
          <p>
            Si autorizaste el uso de imagen durante la inscripción, aceptás que las fotos y videos tomados
            durante el evento puedan ser utilizados por MISIONA HUB y el organizador con fines de comunicación
            y promoción, sin derecho a compensación económica.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mt-6 mb-2">8. Modificaciones</h2>
          <p>
            MISIONA HUB se reserva el derecho de modificar estos términos en cualquier momento. Los cambios
            serán publicados en esta página con la fecha de actualización.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mt-6 mb-2">9. Contacto</h2>
          <p>
            Ante consultas, podés escribirnos a{' '}
            <a href="mailto:info@misionahub.com.ar" className="text-primary underline">
              info@misionahub.com.ar
            </a>
          </p>
        </section>

      </div>
    </div>
  )
}
