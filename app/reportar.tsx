import React, { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
} from 'react-native'
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Crosshair,
  ImageIcon,
  Info,
  MapPin,
  RotateCcw,
  ShieldAlert,
  Trash2,
} from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LeafletMap } from '../src/components/map'
import {
  Button,
  Card,
  CategoryBadge,
  Input,
  SeverityBadge,
  StatusBadge,
} from '../src/components/ui'
import { useCreateReport } from '../src/hooks/useReports'
import {
  categoryConfig,
  colors,
  radii,
  SANTA_CRUZ_DEFAULT_REGION,
  severityConfig,
  shadows,
  spacing,
  typography,
} from '../src/theme'
import { GeoLocation, ReportCategory, ReportSeverity } from '../src/types/domain'

const cleanGeocodedAddress = (item: Location.LocationGeocodedAddress): string => {
  const isPlusCode = (str: string | null | undefined) => Boolean(str && str.includes('+'));

  let street = item.street || '';
  let name = item.name || '';
  
  if (isPlusCode(street)) street = '';
  if (isPlusCode(name)) name = '';

  let mainReference = street || name || '';
  const district = item.district || '';
  const city = item.city || item.subregion || 'Santa Cruz';

  if (!mainReference) {
    if (district) {
      mainReference = `Calle sin nombre (Zona ${district})`;
    } else {
      mainReference = 'Ubicación sin nombre';
    }
  }

  const cleanParts: string[] = [mainReference];
  if (district && district !== mainReference) {
    cleanParts.push(district);
  }
  if (city && city !== district && city !== mainReference) {
    cleanParts.push(city);
  }

  return cleanParts.join(', ');
};


export default function ReportWizardScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [isMapModalVisible, setIsMapModalVisible] = useState(false)

  // Pre-cargar ubicación GPS en segundo plano al montar el componente
  useEffect(() => {
    const prefetchGPS = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          let address = 'Ubicación GPS obtenida';
          try {
            const rev = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            if (rev && rev.length > 0) {
              address = cleanGeocodedAddress(rev[0]);
            }
          } catch (e) {}

          setLocation({
            latitude: lat,
            longitude: lng,
            accuracy: position.coords.accuracy,
            address,
          });
          setHasGps(true);
        }
      } catch (err) {
        console.log('[Reportar] Silently failed to prefetch GPS:', err);
      }
    };
    prefetchGPS();
  }, []);

  // Form State
  const [location, setLocation] = useState<GeoLocation>({
    latitude: SANTA_CRUZ_DEFAULT_REGION.latitude,
    longitude: SANTA_CRUZ_DEFAULT_REGION.longitude,
    address: 'Av. Las Palmas casi 3er Anillo, Equipetrol, Santa Cruz',
  })
  const [isLocating, setIsLocating] = useState(false)
  const [hasGps, setHasGps] = useState(false)

  const [imageUri, setImageUri] = useState<string | null>(null)
  const [category, setCategory] = useState<ReportCategory>('POTHOLE')
  const [severity, setSeverity] = useState<ReportSeverity>('MEDIUM')
  const [description, setDescription] = useState('')

  const createReportMutation = useCreateReport()

  // GPS Location Trigger
  const handleGetLocation = async () => {
    setIsLocating(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
          'Permiso de ubicación',
          'Necesitamos acceso a tu GPS para ubicar el bache. También podés escribir la calle o anillo.',
          [{ text: 'Entendido' }]
        )
        setIsLocating(false)
        return
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      const lat = position.coords.latitude
      const lng = position.coords.longitude
      let address = 'Ubicación GPS obtenida'

      try {
        const rev = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng })
        if (rev && rev.length > 0) {
          address = cleanGeocodedAddress(rev[0])
        } else {
          address = `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
        }
      } catch (e) {
        console.warn('[reportar.tsx] GPS geocoding failed:', e)
        address = `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
      }

      setLocation({
        latitude: lat,
        longitude: lng,
        accuracy: position.coords.accuracy,
        address,
      })
      setHasGps(true)
    } catch {
      Alert.alert(
        'GPS no disponible',
        'Verificá que el GPS esté activo en tu teléfono o escribí la referencia de la calle.',
        [{ text: 'Aceptar' }]
      )
    } finally {
      setIsLocating(false)
    }
  }

  // Camera Picker
  const handleLaunchCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
          'Permiso de cámara',
          'Se necesita acceso a la cámara para fotografiar el bache.',
          [{ text: 'Entendido' }]
        )
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsEditing: false,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri)
      }
    } catch (err) {
      console.warn('[handleLaunchCamera] Error:', err)
    }
  }

  // Gallery Picker
  const handleLaunchGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsEditing: false,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri)
      }
    } catch (err) {
      console.warn('[handleLaunchGallery] Error:', err)
    }
  }

  // Submission Handler
  const handleSubmit = async () => {
    try {
      const defaultTitle = `${categoryConfig[category].label} en ${location.address.split(',')[0] || 'calzada'}`

      const created = await createReportMutation.mutateAsync({
        title: defaultTitle,
        description: description.trim(),
        location,
        severity,
        category,
        imageUri: imageUri || undefined,
      })

      router.replace(`/reporte/${created.id}`)
    } catch {
      Alert.alert('Aviso', 'No se pudo guardar el reporte. Intentalo de nuevo.')
    }
  }

  const handleNext = () => {
    if (step < 4) {
      setStep((step + 1) as 1 | 2 | 3 | 4)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3 | 4)
    } else {
      router.back()
    }
  }

  const stepTitles = [
    'Ubicá el bache',
    'Sacale una foto',
    'Detalles y riesgo',
    'Revisá y enviá',
  ]

  const categories: ReportCategory[] = ['POTHOLE', 'ROAD_DAMAGE', 'SINKING', 'CRACK', 'OTHER']
  const severities: ReportSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header & Step Indicator */}
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={handleBack}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <ArrowLeft size={20} color={colors.text} />
        </Pressable>
        <View style={styles.stepInfoCol}>
          <Text style={styles.stepEyebrow}>PASO {step} DE 4</Text>
          <Text style={styles.stepTitle}>{stepTitles[step - 1]}</Text>
        </View>
      </View>

      {/* Progress Bar Line */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${(step / 4) * 100}%` }]} />
      </View>

      {/* Scrollable Step Content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* =================================================== */}
        {/* PASO 1: UBICACIÓN                                  */}
        {/* =================================================== */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepInstruction}>
              Ubicá el daño vial en el mapa para registrar la dirección exacta de forma automática.
            </Text>

            {/* Botón único de ubicación */}
            <Button
              label={location.address ? "Cambiar ubicación del bache" : "Seleccionar ubicación del bache"}
              variant="primary"
              size="lg"
              icon={<MapPin size={20} color={colors.white} />}
              onPress={() => setIsMapModalVisible(true)}
              fullWidth
              style={styles.mainMapSelectBtn}
            />

            {/* Nombre de la calle obtenido */}
            {Boolean(location.address) && (
              <View style={styles.addressDisplayCard}>
                <MapPin size={20} color={colors.primary} />
                <Text style={styles.addressDisplayText}>{location.address}</Text>
              </View>
            )}

        {/* Fullscreen Location Selection Modal */}
            <Modal
              visible={isMapModalVisible}
              animationType="slide"
              onRequestClose={() => setIsMapModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.fullscreenMap}>
                  <LeafletMap
                    markers={[]} // No active markers inside selection map (central pin style)
                    centerCoordinate={{
                      latitude: location.latitude,
                      longitude: location.longitude,
                      zoom: 16,
                    }}
                    onMapPress={async (coords) => {
                      if (coords && typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
                        // 1. Mover coordenadas al instante e indicar estado de carga
                        setLocation((prev) => ({
                          ...prev,
                          latitude: coords.latitude,
                          longitude: coords.longitude,
                          address: 'Buscando dirección...'
                        }));
                        setHasGps(true);

                        // 2. Geocodificar dirección en segundo plano para el pie del modal
                        try {
                          const rev = await Location.reverseGeocodeAsync({
                            latitude: coords.latitude,
                            longitude: coords.longitude
                          });
                          let newAddress = `Coordenadas: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
                          if (rev && rev.length > 0) {
                            newAddress = cleanGeocodedAddress(rev[0]) || newAddress;
                          }
                          
                          setLocation((prev) => {
                            if (prev.latitude === coords.latitude && prev.longitude === coords.longitude) {
                              return { ...prev, address: newAddress };
                            }
                            return prev;
                          });
                        } catch (e) {
                          console.warn('[reportar.tsx] Modal geocoding failed:', e);
                          const fallbackAddress = `Coordenadas: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
                          setLocation((prev) => {
                            if (prev.latitude === coords.latitude && prev.longitude === coords.longitude) {
                              return { ...prev, address: fallbackAddress };
                            }
                            return prev;
                          });
                        }
                      }
                    }}
                    style={StyleSheet.absoluteFill}
                  />

                  {/* Fixed Native Central Pin Indicator */}
                  <View style={styles.centerPinContainer} pointerEvents="none">
                    <MapPin size={42} color={colors.primary} style={styles.centerPinIcon} />
                    <View style={styles.centerPinDot} />
                  </View>
                </View>

                {/* Floating Top Header */}
                <View style={[styles.modalHeader, { paddingTop: Math.max(insets.top, 16) }]}>
                  <Pressable accessibilityRole="button" accessibilityLabel="Cerrar mapa" style={styles.modalCloseBtn} onPress={() => setIsMapModalVisible(false)}>
                    <ArrowLeft size={20} color={colors.text} />
                  </Pressable>
                  <Text style={styles.modalHeaderTitle}>Ubicá el bache en el mapa</Text>
                </View>

                {/* Floating Bottom Confirm Button */}
                <View style={[styles.modalFooter, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
                  <Text style={styles.modalFooterAddress} numberOfLines={2}>
                    {location.address}
                  </Text>
                  <Button
                    label="Confirmar ubicación"
                    variant="primary"
                    size="lg"
                    onPress={() => {
                      setIsMapModalVisible(false);
                    }}
                    fullWidth
                  />
                </View>
              </View>
            </Modal>
          </View>
        )}

        {/* =================================================== */}
        {/* PASO 2: FOTOGRAFÍA                                 */}
        {/* =================================================== */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            {imageUri ? (
              <View style={styles.photoPreviewCard}>
                <Image source={{ uri: imageUri }} style={styles.photoPreviewImage} />
                <View style={styles.photoActionsRow}>
                  <Button
                    label="Cambiar"
                    variant="outline"
                    size="sm"
                    icon={<RotateCcw size={14} color={colors.text} />}
                    onPress={handleLaunchCamera}
                  />
                  <Button
                    label="Quitar foto"
                    variant="danger"
                    size="sm"
                    icon={<Trash2 size={14} color={colors.white} />}
                    onPress={() => setImageUri(null)}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.photoPickerContainer}>
                <View style={styles.photoPlaceholder}>
                  <Camera size={34} color={colors.primary} />
                  <Text style={styles.photoPlaceholderTitle}>Foto del bache</Text>
                  <Text style={styles.photoPlaceholderSub}>
                    Ayuda a que la cuadrilla calcule el asfalto necesario.
                  </Text>
                </View>

                <View style={styles.photoButtonsGroup}>
                  <Button
                    label="Tomar foto con la cámara"
                    variant="primary"
                    size="md"
                    icon={<Camera size={17} color={colors.white} />}
                    onPress={handleLaunchCamera}
                    fullWidth
                  />
                  <Button
                    label="Elegir de la galería"
                    variant="outline"
                    size="md"
                    icon={<ImageIcon size={17} color={colors.text} />}
                    onPress={handleLaunchGallery}
                    fullWidth
                  />
                </View>
              </View>
            )}

            {/* Tip Banner */}
            <Card variant="subtle" style={styles.tipCard}>
              <View style={styles.tipRow}>
                <Info size={17} color={colors.primary} />
                <Text style={styles.tipText}>
                  Consejo: Que se vea un poco de la calle para ubicar el carril.
                </Text>
              </View>
            </Card>
          </View>
        )}

        {/* =================================================== */}
        {/* PASO 3: DETALLES, CATEGORÍA Y SEVERIDAD            */}
        {/* =================================================== */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            {/* Category Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>¿Qué tipo de daño es?</Text>
              <View style={styles.categoryGrid}>
                {categories.map((catKey) => {
                  const conf = categoryConfig[catKey]
                  const isSelected = category === catKey
                  return (
                    <Pressable
                      key={catKey}
                      accessibilityRole="button"
                      onPress={() => setCategory(catKey)}
                      style={({ pressed }) => [
                        styles.catOption,
                        isSelected && styles.catOptionSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.catOptionHeader}>
                        <Text
                          style={[
                            styles.catOptionTitle,
                            isSelected && styles.catOptionTitleSelected,
                          ]}
                        >
                          {conf.label}
                        </Text>
                        {isSelected && <CheckCircle2 size={16} color={colors.primary} />}
                      </View>
                      <Text
                        style={[
                          styles.catOptionDesc,
                          isSelected && styles.catOptionDescSelected,
                        ]}
                      >
                        {conf.description}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>

            {/* Severity Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nivel de riesgo / peligro</Text>
              <View style={styles.severityGrid}>
                {severities.map((sevKey) => {
                  const conf = severityConfig[sevKey]
                  const isSelected = severity === sevKey
                  return (
                    <Pressable
                      key={sevKey}
                      accessibilityRole="button"
                      onPress={() => setSeverity(sevKey)}
                      style={({ pressed }) => [
                        styles.sevOption,
                        { borderColor: isSelected ? conf.color : colors.border },
                        isSelected && { backgroundColor: conf.bg },
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.sevOptionHeader}>
                        <View style={[styles.sevDot, { backgroundColor: conf.color }]} />
                        <Text style={[styles.sevOptionTitle, { color: conf.text }]}>
                          {conf.label}
                        </Text>
                      </View>
                      <Text style={styles.sevOptionSub}>{conf.priorityLabel}</Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>

            {/* Optional Description */}
            <Input
              label="Detalles adicionales (opcional)"
              placeholder="Ej: Carril derecho, se llena de agua cuando llueve."
              value={description}
              onChangeText={setDescription}
              multiline
              helperText="Cualquier dato que ayude a la cuadrilla de bacheo."
            />
          </View>
        )}

        {/* =================================================== */}
        {/* PASO 4: REVISIÓN Y CONFIRMACIÓN                    */}
        {/* =================================================== */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Card variant="default" style={styles.reviewCard}>
              <Text style={styles.reviewHeading}>Resumen del reporte</Text>

              {imageUri && (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.reviewImage}
                  resizeMode="cover"
                />
              )}

              <View style={styles.reviewBadgesRow}>
                <CategoryBadge category={category} />
                <SeverityBadge severity={severity} size="md" />
              </View>

              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>Lugar</Text>
                <View style={styles.reviewLocationRow}>
                  <MapPin size={14} color={colors.primary} />
                  <Text style={styles.reviewValue}>{location.address}</Text>
                </View>
              </View>

              {description ? (
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Detalle</Text>
                  <Text style={styles.reviewValue}>{description}</Text>
                </View>
              ) : null}

              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>Estado</Text>
                <StatusBadge status="RECEIVED" size="md" />
              </View>
            </Card>

            <View style={styles.civicNotice}>
              <ShieldAlert size={17} color={colors.primary} />
              <Text style={styles.civicNoticeText}>
                Tu reporte se guardará de inmediato para hacerle seguimiento en la app.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View
        style={[
          styles.bottomActionBar,
          { paddingBottom: Math.max(insets.bottom, 16) + spacing.xs },
        ]}
      >
        <Button
          label={
            step === 4
              ? createReportMutation.isPending
                ? 'Guardando...'
                : 'Confirmar y enviar'
              : 'Continuar'
          }
          variant="primary"
          size="lg"
          rightIcon={
            step < 4 ? <ArrowRight size={17} color={colors.white} /> : undefined
          }
          loading={createReportMutation.isPending}
          onPress={handleNext}
          fullWidth
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
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
  stepInfoCol: {
    flex: 1,
    gap: 1,
  },
  stepEyebrow: {
    ...typography.label,
    color: colors.primary,
    fontSize: 10,
  },
  stepTitle: {
    ...typography.h2,
    color: colors.text,
  },
  progressBarBg: {
    height: 3,
    backgroundColor: colors.border,
    width: '100%',
  },
  progressBarFill: {
    height: 3,
    backgroundColor: colors.primary,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 110,
  },
  stepContainer: {
    gap: spacing.md,
  },

  // Step 1: Location
  locationCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  locationCardHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  locationIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationIconWrapperActive: {
    backgroundColor: colors.primaryLight,
  },
  locationCardInfo: {
    flex: 1,
    gap: 2,
  },
  locationCardTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  locationCardSub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  mapSnippetContainer: {
    gap: spacing.xs,
  },
  mapSnippetLabel: {
    ...typography.subtitle,
    fontSize: 13,
    color: colors.text,
  },
  mapSnippetWrapper: {
    height: 170,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  miniMap: {
    flex: 1,
  },
  stepInstruction: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  mainMapSelectBtn: {
    marginVertical: spacing.md,
  },
  addressDisplayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: '#F8FAFC',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  addressDisplayText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
  mapSelectorContainer: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  mapSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.xl,
    ...shadows.sm,
  },
  mapSelectorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  mapSelectorTextCol: {
    gap: 2,
    flex: 1,
  },
  mapSelectorTitle: {
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.text,
  },
  mapSelectorSub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.background,
  },
  fullscreenMap: {
    flex: 1,
  },
  modalHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    zIndex: 10,
    ...shadows.sm,
  },
  modalCloseBtn: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  modalHeaderTitle: {
    ...typography.h2,
    color: colors.text,
  },
  modalFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    zIndex: 10,
    gap: spacing.md,
    ...shadows.md,
  },
  modalFooterAddress: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 2,
  },
  centerPinContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  centerPinIcon: {
    transform: [{ translateY: -21 }], // Shift up by exactly half of icon size (42px)
  },
  centerPinDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    position: 'absolute',
  },

  // Step 2: Photo
  photoPickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.sm,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
  },
  photoPlaceholderTitle: {
    ...typography.h2,
    color: colors.text,
  },
  photoPlaceholderSub: {
    ...typography.bodySm,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
  photoButtonsGroup: {
    gap: spacing.xs + 3,
  },
  photoPreviewCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  photoPreviewImage: {
    width: '100%',
    height: 220,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceSubtle,
  },
  photoActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  tipCard: {
    padding: spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  tipText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },

  // Step 3: Category & Severity
  fieldGroup: {
    gap: spacing.xs + 2,
  },
  fieldLabel: {
    ...typography.subtitle,
    fontSize: 13,
    color: colors.text,
  },
  categoryGrid: {
    gap: spacing.xs + 2,
  },
  catOption: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 2,
  },
  catOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  catOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catOptionTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  catOptionTitleSelected: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  catOptionDesc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  catOptionDescSelected: {
    color: colors.primaryDark,
  },
  severityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  sevOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1.5,
    gap: 2,
  },
  sevOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sevDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sevOptionTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  sevOptionSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },

  // Step 4: Review
  reviewCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  reviewHeading: {
    ...typography.h2,
    color: colors.text,
  },
  reviewImage: {
    width: '100%',
    height: 160,
    borderRadius: radii.md,
  },
  reviewBadgesRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  reviewItem: {
    gap: 2,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.xs + 2,
  },
  reviewLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  reviewValue: {
    ...typography.bodySm,
    color: colors.text,
    fontWeight: '600',
  },
  reviewLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  civicNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  civicNoticeText: {
    ...typography.caption,
    color: colors.primaryDark,
    flex: 1,
    lineHeight: 16,
  },

  // Bottom Action Bar
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    ...shadows.md,
  },
  pressed: {
    opacity: 0.8,
  },
})
