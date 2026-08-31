import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRef as useReactRef } from 'react'
import {
  ActivityIndicator,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'
import { WebView, WebViewMessageEvent } from 'react-native-webview'
import { colors, SANTA_CRUZ_DEFAULT_REGION } from '../../theme'
import { GeoLocation } from '../../types/domain'
import { generateLeafletHtml } from './map.template'
import {
  LeafletToNativeMessage,
  MapMarkerItem,
  NativeToLeafletMessage,
} from './map.types'

export interface LeafletMapProps {
  markers: MapMarkerItem[]
  userLocation?: GeoLocation | null
  selectedMarkerId?: string | null
  showHeatmap?: boolean
  centerCoordinate?: { latitude: number; longitude: number; zoom?: number } | null
  interactive?: boolean
  onMarkerPress?: (reportId: string) => void
  onMapPress?: (coordinate?: { latitude: number; longitude: number }) => void
  onReady?: () => void
  style?: StyleProp<ViewStyle>
}

export function LeafletMap({
  markers,
  userLocation = null,
  selectedMarkerId = null,
  showHeatmap = false,
  centerCoordinate = null,
  onMarkerPress,
  onMapPress,
  onReady,
  style,
}: LeafletMapProps) {
  const webViewRef = useRef<WebView>(null)
  const lastPressedCoordsRef = useRef<{ latitude: number; longitude: number } | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)

  const initialCenter = useMemo(() => {
    if (centerCoordinate) {
      return {
        latitude: centerCoordinate.latitude,
        longitude: centerCoordinate.longitude,
        zoom: centerCoordinate.zoom || 14,
      }
    }
    return {
      latitude: SANTA_CRUZ_DEFAULT_REGION.latitude,
      longitude: SANTA_CRUZ_DEFAULT_REGION.longitude,
      zoom: SANTA_CRUZ_DEFAULT_REGION.zoom,
    }
  }, [centerCoordinate])

  // Generate initial self-contained HTML once on component mount
  const [htmlContent] = useState(() =>
    generateLeafletHtml({
      center: initialCenter,
      markers,
      userLocation: userLocation
        ? { latitude: userLocation.latitude, longitude: userLocation.longitude }
        : null,
      selectedId: selectedMarkerId,
      showHeatmap,
    })
  )

  const sendToLeaflet = useCallback((message: NativeToLeafletMessage) => {
    const json = JSON.stringify(message)
    const script = `
      if (window.handleNativeMessage) {
        window.handleNativeMessage(${json});
      }
      true;
    `
    webViewRef.current?.injectJavaScript(script)
  }, [])

  // Update markers and selection when props change
  useEffect(() => {
    if (!isMapReady) return
    sendToLeaflet({
      type: 'SET_MARKERS',
      payload: {
        markers,
        selectedId: selectedMarkerId,
      },
    })
  }, [markers, selectedMarkerId, isMapReady, sendToLeaflet])

  // Update user location pin
  useEffect(() => {
    if (!isMapReady || !userLocation) return
    sendToLeaflet({
      type: 'SET_USER_LOCATION',
      payload: {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      },
    })
  }, [userLocation, isMapReady, sendToLeaflet])

  // Update heatmap toggle
  useEffect(() => {
    if (!isMapReady) return
    sendToLeaflet({
      type: 'TOGGLE_HEATMAP',
      payload: {
        enabled: showHeatmap,
      },
    })
  }, [showHeatmap, isMapReady, sendToLeaflet])

  // Handle programmatic center changes (preventing infinite flyTo loops from dragging)
  useEffect(() => {
    if (!isMapReady || !centerCoordinate) return

    // If change matches the last coords panned/clicked on map, skip programmatic centering
    if (lastPressedCoordsRef.current) {
      const diffLat = Math.abs(centerCoordinate.latitude - lastPressedCoordsRef.current.latitude)
      const diffLng = Math.abs(centerCoordinate.longitude - lastPressedCoordsRef.current.longitude)
      if (diffLat < 0.0001 && diffLng < 0.0001) {
        return
      }
    }

    sendToLeaflet({
      type: 'SET_CENTER',
      payload: {
        latitude: centerCoordinate.latitude,
        longitude: centerCoordinate.longitude,
        zoom: centerCoordinate.zoom,
      },
    })
  }, [centerCoordinate, isMapReady, sendToLeaflet])

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const raw = event.nativeEvent.data
        const message: LeafletToNativeMessage = JSON.parse(raw)

        console.log("[LeafletMap Native] Mensaje recibido del WebView:", message.type, JSON.stringify((message as any).payload || {}));
        switch (message.type) {
          case 'MAP_READY':
            setIsMapReady(true)
            onReady?.()
            break
          case 'MARKER_PRESS':
            onMarkerPress?.(message.payload.reportId)
            break
          case 'MAP_PRESS':
            if (message.payload) {
              lastPressedCoordsRef.current = (message as any).payload
            }
            onMapPress?.((message as any).payload)
            break
          case 'MAP_ERROR':
            console.warn('[LeafletMap Error]:', message.payload.message)
            break
        }
      } catch (err) {
        console.warn('[LeafletMap] Failed to parse message from WebView', err)
      }
    },
    [onMarkerPress, onMapPress, onReady]
  )

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <iframe
          srcDoc={htmlContent}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Leaflet Map Web"
        />
      </View>
    )
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent, baseUrl: 'https://unpkg.com' }}
        onMessage={handleMessage}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={true}
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        
        mixedContentMode="always"
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        onRenderProcessGone={() => true}
        onError={(e) => console.warn('[LeafletMap WebView Error]:', e.nativeEvent.description)}
        onHttpError={(e) => console.warn('[LeafletMap HTTP Error]:', e.nativeEvent.statusCode)}
      />
      {!isMapReady && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
})
