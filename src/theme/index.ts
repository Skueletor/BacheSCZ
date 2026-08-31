import { Platform, TextStyle, ViewStyle } from 'react-native'
import { ReportCategory, ReportSeverity, ReportStatus } from '../types/domain'

export const colors = {
  // Brand & Navigation
  primary: '#0F766E', // Teal 700 - civic, modern, reliable
  primaryDark: '#115E59',
  primaryLight: '#F0FDFA', // Teal 50
  primaryMuted: '#CCFBF1', // Teal 100
  secondary: '#2563EB', // Blue 600 - mobility, links
  secondaryLight: '#EFF6FF',

  // Surfaces & Layout
  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9', // Slate 100
  surfaceHover: '#E2E8F0', // Slate 200

  // Borders & Dividers
  border: '#E2E8F0', // Slate 200
  borderLight: '#F1F5F9',
  borderStrong: '#CBD5E1', // Slate 300

  // Typography
  text: '#0F172A', // Slate 900
  textSecondary: '#475569', // Slate 600
  textMuted: '#94A3B8', // Slate 400
  textInverse: '#FFFFFF',

  // Semantic Severity
  severityLow: '#10B981', // Emerald 500
  severityLowBg: '#ECFDF5',
  severityLowText: '#065F46',

  severityMedium: '#F59E0B', // Amber 500
  severityMediumBg: '#FFFBEB',
  severityMediumText: '#92400E',

  severityHigh: '#F97316', // Orange 500
  severityHighBg: '#FFF7ED',
  severityHighText: '#9A3412',

  severityCritical: '#EF4444', // Red 500
  severityCriticalBg: '#FEF2F2',
  severityCriticalText: '#991B1B',

  // Semantic Status
  statusReceived: '#3B82F6',
  statusReceivedBg: '#EFF6FF',
  statusReceivedText: '#1E40AF',

  statusUnderReview: '#F59E0B',
  statusUnderReviewBg: '#FFFBEB',
  statusUnderReviewText: '#92400E',

  statusInspection: '#8B5CF6',
  statusInspectionBg: '#F5F3FF',
  statusInspectionText: '#5B21B6',

  statusScheduled: '#06B6D4',
  statusScheduledBg: '#ECFEFF',
  statusScheduledText: '#155E75',

  statusInProgress: '#F97316',
  statusInProgressBg: '#FFF7ED',
  statusInProgressText: '#9A3412',

  statusResolved: '#10B981',
  statusResolvedBg: '#ECFDF5',
  statusResolvedText: '#065F46',

  statusRejected: '#64748B',
  statusRejectedBg: '#F1F5F9',
  statusRejectedText: '#334155',

  // Utility
  danger: '#DC2626',
  dangerBg: '#FEE2E2',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const

export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,
  sm: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
    },
    android: { elevation: 1 },
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
    },
  }),
  md: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: { elevation: 3 },
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
  }),
  lg: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    android: { elevation: 6 },
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
  }),
}

export const typography = {
  display: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800' as TextStyle['fontWeight'],
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.2,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700' as TextStyle['fontWeight'],
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  bodyBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  bodySm: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  caption: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  label: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: 0.5,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
}

export const statusConfig: Record<
  ReportStatus,
  { label: string; color: string; bg: string; text: string; stepIndex: number; description: string }
> = {
  RECEIVED: {
    label: 'Recibido',
    color: colors.statusReceived,
    bg: colors.statusReceivedBg,
    text: colors.statusReceivedText,
    stepIndex: 0,
    description: 'El reporte fue registrado exitosamente.',
  },
  UNDER_REVIEW: {
    label: 'En revisión',
    color: colors.statusUnderReview,
    bg: colors.statusUnderReviewBg,
    text: colors.statusUnderReviewText,
    stepIndex: 1,
    description: 'En evaluación preliminar por el equipo técnico.',
  },
  INSPECTION: {
    label: 'En inspección',
    color: colors.statusInspection,
    bg: colors.statusInspectionBg,
    text: colors.statusInspectionText,
    stepIndex: 2,
    description: 'Inspección técnica en terreno para evaluar dimensiones y severidad.',
  },
  SCHEDULED: {
    label: 'Programado',
    color: colors.statusScheduled,
    bg: colors.statusScheduledBg,
    text: colors.statusScheduledText,
    stepIndex: 3,
    description: 'Incorporado en el cronograma de mantenimiento vial.',
  },
  IN_PROGRESS: {
    label: 'En reparación',
    color: colors.statusInProgress,
    bg: colors.statusInProgressBg,
    text: colors.statusInProgressText,
    stepIndex: 4,
    description: 'Cuadrilla de obras ejecutando trabajos en la calzada.',
  },
  RESOLVED: {
    label: 'Solucionado',
    color: colors.statusResolved,
    bg: colors.statusResolvedBg,
    text: colors.statusResolvedText,
    stepIndex: 5,
    description: 'Reparación completada y verificada.',
  },
  REJECTED: {
    label: 'Desestimado',
    color: colors.statusRejected,
    bg: colors.statusRejectedBg,
    text: colors.statusRejectedText,
    stepIndex: -1,
    description: 'No procede por duplicidad o no corresponder a la red vial.',
  },
}

export const severityConfig: Record<
  ReportSeverity,
  { label: string; color: string; bg: string; text: string; priorityLabel: string; pinSize: number }
> = {
  LOW: {
    label: 'Baja',
    color: colors.severityLow,
    bg: colors.severityLowBg,
    text: colors.severityLowText,
    priorityLabel: 'Mantenimiento preventivo',
    pinSize: 24,
  },
  MEDIUM: {
    label: 'Media',
    color: colors.severityMedium,
    bg: colors.severityMediumBg,
    text: colors.severityMediumText,
    priorityLabel: 'Atención estándar',
    pinSize: 28,
  },
  HIGH: {
    label: 'Alta',
    color: colors.severityHigh,
    bg: colors.severityHighBg,
    text: colors.severityHighText,
    priorityLabel: 'Prioridad alta',
    pinSize: 32,
  },
  CRITICAL: {
    label: 'Crítica',
    color: colors.severityCritical,
    bg: colors.severityCriticalBg,
    text: colors.severityCriticalText,
    priorityLabel: 'Riesgo inminente',
    pinSize: 36,
  },
}

export const categoryConfig: Record<ReportCategory, { label: string; description: string }> = {
  POTHOLE: {
    label: 'Bache',
    description: 'Hueco o rotura profunda en la calzada de asfalto o pavimento.',
  },
  ROAD_DAMAGE: {
    label: 'Calzada dañada',
    description: 'Desgaste severo, bacheo irregular o desprendimiento de carpeta.',
  },
  SINKING: {
    label: 'Hundimiento',
    description: 'Depresión del terreno o calzada con riesgo de socavamiento.',
  },
  CRACK: {
    label: 'Grietas',
    description: 'Fisuras estructurales longitudinales o en bloque en el pavimento.',
  },
  OTHER: {
    label: 'Otro daño vial',
    description: 'Problemas adicionales de infraestructura en la vía pública.',
  },
}

// Initial visual fallback center for Santa Cruz de la Sierra (Plaza 24 de Septiembre / Centro)
export const SANTA_CRUZ_DEFAULT_REGION = {
  latitude: -17.7833,
  longitude: -63.1821,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
  zoom: 13,
} as const
