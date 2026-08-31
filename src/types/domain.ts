export type ReportStatus =
  | 'RECEIVED'
  | 'UNDER_REVIEW'
  | 'INSPECTION'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED'

export type ReportSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type ReportCategory = 'POTHOLE' | 'ROAD_DAMAGE' | 'SINKING' | 'CRACK' | 'OTHER'

export interface GeoLocation {
  latitude: number
  longitude: number
  address: string
  accuracy?: number | null
}

export interface ReportImage {
  id: string
  uri: string
  createdAt: string
}

export interface ReportHistory {
  status: ReportStatus
  note: string
  createdAt: string
}

export interface SuggestedRepair {
  label: string
  days: number
}

export interface User {
  id: string
  name: string
  email: string
  neighborhood: string
  role: 'USER' | 'ADMIN'
  avatarUri?: string
}

export interface Report {
  id: string
  userId: string
  title: string
  description: string
  location: GeoLocation
  severity: ReportSeverity
  category: ReportCategory
  status: ReportStatus
  images: ReportImage[]
  createdAt: string
  updatedAt: string
  history: ReportHistory[]
  suggestedRepair?: SuggestedRepair
}

export type DraftReport = {
  title?: string
  description: string
  location: GeoLocation
  severity: ReportSeverity
  category: ReportCategory
  imageUri?: string
}

export interface ReportFilter {
  status?: ReportStatus | 'ALL'
  severity?: ReportSeverity | 'ALL'
  search?: string
}

export interface ReportStats {
  total: number
  received: number
  inProgress: number
  resolved: number
  critical: number
}
