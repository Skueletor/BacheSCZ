import React from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native'
import { Compass, Flame, LocateFixed } from 'lucide-react-native'
import { colors, radii, shadows, spacing } from '../../theme'

interface MapControlsProps {
  onLocateUser: () => void
  onResetCenter: () => void
  onToggleHeatmap?: () => void
  isHeatmapActive?: boolean
  isLocating?: boolean
}

export function MapControls({
  onLocateUser,
  onResetCenter,
  onToggleHeatmap,
  isHeatmapActive = false,
  isLocating = false,
}: MapControlsProps) {
  return (
    <View style={styles.container}>
      {/* GPS Locate Button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ubicar mi posición actual"
        onPress={onLocateUser}
        disabled={isLocating}
        style={({ pressed }) => [
          styles.controlBtn,
          pressed && styles.pressed,
        ]}
      >
        {isLocating ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <LocateFixed size={20} color={colors.primary} />
        )}
      </Pressable>

      {/* Reset to Santa Cruz Center */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Centrar en Santa Cruz de la Sierra"
        onPress={onResetCenter}
        style={({ pressed }) => [styles.controlBtn, pressed && styles.pressed]}
      >
        <Compass size={20} color={colors.textSecondary} />
      </Pressable>

      {/* Heatmap / Density View Toggle */}
      {onToggleHeatmap && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isHeatmapActive ? 'Ver marcadores estándar' : 'Ver mapa de calor'}
          onPress={onToggleHeatmap}
          style={({ pressed }) => [
            styles.controlBtn,
            isHeatmapActive && styles.controlBtnActive,
            pressed && styles.pressed,
          ]}
        >
          <Flame
            size={20}
            color={isHeatmapActive ? colors.white : colors.textSecondary}
          />
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 110,
    gap: spacing.sm,
    zIndex: 50,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  controlBtnActive: {
    backgroundColor: colors.severityHigh,
    borderColor: colors.severityHigh,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
})
