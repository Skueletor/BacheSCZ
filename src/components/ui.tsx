import React from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Search,
  ShieldAlert,
} from 'lucide-react-native'
import {
  categoryConfig,
  colors,
  radii,
  severityConfig,
  shadows,
  spacing,
  statusConfig,
  typography,
} from '../theme'
import { ReportCategory, ReportHistory, ReportSeverity, ReportStatus } from '../types/domain'

// ==========================================
// 1. BUTTON COMPONENT
// ==========================================
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  accessibilityLabel?: string
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  rightIcon,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const isInteractive = !disabled && !loading

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled: !isInteractive }}
      disabled={!isInteractive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonBase,
        styles[`btn_${variant}`],
        styles[`btnSize_${size}`],
        fullWidth && styles.fullWidth,
        disabled && styles.btnDisabled,
        pressed && isInteractive && styles.btnPressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? colors.white : colors.primary}
        />
      ) : (
        <View style={styles.buttonInner}>
          {icon && <View style={styles.btnIconLeft}>{icon}</View>}
          <Text
            style={[
              styles.btnTextBase,
              styles[`btnText_${variant}`],
              styles[`btnTextSize_${size}`],
              disabled && styles.btnTextDisabled,
              textStyle,
            ]}
          >
            {label}
          </Text>
          {rightIcon && <View style={styles.btnIconRight}>{rightIcon}</View>}
        </View>
      )}
    </Pressable>
  )
}

// ==========================================
// 2. CARD COMPONENT
// ==========================================
interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'outlined' | 'subtle' | 'primary'
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
}

export function Card({
  children,
  variant = 'default',
  onPress,
  style,
  accessibilityLabel,
}: CardProps) {
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [
          styles.cardBase,
          styles[`card_${variant}`],
          pressed && styles.cardPressed,
          style,
        ]}
      >
        {children}
      </Pressable>
    )
  }

  return (
    <View style={[styles.cardBase, styles[`card_${variant}`], style]}>
      {children}
    </View>
  )
}

// ==========================================
// 3. BADGES: STATUS, SEVERITY, CATEGORY
// ==========================================
export function StatusBadge({ status, size = 'md' }: { status: ReportStatus; size?: 'sm' | 'md' }) {
  const config = statusConfig[status] || statusConfig.RECEIVED
  const isSm = size === 'sm'

  return (
    <View style={[styles.badgeBase, { backgroundColor: config.bg }, isSm && styles.badgeSm]}>
      <View style={[styles.badgeDot, { backgroundColor: config.color }]} />
      <Text style={[styles.badgeText, { color: config.text }, isSm && styles.badgeTextSm]}>
        {config.label}
      </Text>
    </View>
  )
}

export function SeverityBadge({
  severity,
  size = 'md',
  showIcon = true,
}: {
  severity: ReportSeverity
  size?: 'sm' | 'md'
  showIcon?: boolean
}) {
  const config = severityConfig[severity] || severityConfig.MEDIUM
  const isSm = size === 'sm'

  return (
    <View style={[styles.badgeBase, { backgroundColor: config.bg }, isSm && styles.badgeSm]}>
      {showIcon && (
        <View style={styles.badgeIconWrapper}>
          {severity === 'CRITICAL' ? (
            <ShieldAlert size={isSm ? 11 : 13} color={config.color} />
          ) : (
            <AlertTriangle size={isSm ? 11 : 13} color={config.color} />
          )}
        </View>
      )}
      <Text style={[styles.badgeText, { color: config.text }, isSm && styles.badgeTextSm]}>
        {config.label}
      </Text>
    </View>
  )
}

export function CategoryBadge({ category }: { category: ReportCategory }) {
  const config = categoryConfig[category] || categoryConfig.POTHOLE
  return (
    <View style={[styles.badgeBase, styles.badgeNeutral]}>
      <Text style={[styles.badgeText, styles.badgeTextNeutral]}>{config.label}</Text>
    </View>
  )
}

// ==========================================
// 4. SCREEN HEADER
// ==========================================
interface ScreenHeaderProps {
  title: string
  subtitle?: string
  eyebrow?: string
  onBack?: () => void
  rightAction?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

export function ScreenHeader({
  title,
  subtitle,
  eyebrow,
  onBack,
  rightAction,
  style,
}: ScreenHeaderProps) {
  return (
    <View style={[styles.screenHeader, style]}>
      <View style={styles.screenHeaderRow}>
        {onBack && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver atrás"
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.btnPressed]}
          >
            <ArrowLeft size={20} color={colors.text} />
          </Pressable>
        )}
        <View style={styles.screenHeaderTitleContainer}>
          {eyebrow && <Text style={styles.screenHeaderEyebrow}>{eyebrow}</Text>}
          <Text style={styles.screenHeaderTitle}>{title}</Text>
          {subtitle && <Text style={styles.screenHeaderSubtitle}>{subtitle}</Text>}
        </View>
        {rightAction && <View style={styles.screenHeaderRight}>{rightAction}</View>}
      </View>
    </View>
  )
}

// ==========================================
// 5. SECTION TITLE
// ==========================================
export function SectionTitle({
  children,
  actionLabel,
  onAction,
}: {
  children: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitleText}>{children}</Text>
      {actionLabel && onAction && (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionActionText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  )
}

// ==========================================
// 6. METRIC CARD / STAT
// ==========================================
export function MetricCard({
  value,
  label,
  icon,
  tone = 'default',
}: {
  value: string | number
  label: string
  icon?: React.ReactNode
  tone?: 'default' | 'primary' | 'warning' | 'success' | 'critical'
}) {
  const toneBg = {
    default: colors.surfaceSubtle,
    primary: colors.primaryLight,
    warning: colors.severityMediumBg,
    success: colors.severityLowBg,
    critical: colors.severityCriticalBg,
  }[tone]

  const toneText = {
    default: colors.text,
    primary: colors.primary,
    warning: colors.severityMediumText,
    success: colors.severityLowText,
    critical: colors.severityCriticalText,
  }[tone]

  return (
    <View style={[styles.metricCard, { backgroundColor: toneBg }]}>
      <View style={styles.metricHeader}>
        <Text style={[styles.metricValue, { color: toneText }]}>{value}</Text>
        {icon && <View style={styles.metricIcon}>{icon}</View>}
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  )
}

// ==========================================
// 7. TIMELINE VIEW
// ==========================================
export function TimelineView({ history, currentStatus }: { history: ReportHistory[]; currentStatus: ReportStatus }) {
  const steps: ReportStatus[] = ['RECEIVED', 'UNDER_REVIEW', 'INSPECTION', 'SCHEDULED', 'IN_PROGRESS', 'RESOLVED']
  const currentConfig = statusConfig[currentStatus] || statusConfig.RECEIVED
  const currentStepIndex = currentConfig.stepIndex

  return (
    <View style={styles.timelineContainer}>
      {steps.map((stepKey, idx) => {
        const config = statusConfig[stepKey]
        const isCompleted = currentStepIndex >= idx
        const isCurrent = currentStepIndex === idx
        const isLast = idx === steps.length - 1

        const historyItem = history.find((h) => h.status === stepKey)

        return (
          <View key={stepKey} style={styles.timelineRow}>
            <View style={styles.timelineGutter}>
              <View
                style={[
                  styles.timelineNode,
                  isCompleted && { backgroundColor: colors.primary, borderColor: colors.primary },
                  isCurrent && styles.timelineNodeCurrent,
                  !isCompleted && styles.timelineNodePending,
                ]}
              >
                {isCompleted ? (
                  <CheckCircle2 size={13} color={colors.white} />
                ) : (
                  <View style={styles.timelineDotPending} />
                )}
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.timelineLine,
                    isCompleted && currentStepIndex > idx && styles.timelineLineActive,
                  ]}
                />
              )}
            </View>

            <View style={styles.timelineBody}>
              <View style={styles.timelineHeaderRow}>
                <Text
                  style={[
                    styles.timelineStepLabel,
                    isCurrent && styles.timelineStepLabelCurrent,
                    !isCompleted && styles.timelineStepLabelPending,
                  ]}
                >
                  {config.label}
                </Text>
                {historyItem && (
                  <Text style={styles.timelineDate}>
                    {new Date(historyItem.createdAt).toLocaleDateString('es-BO', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.timelineDescription,
                  !isCompleted && styles.timelineDescriptionPending,
                ]}
              >
                {historyItem ? historyItem.note : config.description}
              </Text>
            </View>
          </View>
        )
      })}
    </View>
  )
}

// ==========================================
// 8. FILTER CHIPS
// ==========================================
interface FilterChipOption<T> {
  id: T
  label: string
  count?: number
}

interface FilterChipsProps<T> {
  options: FilterChipOption<T>[]
  selectedId: T
  onSelect: (id: T) => void
}

export function FilterChips<T extends string>({
  options,
  selectedId,
  onSelect,
}: FilterChipsProps<T>) {
  return (
    <View style={styles.filterChipsRow}>
      {options.map((option) => {
        const isSelected = option.id === selectedId
        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            onPress={() => onSelect(option.id)}
            style={({ pressed }) => [
              styles.filterChip,
              isSelected && styles.filterChipSelected,
              pressed && styles.btnPressed,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                isSelected && styles.filterChipTextSelected,
              ]}
            >
              {option.label}
            </Text>
            {option.count !== undefined && (
              <View
                style={[
                  styles.filterChipBadge,
                  isSelected && styles.filterChipBadgeSelected,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipBadgeText,
                    isSelected && styles.filterChipBadgeTextSelected,
                  ]}
                >
                  {option.count}
                </Text>
              </View>
            )}
          </Pressable>
        )
      })}
    </View>
  )
}

// ==========================================
// 9. EMPTY STATE
// ==========================================
export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}) {
  return (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateIconWrapper}>
        {icon || <Search size={28} color={colors.textMuted} />}
      </View>
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateDescription}>{description}</Text>
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="primary"
          size="md"
          style={{ marginTop: spacing.md }}
        />
      )}
    </View>
  )
}

// ==========================================
// 10. INPUT & TEXTAREA
// ==========================================
interface InputProps extends TextInputProps {
  label?: string
  helperText?: string
  error?: string
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function Input({ label, helperText, error, icon, rightIcon, style, multiline, ...rest }: InputProps) {
  return (
    <View style={styles.inputContainer}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <View style={styles.inputWithIconContainer}>
        <TextInput
          style={[
            styles.inputBase,
            icon ? { paddingLeft: 40 } : null,
            rightIcon ? { paddingRight: 40 } : null,
            multiline && styles.inputMultiline,
            error ? styles.inputError : null,
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...rest}
        />
        {icon && <View style={styles.inputIconWrapper}>{icon}</View>}
        {rightIcon && <View style={styles.inputRightIconWrapper}>{rightIcon}</View>}
      </View>
      {error ? (
        <Text style={styles.inputErrorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.inputHelperText}>{helperText}</Text>
      ) : null}
    </View>
  )
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  // Button
  buttonBase: {
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  btn_primary: {
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  btn_secondary: {
    backgroundColor: colors.surfaceSubtle,
  },
  btn_outline: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  btn_ghost: {
    backgroundColor: colors.transparent,
  },
  btn_danger: {
    backgroundColor: colors.danger,
    ...shadows.sm,
  },
  btnSize_sm: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    minHeight: 34,
  },
  btnSize_md: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
  },
  btnSize_lg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 52,
  },
  fullWidth: {
    width: '100%',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIconLeft: {
    marginRight: spacing.sm,
  },
  btnIconRight: {
    marginLeft: spacing.sm,
  },
  btnTextBase: {
    fontWeight: '700',
  },
  btnText_primary: {
    color: colors.white,
  },
  btnText_secondary: {
    color: colors.text,
  },
  btnText_outline: {
    color: colors.text,
  },
  btnText_ghost: {
    color: colors.primary,
  },
  btnText_danger: {
    color: colors.white,
  },
  btnTextSize_sm: {
    fontSize: 13,
  },
  btnTextSize_md: {
    fontSize: 14,
  },
  btnTextSize_lg: {
    fontSize: 15,
  },
  btnTextDisabled: {
    color: colors.textMuted,
  },

  // Card
  cardBase: {
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  card_default: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  card_elevated: {
    backgroundColor: colors.surface,
    ...shadows.md,
  },
  card_outlined: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  card_subtle: {
    backgroundColor: colors.surfaceSubtle,
  },
  card_primary: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },

  // Badges
  badgeBase: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeIconWrapper: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextSm: {
    fontSize: 11,
  },
  badgeNeutral: {
    backgroundColor: colors.surfaceSubtle,
  },
  badgeTextNeutral: {
    color: colors.textSecondary,
  },

  // Header
  screenHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  screenHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  screenHeaderTitleContainer: {
    flex: 1,
  },
  screenHeaderEyebrow: {
    ...typography.label,
    color: colors.primary,
    marginBottom: 2,
  },
  screenHeaderTitle: {
    ...typography.h1,
    color: colors.text,
  },
  screenHeaderSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  screenHeaderRight: {
    marginLeft: spacing.md,
  },

  // Section Title
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  sectionTitleText: {
    ...typography.h2,
    color: colors.text,
  },
  sectionActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },

  // Metric Card
  metricCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  metricIcon: {
    opacity: 0.8,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Timeline
  timelineContainer: {
    paddingVertical: spacing.xs,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 52,
  },
  timelineGutter: {
    width: 28,
    alignItems: 'center',
  },
  timelineNode: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    zIndex: 1,
  },
  timelineNodeCurrent: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryMuted,
    ...shadows.sm,
  },
  timelineNodePending: {
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  timelineDotPending: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderStrong,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  timelineLineActive: {
    backgroundColor: colors.primary,
  },
  timelineBody: {
    flex: 1,
    paddingLeft: spacing.md,
    paddingBottom: spacing.lg,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineStepLabel: {
    ...typography.subtitle,
    color: colors.text,
  },
  timelineStepLabelCurrent: {
    color: colors.primary,
    fontWeight: '800',
  },
  timelineStepLabelPending: {
    color: colors.textMuted,
  },
  timelineDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
  timelineDescription: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  timelineDescriptionPending: {
    color: colors.textMuted,
  },

  // Filter Chips
  filterChipsRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  filterChipTextSelected: {
    color: colors.white,
  },
  filterChipBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
  },
  filterChipBadgeSelected: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  filterChipBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  filterChipBadgeTextSelected: {
    color: colors.white,
  },

  // Empty State
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  emptyStateIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyStateTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptyStateDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },

  // Input
  inputContainer: {
    gap: spacing.xs,
  },
  inputWithIconContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIconWrapper: {
    position: 'absolute',
    left: 12,
    zIndex: 2,
  },
  inputRightIconWrapper: {
    position: 'absolute',
    right: 12,
    zIndex: 2,
  },
  inputLabel: {
    ...typography.subtitle,
    color: colors.text,
    fontSize: 13,
  },
  inputBase: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 14,
    color: colors.text,
  },
  inputMultiline: {
    minHeight: 90,
    paddingTop: spacing.md,
  },
  inputError: {
    borderColor: colors.danger,
  },
  inputErrorText: {
    ...typography.caption,
    color: colors.danger,
  },
  inputHelperText: {
    ...typography.caption,
    color: colors.textMuted,
  },
})
