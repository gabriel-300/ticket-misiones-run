export interface Event {
  id: string
  slug: string
  name: string
  shortDescription: string | null
  description: string | null
  type: 'running' | 'trail' | 'triathlon' | 'cycling' | 'other'
  startsAt: string
  endsAt: string | null
  registrationOpensAt: string
  registrationClosesAt: string
  location: EventLocation
  coverImageUrl: string | null
  requiresMedicalCertificate: boolean
  serviceFeePercentage: number
  status: 'draft' | 'published' | 'closed' | 'finished' | 'cancelled'
  waiverText: string | null
}

export interface EventLocation {
  city: string
  province: string
  country: string
  address: string
  lat: number
  lng: number
}

export interface EventDistance {
  id: string
  eventId: string
  name: string
  distanceKm: number
  capacity: number | null
  registeredCount: number
  startTime: string | null
  ageMin: number | null
  ageMax: number | null
  sortOrder: number
  active: boolean
}

export interface PricingTier {
  id: string
  eventId: string
  distanceId: string | null
  name: string
  priceArs: number
  startsAt: string
  endsAt: string
  active: boolean
  sortOrder: number
}

export interface Runner {
  id: string
  role: 'runner' | 'admin'
  firstName: string
  lastName: string
  dni: string
  dniType: 'DNI' | 'PASAPORTE' | 'CI'
  birthDate: string
  gender: 'M' | 'F' | 'X'
  phone: string
  email?: string
  aptoMedicoStatus: 'pendiente' | 'aprobado' | 'rechazado'
  aptoMedicoUrl: string | null
  aptoMedicoIssuedAt: string | null
}

export interface Registration {
  id: string
  eventId: string
  distanceId: string
  runnerId: string
  bibNumber: number | null
  category: string | null
  status: 'pending_payment' | 'paid' | 'cancelled' | 'refunded' | 'transferred'
  basePrice: number
  serviceFee: number
  totalAmount: number
  createdAt: string
}

export interface ComplementaryService {
  id: string
  eventId: string | null
  category: 'hospedaje' | 'comida' | 'transporte' | 'wellness' | 'equipamiento' | 'experiencia' | 'otro'
  subcategory: string | null
  partnerName: string
  title: string
  description: string | null
  imageUrl: string | null
  priceFrom: number | null
  currency: string
  contactMethod: 'email' | 'whatsapp' | 'form'
  contactValue: string | null
  displayOrder: number
  active: boolean
}
