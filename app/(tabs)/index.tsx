import { useRouter } from 'expo-router'
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Plus,
  ShieldAlert,
} from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  Button,
  Card,
  CategoryBadge,
  MetricCard,
  SectionTitle,
  SeverityBadge,
  StatusBadge,
} from '../../src/components/ui'
import { useReports, useReportStats } from '../../src/hooks/useReports'
import { colors, radii, shadows, spacing, typography } from '../../src/theme'

export default function HomeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const { data: reports = [], isLoading, refetch, isRefetching } = useReports()
  const { data: stats } = useReportStats()

  const recentReports = reports.slice(0, 3)

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, 16) + spacing.xs },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.cityLabel}>SANTA CRUZ DE LA SIERRA</Text>
        <Text style={styles.greetingTitle}>¡Hola, pariente!</Text>
        <Text style={styles.greetingSub}>
          Mantené transitables las calles y avenidas de tu barrio.
        </Text>
      </View>

      {/* Main Hero CTA */}
      <View style={styles.heroCard}>
        <View style={styles.heroContent}>
          <View style={styles.heroHeader}>
            <View style={styles.heroIconBox}>
              <Camera size={22} color={colors.white} />
            </View>
            <View style={styles.heroTextCol}>
              <Text style={styles.heroTitle}>¿Topaste un bache?</Text>
              <Text style={styles.heroSub}>
                Sacale una foto y marcalo en el mapa en menos de dos minutos.
              </Text>
            </View>
          </View>

          <Button
            label="Reportar bache"
            variant="primary"
            size="lg"
            icon={<Plus size={18} color={colors.white} strokeWidth={2.5} />}
            onPress={() => router.push('/reportar')}
            fullWidth
            style={styles.heroBtn}
          />
        </View>
      </View>

      {/* Live Activity Counters */}
      <View style={styles.sectionContainer}>
        <SectionTitle>Estado de reportes</SectionTitle>
        <View style={styles.metricsGrid}>
          <MetricCard
            value={stats?.total ?? reports.length}
            label="Reportados"
            icon={<Clock size={15} color={colors.textSecondary} />}
            tone="default"
          />
          <MetricCard
            value={stats?.inProgress ?? 0}
            label="En cuadrilla"
            icon={<ShieldAlert size={15} color={colors.severityHigh} />}
            tone="warning"
          />
          <MetricCard
            value={stats?.resolved ?? 0}
            label="Reparados"
            icon={<CheckCircle2 size={15} color={colors.severityLow} />}
            tone="success"
          />
        </View>
      </View>

      {/* Map Access Card */}
      <View style={styles.sectionContainer}>
        <SectionTitle
          actionLabel="Abrir mapa"
          onAction={() => router.push('/(tabs)/mapa')}
        >
          Mapa de la ciudad
        </SectionTitle>
        <Card
          variant="default"
          onPress={() => router.push('/(tabs)/mapa')}
          style={styles.mapBannerCard}
        >
          <View style={styles.mapBannerContent}>
            <View style={styles.mapBannerIcon}>
              <Compass size={24} color={colors.primary} />
            </View>
            <View style={styles.mapBannerText}>
              <Text style={styles.mapBannerTitle}>
                {reports.length} baches registrados en anillos y radiales
              </Text>
              <Text style={styles.mapBannerSub}>
                Revisá los puntos críticos y trabajos activos en Santa Cruz.
              </Text>
            </View>
          </View>
          <View style={styles.mapBannerFooter}>
            <Text style={styles.mapBannerLink}>Ver mapa interactivo</Text>
            <ArrowRight size={15} color={colors.primary} />
          </View>
        </Card>
      </View>

      {/* Recent Reports Feed */}
      <View style={styles.sectionContainer}>
        <SectionTitle
          actionLabel="Ver todos"
          onAction={() => router.push('/(tabs)/reportes')}
        >
          Últimos avisos
        </SectionTitle>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : recentReports.length === 0 ? (
          <Card variant="subtle" style={styles.emptyCard}>
            <Text style={styles.emptyText}>No hay baches reportados por ahora.</Text>
          </Card>
        ) : (
          <View style={styles.reportsList}>
            {recentReports.map((item) => (
              <Card
                key={item.id}
                variant="default"
                onPress={() => router.push(`/reporte/${item.id}`)}
                style={styles.reportItemCard}
              >
                <View style={styles.reportCardHeader}>
                  <View style={styles.badgeRow}>
                    <SeverityBadge severity={item.severity} size="sm" />
                    <CategoryBadge category={item.category} />
                  </View>
                  <StatusBadge status={item.status} size="sm" />
                </View>

                <Text style={styles.reportItemTitle} numberOfLines={1}>
                  {item.title}
                </Text>

                <View style={styles.reportItemLocation}>
                  <MapPin size={13} color={colors.textMuted} />
                  <Text style={styles.reportItemAddress} numberOfLines={1}>
                    {item.location.address}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
    gap: spacing.lg,
  },
  header: {
    paddingTop: spacing.xs,
    gap: 2,
  },
  cityLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.primary,
  },
  greetingTitle: {
    ...typography.display,
    color: colors.text,
  },
  greetingSub: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },

  // Hero Card
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  heroContent: {
    gap: spacing.md,
  },
  heroHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  heroIconBox: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextCol: {
    flex: 1,
    gap: 2,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
  },
  heroSub: {
    fontSize: 12,
    lineHeight: 17,
    color: '#94A3B8',
  },
  heroBtn: {
    backgroundColor: colors.primary,
  },

  // Section
  sectionContainer: {
    gap: spacing.xs + 3,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  // Map Banner
  mapBannerCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  mapBannerContent: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  mapBannerIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapBannerText: {
    flex: 1,
    gap: 2,
  },
  mapBannerTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  mapBannerSub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  mapBannerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
  },
  mapBannerLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },

  // Reports List
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyCard: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodySm,
    color: colors.textMuted,
  },
  reportsList: {
    gap: spacing.sm,
  },
  reportItemCard: {
    padding: spacing.md,
    gap: spacing.xs + 2,
  },
  reportCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  reportItemTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginTop: 2,
  },
  reportItemLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportItemAddress: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
})
