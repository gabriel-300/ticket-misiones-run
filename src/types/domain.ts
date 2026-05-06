export type UserRole = 'buyer' | 'organizer' | 'super_admin'

export interface Organization {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  websiteUrl: string | null
  contactEmail: string
  phone: string | null
  ownerId: string | null
  commissionRate: number
  status: 'pending' | 'active' | 'suspended'
  createdAt: string
}

export interface UserProfile {
  id: string
  role: UserRole
  firstName: string
  lastName: string
  dni: string
  dniType: 'DNI' | 'PASAPORTE' | 'CI'
  birthDate: string
  gender: 'M' | 'F' | 'X'
  phone: string
  email?: string
  aptoMedicoStatus: 'pendiente' | 'aprobado' | 'rechazado' | null
  aptoMedicoUrl: string | null
  aptoMedicoIssuedAt: string | null
}

export interface Event {
  id: string
  slug: string
  name: string
  shortDescription: string | null
  description: string | null
  type: string
  organizationId: string | null
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
  lat?: number
  lng?: number
}

export interface TicketType {
  id: string
  eventId: string
  name: string
  distanceKm: number | null
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
  ticketTypeId: string | null
  name: string
  priceArs: number
  startsAt: string
  endsAt: string
  active: boolean
  sortOrder: number
}

export interface Registration {
  id: string
  eventId: string
  ticketTypeId: string
  buyerId: string
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
  organizationId: string | null
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
