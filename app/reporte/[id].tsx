import React, { useState, useEffect } from 'react'
import { Alert, Modal } from 'react-native'
import { sessionService } from '../../src/services/session'
import { reportRepository } from '../../src/services/reports'
import { User as UserType, ReportStatus } from '../../src/types/domain'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LeafletMap } from '../../src/components/map'
import {
  Card,
  Button,
  CategoryBadge,
  EmptyState,
  ScreenHeader,
  SeverityBadge,
  StatusBadge,
  TimelineView,
  Input,
} from '../../src/components/ui'
import { useReport } from '../../src/hooks/useReports'
import { colors, radii, spacing, statusConfig, typography } from '../../src/theme'

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const { data: report, isLoading, refetch } = useReport(id)
  
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>('RECEIVED')
  const [noteText, setNoteText] = useState('')
  const [isSavingStatus, setIsSavingStatus] = useState(false)

  useEffect(() => {
    sessionService.getActiveUser().then((user) => {
      console.log("[ReportDetailScreen] Usuario cargado:", user.name, "Rol:", user.role);
      setCurrentUser(user);
    });
  }, [])

  // Sync selected status when modal opens or report changes
  useEffect(() => {
    if (report) {
      setSelectedStatus(report.status)
    }
  }, [report, isStatusModalVisible])

  const handleUpdateStatusSubmit = async () => {
    if (!report) return
    try {
      setIsSavingStatus(true)
      await reportRepository.updateReportStatus(report.id, selectedStatus, noteText)
      await refetch()
      setIsStatusModalVisible(false)
      setNoteText('')
      Alert.alert('Éxito', 'El avance de la reparación se guardó correctamente.')
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la actualización de estado.')
    } finally {
      setIsSavingStatus(false)
    }
  }

  const STATUS_OPTIONS: { value: ReportStatus; label: string; description: string; color: string }[] = (
    Object.keys(statusConfig) as ReportStatus[]
  ).map((key) => ({
    value: key,
    label: statusConfig[key].label,
    description: statusConfig[key].description,
    color: statusConfig[key].color,
  }))

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando reporte...</Text>
      </View>
    )
  }

  if (!report) {
    return (
      <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
        <ScreenHeader title="Reporte no encontrado" onBack={() => router.back()} />
        <EmptyState
          title="El reporte no existe"
          description="Verificá el código de seguimiento o volvé a la lista."
          actionLabel="Volver al inicio"
          onAction={() => router.replace('/')}
        />
      </View>
    )
  }

  const createdDate = new Date(report.createdAt).toLocaleDateString('es-BO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const hasImage = report.images && report.images.length > 0 && report.images[0].uri

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Top Header */}
      <View style={styles.headerBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <ArrowLeft size={18} color={colors.text} />
        </Pressable>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerEyebrow}>SEGUIMIENTO DE BACHE</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {report.id}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <Card variant="default" style={styles.heroCard}>
          <View style={styles.heroBadgesRow}>
            <StatusBadge status={report.status} size="md" />
            <SeverityBadge severity={report.severity} size="md" />
            <CategoryBadge category={report.category} />
          </View>

          <Text style={styles.reportTitle}>{report.title}</Text>

          <View style={styles.dateRow}>
            <Calendar size={13} color={colors.textMuted} />
            <Text style={styles.dateText}>Registrado el {createdDate}</Text>
          </View>
        </Card>

        {/* Attached Photo */}
        {hasImage && (
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: report.images[0].uri }}
              style={styles.photoImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Location & Clean Mini Map */}
        <Card variant="default" style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Ubicación</Text>
          <View style={styles.addressRow}>
            <MapPin size={15} color={colors.primary} />
            <Text style={styles.addressText}>{report.location.address}</Text>
          </View>

          <View style={styles.mapSnippetWrapper}>
            <LeafletMap
              markers={[
                {
                  id: report.id,
                  latitude: report.location.latitude,
                  longitude: report.location.longitude,
                  title: report.title,
                  address: report.location.address,
                  severity: report.severity,
                  category: report.category,
                  status: report.status,
                },
              ]}
              centerCoordinate={{
                latitude: report.location.latitude,
                longitude: report.location.longitude,
                zoom: 16,
              }}
              style={styles.miniMap}
            />
          </View>
        </Card>

        {/* Problem Description */}
        {report.description ? (
          <Card variant="default" style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Detalle reportado</Text>
            <Text style={styles.descriptionBody}>{report.description}</Text>
          </Card>
        ) : null}

        {/* Timeline Tracking */}
        <Card variant="default" style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Avance de la reparación</Text>
          <TimelineView history={report.history} currentStatus={report.status} />
        </Card>

        {/* Admin Management Panel */}
        {currentUser?.role === 'ADMIN' && (
          <Card variant="default" style={[styles.sectionCard, styles.adminPanelCard]}>
            <View style={styles.adminPanelHeader}>
              <ShieldCheck size={20} color={colors.danger} />
              <View style={styles.adminPanelTitleCol}>
                <Text style={styles.adminPanelTitle}>Panel de Gestión (Alcaldía)</Text>
                <Text style={styles.adminPanelSub}>Control exclusivo para funcionarios municipales</Text>
              </View>
            </View>
            <Button
              label="Actualizar Estado de Avance"
              variant="primary"
              size="md"
              icon={<RotateCcw size={16} color={colors.white} />}
              onPress={() => setIsStatusModalVisible(true)}
              fullWidth
            />
          </Card>
        )}

        {/* Fullscreen Status Management Modal */}
        <Modal
          visible={isStatusModalVisible}
          animationType="slide"
          onRequestClose={() => setIsStatusModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={[styles.modalHeader, { paddingTop: Math.max(insets.top, 16) }]}>
              <Pressable accessibilityRole="button" accessibilityLabel="Cerrar modal" style={styles.modalCloseBtn} onPress={() => setIsStatusModalVisible(false)}>
                <ArrowLeft size={20} color={colors.text} />
              </Pressable>
              <Text style={styles.modalHeaderTitle}>Gestión de Avance</Text>
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.modalLabel}>Selecciona el nuevo estado:</Text>
              <View style={styles.statusGrid}>
                {STATUS_OPTIONS.map((opt) => {
                  const isSelected = selectedStatus === opt.value
                  return (
                    <Pressable
                      key={opt.value}
                      style={[
                        styles.statusOptionCard,
                        isSelected && { borderColor: opt.color, backgroundColor: opt.color + '0C' }
                      ]}
                      onPress={() => setSelectedStatus(opt.value)}
                    >
                      <View style={styles.statusOptionHeader}>
                        <View style={[styles.statusDot, { backgroundColor: opt.color }]} />
                        <Text style={[styles.statusOptionLabel, isSelected && { color: opt.color, fontWeight: '700' }]}>
                          {opt.label}
                        </Text>
                      </View>
                      <Text style={styles.statusOptionDesc}>{opt.description}</Text>
                    </Pressable>
                  )
                })}
              </View>

              <View style={styles.noteInputSection}>
                <Input
                  label="Nota o descripción del avance"
                  placeholder="Ej: Se envió equipo y maquinaria pesada para relleno."
                  value={noteText}
                  onChangeText={setNoteText}
                  helperText="Indica detalles técnicos para mantener informados a los ciudadanos."
                  multiline
                  numberOfLines={4}
                  style={styles.noteInputText}
                />
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={[styles.modalFooter, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
              <Button
                label={isSavingStatus ? "Guardando..." : "Guardar cambios"}
                variant="primary"
                size="lg"
                loading={isSavingStatus}
                onPress={handleUpdateStatusSubmit}
                fullWidth
              />
            </View>
          </View>
        </Modal>

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <ShieldCheck size={15} color={colors.primary} />
          <Text style={styles.footerNoteText}>
            Reporte registrado en la red ciudadana de Santa Cruz.
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 3,
    gap: spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleGroup: {
    flex: 1,
    gap: 1,
  },
  headerEyebrow: {
    ...typography.label,
    color: colors.primary,
    fontSize: 10,
  },
  headerTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
    gap: spacing.md,
  },
  heroCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  heroBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  reportTitle: {
    ...typography.h2,
    color: colors.text,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  photoContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoImage: {
    width: '100%',
    height: 200,
  },
  sectionCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionHeading: {
    ...typography.subtitle,
    color: colors.text,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addressText: {
    ...typography.bodySm,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  mapSnippetWrapper: {
    height: 150,
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  miniMap: {
    flex: 1,
  },
  descriptionBody: {
    ...typography.bodySm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  footerNoteText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  pressed: {
    opacity: 0.8,
  },
  adminPanelCard: {
    borderColor: colors.dangerBg,
    borderWidth: 1,
    backgroundColor: '#FFF5F5',
  },
  adminPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  adminPanelTitleCol: {
    flex: 1,
    gap: 1,
  },
  adminPanelTitle: {
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.danger,
  },
  adminPanelSub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    zIndex: 10,
  },
  modalCloseBtn: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  modalHeaderTitle: {
    ...typography.h2,
    color: colors.text,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalLabel: {
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statusGrid: {
    gap: spacing.sm,
  },
  statusOptionCard: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.xl,
  },
  statusOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusOptionLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  statusOptionDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingLeft: 14,
  },
  noteInputSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.huge,
  },
  noteInputText: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
})
