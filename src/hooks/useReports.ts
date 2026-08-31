import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as Location from 'expo-location'
import { useState, useCallback } from 'react'
import { reportRepository } from '../services/reports'
import { DraftReport, GeoLocation, ReportFilter } from '../types/domain'

export const QUERY_KEYS = {
  reports: (filter?: ReportFilter) => ['reports', filter] as const,
  report: (id: string) => ['report', id] as const,
  stats: ['report_stats'] as const,
}

/**
 * Hook to retrieve reports list with optional filtering
 */
export function useReports(filter?: ReportFilter) {
  return useQuery({
    queryKey: QUERY_KEYS.reports(filter),
    queryFn: () => reportRepository.getReports(filter),
    staleTime: 1000 * 30, // 30 seconds
  })
}

/**
 * Hook to retrieve a single report by ID
 */
export function useReport(id?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.report(id || ''),
    queryFn: () => (id ? reportRepository.getReportById(id) : null),
    enabled: Boolean(id),
  })
}

/**
 * Hook to retrieve aggregate report statistics
 */
export function useReportStats() {
  return useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: () => reportRepository.getStats(),
  })
}

/**
 * Hook for creating a report, automatically invalidating report lists & stats
 */
export function useCreateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (draft: DraftReport) => reportRepository.createReport(draft),
    onSuccess: (newReport) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats })
      queryClient.setQueryData(QUERY_KEYS.report(newReport.id), newReport)
    },
  })
}

export interface UserLocationState {
  userLocation: GeoLocation | null
  isLocating: boolean
  hasPermission: boolean | null
  locationError: string | null
  requestLocation: () => Promise<GeoLocation | null>
}

/**
 * Robust User Location Hook
 * Manages permissions, GPS retrieval, reverse geocoding with graceful error handling.
 */
export function useUserLocation(): UserLocationState {
  const [userLocation, setUserLocation] = useState<GeoLocation | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  const requestLocation = useCallback(async (): Promise<GeoLocation | null> => {
    setIsLocating(true)
    setLocationError(null)

    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setHasPermission(false)
        setLocationError('Permiso de ubicación no concedido. Puedes seleccionar el punto en el mapa.')
        setIsLocating(false)
        return null
      }

      setHasPermission(true)

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      const latitude = position.coords.latitude
      const longitude = position.coords.longitude
      const accuracy = position.coords.accuracy ?? null

      let formattedAddress = 'Ubicación GPS'

      try {
        const reverse = await Location.reverseGeocodeAsync({ latitude, longitude })
        if (reverse && reverse.length > 0) {
          const item = reverse[0]
          const street = item.street || item.name || ''
          const district = item.subregion || item.city || item.district || 'Santa Cruz'
          if (street) {
            formattedAddress = `${street}${district ? `, ${district}` : ''}`
          } else if (item.formattedAddress) {
            formattedAddress = item.formattedAddress
          }
        }
      } catch {
        formattedAddress = `Coord: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (SCZ)`
      }

      const location: GeoLocation = {
        latitude,
        longitude,
        accuracy,
        address: formattedAddress,
      }

      setUserLocation(location)
      setIsLocating(false)
      return location
    } catch (err) {
      console.warn('[useUserLocation] Location lookup failed:', err)
      setHasPermission(false)
      setLocationError('No pudimos acceder al GPS. Verifica que esté activo en tu dispositivo.')
      setIsLocating(false)
      return null
    }
  }, [])

  return {
    userLocation,
    isLocating,
    hasPermission,
    locationError,
    requestLocation,
  }
}
