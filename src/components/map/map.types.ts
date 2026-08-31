import { ReportCategory, ReportSeverity, ReportStatus } from '../../types/domain'

export interface MapMarkerItem {
  id: string
  latitude: number
  longitude: number
  title: string
  address: string
  severity: ReportSeverity
  category: ReportCategory
  status: ReportStatus
}

export type NativeToLeafletMessage =
  | {
      type: 'INIT'
      payload: {
        center: { latitude: number; longitude: number; zoom: number }
        markers: MapMarkerItem[]
        userLocation: { latitude: number; longitude: number } | null
        selectedId: string | null
        showHeatmap: boolean
      }
    }
  | {
      type: 'SET_MARKERS'
      payload: {
        markers: MapMarkerItem[]
        selectedId?: string | null
      }
    }
  | {
      type: 'SET_USER_LOCATION'
      payload: {
        latitude: number
        longitude: number
      }
    }
  | {
      type: 'SET_CENTER'
      payload: {
        latitude: number
        longitude: number
        zoom?: number
      }
    }
  | {
      type: 'TOGGLE_HEATMAP'
      payload: {
        enabled: boolean
      }
    }

export type LeafletToNativeMessage =
  | {
      type: 'MAP_READY'
    }
  | {
      type: 'MARKER_PRESS'
      payload: {
        reportId: string
      }
    }
  | {
      type: 'MAP_PRESS'
      payload?: {
        latitude: number
        longitude: number
      }
    }
  | {
      type: 'MAP_ERROR'
      payload: {
        message: string
      }
    }
