import React, { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import {
  ChevronRight,
  MapPin,
  Search,
  X,
} from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  Card,
  CategoryBadge,
  EmptyState,
  FilterChips,
  SeverityBadge,
  StatusBadge,
} from '../../src/components/ui'
import { useReports } from '../../src/hooks/useReports'
import { colors, radii, spacing, typography } from '../../src/theme'
import { Report } from '../../src/types/domain'

type FilterTab = 'ALL' | 'ACTIVE' | 'RESOLVED' | 'CRITICAL'

export default function ReportsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<FilterTab>('ALL')

  const { data: reports = [], isLoading, refetch, isRefetching } = useReports()

  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      if (selectedFilter === 'ACTIVE') {
        if (item.status === 'RESOLVED' || item.status === 'REJECTED') return false
      } else if (selectedFilter === 'RESOLVED') {
        if (item.status !== 'RESOLVED') return false
      } else if (selectedFilter === 'CRITICAL') {
        if (item.severity !== 'CRITICAL') return false
      }

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim()
        const matchTitle = item.title.toLowerCase().includes(query)
        const matchAddress = item.location.address.toLowerCase().includes(query)
        const matchDesc = item.description.toLowerCase().includes(query)
        if (!matchTitle && !matchAddress && !matchDesc) return false
      }

      return true
    })
  }, [reports, selectedFilter, searchQuery])

  const counts = useMemo(() => {
    return {
      all: reports.length,
      active: reports.filter((r) => !['RESOLVED', 'REJECTED'].includes(r.status)).length,
      resolved: reports.filter((r) => r.status === 'RESOLVED').length,
      critical: reports.filter((r) => r.severity === 'CRITICAL').length,
    }
  }, [reports])

  const filterOptions = [
    { id: 'ALL' as const, label: 'Todos', count: counts.all },
    { id: 'ACTIVE' as const, label: 'En arreglo', count: counts.active },
    { id: 'RESOLVED' as const, label: 'Reparados', count: counts.resolved },
    { id: 'CRITICAL' as const, label: 'Peligrosos', count: counts.critical },
  ]

  const renderItem = useCallback(({ item }: { item: Report }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString('es-BO', {
      day: 'numeric',
      month: 'short',
    })

    return (
      <Card
        variant="default"
        onPress={() => router.push(`/reporte/${item.id}`)}
        style={styles.reportCard}
      >
        <View style={styles.cardHeader}>
          <View style={styles.badgeGroup}>
            <SeverityBadge severity={item.severity} size="sm" />
            <CategoryBadge category={item.category} />
          </View>
          <Text style={styles.cardDate}>{formattedDate}</Text>
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.locationRow}>
          <MapPin size={13} color={colors.textMuted} />
          <Text style={styles.addressText} numberOfLines={1}>
            {item.location.address}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <StatusBadge status={item.status} size="sm" />
          <View style={styles.viewDetailLink}>
            <Text style={styles.viewDetailText}>Ver avance</Text>
            <ChevronRight size={14} color={colors.primary} />
          </View>
        </View>
      </Card>
    )
  }, [router])

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Screen Title */}
      <View style={styles.headerContainer}>
        <Text style={styles.eyebrow}>HISTORIAL</Text>
        <Text style={styles.title}>Tus reportes</Text>
        <Text style={styles.subtitle}>
          Seguimiento de baches y pozos reportados en tu zona.
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={16} color={colors.textMuted} />
          <TextInput
            placeholder="Buscar por avenida, radial o barrio..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            clearButtonMode="while-editing"
          />
          {searchQuery !== '' && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <X size={15} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Filter Chips */}
        <View style={styles.chipsWrapper}>
          <FilterChips
            options={filterOptions}
            selectedId={selectedFilter}
            onSelect={setSelectedFilter}
          />
        </View>
      </View>

      {/* Reports FlatList */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title={
                searchQuery
                  ? 'Sin resultados para la búsqueda'
                  : selectedFilter !== 'ALL'
                    ? 'No hay reportes en este filtro'
                    : 'Sin baches reportados'
              }
              description={
                searchQuery
                  ? 'Probá buscando con el nombre de la calle, avenida o anillo.'
                  : 'Cuando topés un bache en la calle, repórtalo para hacerle seguimiento.'
              }
              actionLabel={searchQuery || selectedFilter !== 'ALL' ? 'Limpiar filtros' : 'Reportar bache'}
              onAction={() => {
                if (searchQuery || selectedFilter !== 'ALL') {
                  setSearchQuery('')
                  setSelectedFilter('ALL')
                } else {
                  router.push('/reportar')
                }
              }}
            />
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs + 2,
    gap: 2,
  },
  eyebrow: {
    ...typography.label,
    color: colors.primary,
    fontSize: 10,
  },
  title: {
    ...typography.display,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.xs + 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 40,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    paddingVertical: 0,
  },
  chipsWrapper: {
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
    gap: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportCard: {
    padding: spacing.md,
    gap: spacing.xs + 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  cardDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
  cardTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.xs + 3,
    marginTop: 2,
  },
  viewDetailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
})
