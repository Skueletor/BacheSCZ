import React, { useEffect, useState } from 'react'
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import {
  Award,
  CheckCircle2,
  Info,
  MapPin,
  ShieldCheck,
  User,
} from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, Card, MetricCard, SectionTitle } from '../../src/components/ui'
import { useReportStats } from '../../src/hooks/useReports'
import { sessionService } from '../../src/services/session'
import { colors, radii, spacing, typography } from '../../src/theme'
import { User as UserType } from '../../src/types/domain'

export default function ProfileScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { data: stats } = useReportStats()
  const [activeUser, setActiveUser] = useState<UserType | null>(null)

  useEffect(() => {
    sessionService.getActiveUser().then(setActiveUser)
  }, [])

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas salir de la aplicación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await sessionService.logout()
            router.replace('/login')
          },
        },
      ]
    )
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, 16) + spacing.xs },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Profile Identity */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarWrapper}>
          <User size={28} color={colors.primary} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{activeUser?.name || 'Vecino cruceño'}</Text>
          <View style={styles.zoneRow}>
            <MapPin size={13} color={colors.primary} />
            <Text style={styles.zoneText}>
              {activeUser?.neighborhood ? `Santa Cruz • ${activeUser.neighborhood}` : 'Santa Cruz de la Sierra'}
            </Text>
          </View>
          <View style={styles.verifiedPill}>
            <ShieldCheck size={12} color={colors.severityLowText} />
            <Text style={styles.verifiedText}>
              {activeUser?.role === 'ADMIN' ? 'Administrador de Alcaldía' : 'Aporte ciudadano activo'}
            </Text>
          </View>
        </View>
      </View>

      {/* Impact Metrics */}
      <View style={styles.section}>
        <SectionTitle>Tus aportes</SectionTitle>
        <View style={styles.statsGrid}>
          <MetricCard
            value={stats?.total ?? 0}
            label="Reportados"
            icon={<Award size={15} color={colors.primary} />}
            tone="primary"
          />
          <MetricCard
            value={stats?.resolved ?? 0}
            label="Reparados"
            icon={<CheckCircle2 size={15} color={colors.severityLow} />}
            tone="success"
          />
        </View>
      </View>

      {/* About the platform */}
      <View style={styles.section}>
        <SectionTitle>Sobre BacheSCZ</SectionTitle>
        <Card variant="default" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Info size={18} color={colors.primary} />
            <View style={styles.infoTextCol}>
              <Text style={styles.infoTitle}>Propósito</Text>
              <Text style={styles.infoDesc}>
                Herramienta ciudadana para ubicar baches y pozos en Santa Cruz de la Sierra, ayudando a priorizar los trabajos en la calzada.
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Botón de Cerrar Sesión */}
      <Button
        label="Cerrar sesión"
        variant="outline"
        size="md"
        onPress={handleLogout}
        style={styles.logoutBtn}
      />

      {/* App Version Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>BacheSCZ v1.0.0</Text>
        <Text style={styles.footerSubText}>Santa Cruz de la Sierra</Text>
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  avatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  userName: {
    ...typography.h1,
    color: colors.text,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  zoneText: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.severityLowBg,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.severityLowText,
  },
  section: {
    gap: spacing.xs + 3,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  infoCard: {
    padding: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  infoTextCol: {
    flex: 1,
    gap: 2,
  },
  infoTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  infoDesc: {
    ...typography.bodySm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  logoutBtn: {
    borderColor: colors.danger,
    marginTop: spacing.md,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 2,
  },
  footerText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  footerSubText: {
    ...typography.caption,
    color: colors.textMuted,
  },
})
