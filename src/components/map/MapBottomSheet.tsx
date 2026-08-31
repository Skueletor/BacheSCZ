import React from 'react'
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { ArrowRight, MapPin, X } from 'lucide-react-native'
import { colors, radii, shadows, spacing, typography } from '../../theme'
import { Report } from '../../types/domain'
import { Button, CategoryBadge, SeverityBadge, StatusBadge } from '../ui'

interface MapBottomSheetProps {
  report: Report | null
  onClose: () => void
  onViewDetail: (reportId: string) => void
}

export function MapBottomSheet({ report, onClose, onViewDetail }: MapBottomSheetProps) {
  if (!report) return null

  const hasImage = report.images && report.images.length > 0 && report.images[0].uri

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Top Header with Badges & Close Button */}
        <View style={styles.topRow}>
          <View style={styles.badgesRow}>
            <SeverityBadge severity={report.severity} size="sm" />
            <CategoryBadge category={report.category} />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar vista previa"
            onPress={onClose}
            style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
            hitSlop={8}
          >
            <X size={16} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Content Body */}
        <View style={styles.bodyRow}>
          {hasImage && (
            <Image
              source={{ uri: report.images[0].uri }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          )}
          <View style={styles.infoCol}>
            <Text style={styles.title} numberOfLines={2}>
              {report.title}
            </Text>
            <View style={styles.addressRow}>
              <MapPin size={13} color={colors.textMuted} />
              <Text style={styles.addressText} numberOfLines={1}>
                {report.location.address}
              </Text>
            </View>
            <View style={styles.statusWrapper}>
              <StatusBadge status={report.status} size="sm" />
            </View>
          </View>
        </View>

        {/* Action Button */}
        <Button
          label="Ver reporte completo"
          variant="primary"
          size="md"
          rightIcon={<ArrowRight size={16} color={colors.white} />}
          onPress={() => onViewDetail(report.id)}
          fullWidth
          style={styles.actionBtn}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSubtle,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  statusWrapper: {
    marginTop: 2,
  },
  actionBtn: {
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
})
