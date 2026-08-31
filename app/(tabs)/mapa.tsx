import React, { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Flame } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  LeafletMap,
  MapBottomSheet,
  MapControls,
  MapMarkerItem,
} from '../../src/components/map'
import { FilterChips } from '../../src/components/ui'
import { useReports, useUserLocation } from '../../src/hooks/useReports'
import { colors, radii, shadows, spacing, typography, SANTA_CRUZ_DEFAULT_REGION } from '../../src/theme'

type MapFilter = 'ALL' | 'CRITICAL' | 'IN_PROGRESS' | 'SCHEDULED' | 'RESOLVED'

export default function MapScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<MapFilter>('ALL')
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number; zoom?: number } | null>(null)

  const { data: reports = [] } = useReports()
  const { userLocation, isLocating, requestLocation } = useUserLocation()

  // Filtered reports for the map
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (selectedFilter === 'CRITICAL') return r.severity === 'CRITICAL'
      if (selectedFilter === 'IN_PROGRESS') return r.status === 'IN_PROGRESS'
      if (selectedFilter === 'SCHEDULED') return r.status === 'SCHEDULED' || r.status === 'INSPECTION'
      if (selectedFilter === 'RESOLVED') return r.status === 'RESOLVED'
      return true
    })
  }, [reports, selectedFilter])

  // Convert reports to map markers
  const markers: MapMarkerItem[] = useMemo(() => {
    return filteredReports.map((r) => ({
      id: r.id,
      latitude: r.location.latitude,
      longitude: r.location.longitude,
      title: r.title,
      address: r.location.address,
      severity: r.severity,
      category: r.category,
      status: r.status,
    }))
  }, [filteredReports])

  const selectedReport = useMemo(() => {
    if (!selectedReportId) return null
    return reports.find((r) => r.id === selectedReportId) || null
  }, [reports, selectedReportId])

  const handleMarkerPress = useCallback((reportId: string) => {
    setSelectedReportId(reportId)
  }, [])

  const handleMapPress = useCallback(() => {
    setSelectedReportId(null)
  }, [])

  const handleLocateUser = useCallback(async () => {
    const loc = await requestLocation()
    if (loc) {
      setMapCenter({
        latitude: loc.latitude,
        longitude: loc.longitude,
        zoom: 16,
      })
    } else {
      Alert.alert(
        'Ubicación no disponible',
        'No pudimos acceder a tu GPS. Podés buscar manualmente en el mapa o centrarte en Santa Cruz.',
        [{ text: 'Entendido' }]
      )
    }
  }, [requestLocation])

  const handleResetCenter = useCallback(() => {
    setMapCenter({
      latitude: SANTA_CRUZ_DEFAULT_REGION.latitude,
      longitude: SANTA_CRUZ_DEFAULT_REGION.longitude,
      zoom: 13,
    })
  }, [])

  const filterOptions = [
    { id: 'ALL' as const, label: 'Todos', count: reports.length },
    {
      id: 'CRITICAL' as const,
      label: 'Peligrosos',
      count: reports.filter((r) => r.severity === 'CRITICAL').length,
    },
    {
      id: 'IN_PROGRESS' as const,
      label: 'En arreglo',
      count: reports.filter((r) => r.status === 'IN_PROGRESS').length,
    },
    {
      id: 'SCHEDULED' as const,
      label: 'Programados',
      count: reports.filter((r) => ['SCHEDULED', 'INSPECTION'].includes(r.status)).length,
    },
    {
      id: 'RESOLVED' as const,
      label: 'Reparados',
      count: reports.filter((r) => r.status === 'RESOLVED').length,
    },
  ]

  return (
    <View style={styles.screen}>
      {/* Embedded Clean Leaflet Map */}
      <LeafletMap
        markers={markers}
        userLocation={userLocation}
        selectedMarkerId={selectedReportId}
        showHeatmap={showHeatmap}
        centerCoordinate={mapCenter}
        onMarkerPress={handleMarkerPress}
        onMapPress={handleMapPress}
        style={styles.mapView}
      />

      {/* Floating Top Header */}
      <View
        style={[
          styles.floatingHeader,
          { paddingTop: Math.max(insets.top, 16) + spacing.xs },
        ]}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerTitleRow}>
            <View style={styles.titleCol}>
              <Text style={styles.headerTitle}>Baches en Santa Cruz</Text>
              <Text style={styles.headerSubtitle}>
                {markers.length} puntos viales registrados
              </Text>
            </View>
            {showHeatmap && (
              <View style={styles.heatmapIndicator}>
                <Flame size={12} color={colors.white} />
                <Text style={styles.heatmapIndicatorText}>Densidad</Text>
              </View>
            )}
          </View>

          {/* Filter Chips */}
          <View style={styles.filterRow}>
            <FilterChips
              options={filterOptions}
              selectedId={selectedFilter}
              onSelect={setSelectedFilter}
            />
          </View>
        </View>
      </View>

      {/* Floating Right Map Controls (GPS, Recenter, Heatmap) */}
      <MapControls
        onLocateUser={handleLocateUser}
        onResetCenter={handleResetCenter}
        onToggleHeatmap={() => setShowHeatmap((prev) => !prev)}
        isHeatmapActive={showHeatmap}
        isLocating={isLocating}
      />

      {/* Bottom Sheet Card on Pin Press */}
      <MapBottomSheet
        report={selectedReport}
        onClose={() => setSelectedReportId(null)}
        onViewDetail={(id) => router.push(`/reporte/${id}`)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative',
  },
  mapView: {
    flex: 1,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 40,
  },
  headerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    ...shadows.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleCol: {
    gap: 1,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  heatmapIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    backgroundColor: colors.severityHigh,
    borderRadius: radii.full,
  },
  heatmapIndicatorText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.white,
  },
  filterRow: {
    marginTop: 2,
  },
})
