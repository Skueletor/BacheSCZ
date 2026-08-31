import { MapMarkerItem } from './map.types'

export interface MapTemplateConfig {
  center: { latitude: number; longitude: number; zoom: number }
  markers: MapMarkerItem[]
  userLocation: { latitude: number; longitude: number } | null
  selectedId: string | null
  showHeatmap: boolean
}

export function generateLeafletHtml(config: MapTemplateConfig): string {
  const initialPayloadJson = JSON.stringify(config)

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>BacheSCZ Mapa</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    html, body, #map { width: 100%; height: 100%; background: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; overflow: hidden; }
    
    /* Clean, uncluttered map container */
    .leaflet-container {
      background: #F8FAFC !important;
    }

    /* Completely hide attribution controls for clean UI */
    .leaflet-control-attribution,
    .leaflet-control-container .leaflet-bottom {
      display: none !important;
    }

    /* Minimalist Pothole Pin Marker */
    .bache-marker {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
    }
    .bache-pin {
      width: 26px;
      height: 26px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #FFFFFF;
      transition: transform 0.15s ease-out;
    }
    .bache-pin-inner {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #FFFFFF;
      transform: rotate(45deg);
    }
    .bache-pin-selected {
      transform: rotate(-45deg) scale(1.3);
      border-color: #0F172A;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.45);
      z-index: 9999 !important;
    }
    
    /* Semantic Severity Colors */
    .sev-CRITICAL { background-color: #DC2626; }
    .sev-HIGH { background-color: #EA580C; }
    .sev-MEDIUM { background-color: #D97706; }
    .sev-LOW { background-color: #059669; }

    /* Animated pulse ring on critical potholes */
    .pulse-ring {
      position: absolute;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: rgba(220, 38, 38, 0.35);
      animation: pulse 2s infinite ease-out;
      pointer-events: none;
      top: -5px;
      left: -5px;
    }
    @keyframes pulse {
      0% { transform: scale(0.6); opacity: 0.9; }
      100% { transform: scale(1.4); opacity: 0; }
    }

    /* User GPS Blue Dot */
    .user-location-marker {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #2563EB;
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 0 8px rgba(37, 99, 235, 0.6);
    }
    .user-pulse {
      position: absolute;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(37, 99, 235, 0.25);
      animation: userPulse 2.5s infinite ease-out;
    }
    @keyframes userPulse {
      0% { transform: scale(0.5); opacity: 0.8; }
      100% { transform: scale(1.7); opacity: 0; }
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <script>
    (function() {
      var initialData = ${initialPayloadJson};
      var map;
      var markerLayerGroup;
      var heatmapLayerGroup;
      var userLocationMarker = null;
      var currentMarkers = [];
      var selectedReportId = initialData.selectedId || null;
      var isHeatmapActive = initialData.showHeatmap || false;

      function postToNative(type, payload) {
        var msg = JSON.stringify({ type: type, payload: payload || {} });
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(msg);
        } else if (window.parent && window.parent.postMessage) {
          window.parent.postMessage(msg, '*');
        }
      }

      function initMap() {
        try {
          var center = initialData.center || { latitude: -17.7833, longitude: -63.1821, zoom: 13 };
          
          map = L.map('map', {
            zoomControl: false,
            attributionControl: false,
            maxZoom: 19,
            minZoom: 11
          }).setView([center.latitude, center.longitude], center.zoom || 13);

          // Clean minimalist basemap (Streets & roads only, NO commercial POIs, stores or clutter)
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            maxZoom: 19
          }).addTo(map);

          markerLayerGroup = L.layerGroup().addTo(map);
          heatmapLayerGroup = L.layerGroup();

          // Trigger MAP_PRESS when the map is dragged/moved and stops (center-pin design)
          map.on('moveend', function() {
            var center = map.getCenter();
            console.log("[Leaflet HTML] Mapa desplazado. Nuevo centro:", center.lat, center.lng);
            postToNative('MAP_PRESS', {
              latitude: center.lat,
              longitude: center.lng
            });
          });

          if (initialData.userLocation) {
            updateUserLocation(initialData.userLocation.latitude, initialData.userLocation.longitude);
          }

          if (initialData.markers) {
            renderMarkers(initialData.markers, selectedReportId);
          }

          if (isHeatmapActive) {
            renderHeatmap(initialData.markers);
          }

          postToNative('MAP_READY');
        } catch (err) {
          postToNative('MAP_ERROR', { message: err.toString() });
        }
      }

      function createCustomIcon(report, isSelected) {
        var sev = report.severity || 'MEDIUM';
        var selectedClass = isSelected ? 'bache-pin-selected' : '';
        var pulseHtml = (sev === 'CRITICAL' && !isSelected) ? '<div class="pulse-ring"></div>' : '';

        var html = '<div class="bache-marker">' +
          pulseHtml +
          '<div class="bache-pin sev-' + sev + ' ' + selectedClass + '">' +
            '<div class="bache-pin-inner"></div>' +
          '</div>' +
        '</div>';

        return L.divIcon({
          html: html,
          className: '',
          iconSize: [26, 26],
          iconAnchor: [13, 26]
        });
      }

      function renderMarkers(markers, selectedId) {
        currentMarkers = markers || [];
        selectedReportId = selectedId || null;
        markerLayerGroup.clearLayers();

        if (isHeatmapActive) {
          return;
        }

        currentMarkers.forEach(function(report) {
          if (!report.latitude || !report.longitude) return;

          var isSelected = report.id === selectedReportId;
          var icon = createCustomIcon(report, isSelected);

          var marker = L.marker([report.latitude, report.longitude], {
            icon: icon,
            zIndexOffset: isSelected ? 1000 : (report.severity === 'CRITICAL' ? 500 : 100)
          });

          marker.on('click', function(e) {
            L.DomEvent.stopPropagation(e);
            postToNative('MARKER_PRESS', { reportId: report.id });
          });

          marker.addTo(markerLayerGroup);
        });
      }

      function renderHeatmap(markers) {
        heatmapLayerGroup.clearLayers();
        if (!isHeatmapActive) return;

        (markers || []).forEach(function(report) {
          if (!report.latitude || !report.longitude) return;

          var sev = report.severity || 'MEDIUM';
          var radius = sev === 'CRITICAL' ? 180 : (sev === 'HIGH' ? 140 : 100);
          var color = sev === 'CRITICAL' ? '#DC2626' : (sev === 'HIGH' ? '#EA580C' : '#D97706');

          L.circle([report.latitude, report.longitude], {
            radius: radius,
            color: 'transparent',
            fillColor: color,
            fillOpacity: 0.35
          }).addTo(heatmapLayerGroup);

          L.circle([report.latitude, report.longitude], {
            radius: radius * 0.45,
            color: 'transparent',
            fillColor: color,
            fillOpacity: 0.6
          }).addTo(heatmapLayerGroup);
        });

        if (!map.hasLayer(heatmapLayerGroup)) {
          map.addLayer(heatmapLayerGroup);
        }
      }

      function updateUserLocation(lat, lng) {
        if (userLocationMarker) {
          map.removeLayer(userLocationMarker);
        }

        var icon = L.divIcon({
          html: '<div class="user-location-marker"><div class="user-pulse"></div><div class="user-dot"></div></div>',
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        userLocationMarker = L.marker([lat, lng], {
          icon: icon,
          zIndexOffset: 2000
        }).addTo(map);
      }

      window.handleNativeMessage = function(data) {
        if (!data || !data.type) return;

        switch (data.type) {
          case 'SET_MARKERS':
            renderMarkers(data.payload.markers, data.payload.selectedId);
            if (isHeatmapActive) {
              renderHeatmap(data.payload.markers);
            }
            break;

          case 'SET_USER_LOCATION':
            updateUserLocation(data.payload.latitude, data.payload.longitude);
            break;

          case 'SET_CENTER':
            if (map) {
              map.flyTo([data.payload.latitude, data.payload.longitude], data.payload.zoom || map.getZoom(), {
                duration: 0.7
              });
            }
            break;

          case 'TOGGLE_HEATMAP':
            isHeatmapActive = Boolean(data.payload.enabled);
            if (isHeatmapActive) {
              markerLayerGroup.clearLayers();
              renderHeatmap(currentMarkers);
            } else {
              if (map.hasLayer(heatmapLayerGroup)) {
                map.removeLayer(heatmapLayerGroup);
              }
              renderMarkers(currentMarkers, selectedReportId);
            }
            break;
        }
      };

      window.addEventListener('message', function(event) {
        try {
          var parsed = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          window.handleNativeMessage(parsed);
        } catch (e) {}
      });

      document.addEventListener('DOMContentLoaded', initMap);
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initMap();
      }
    })();
  </script>
</body>
</html>`
}
