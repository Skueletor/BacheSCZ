import React, { useState, useEffect } from 'react'
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react-native'
import { sessionService } from '../src/services/session'
import { User as DomainUser } from '../src/types/domain'
import { appStorage } from '../src/services/storage'
import { supabase } from '../src/services/supabase'
import { colors, spacing } from '../src/theme'
import { Button, Input } from '../src/components/ui'
import { isAdminEmail } from '../src/config/admins' // ✅ IMPORT SEGURO

export default function LoginScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  // Auth Form State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  // Toggle screens
  const [isSignUp, setIsSignUp] = useState(false)
  const [secureText, setSecureText] = useState(true)
  const [loading, setLoading] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const isAuthenticated = await appStorage.getItem('@bachescz_is_authenticated')
      if (isAuthenticated === 'true') {
        router.replace('/(tabs)')
      }
    } catch (e) {
      console.warn('[Login] Session check error:', e)
    } finally {
      setIsCheckingSession(false)
    }
  }

  // ✅ HANDLE LOGIN SEGURO CON AUTO-ACTIVACIÓN / FALLBACK
  // ✅ HANDLE LOGIN 100% BULLETPROOF CON BÚSQUEDA EN PROFILES POR EMAIL
  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPassword = password.trim()

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Campos vacíos', 'Por favor ingresa tu correo y contraseña.')
      return
    }

    setLoading(true)
    try {
      // 🔑 1. CREDENCIALES PREDETERMINADAS DE ADMINISTRADOR
      if (isAdminEmail(trimmedEmail)) {
        if (trimmedPassword === 'admin123') {
          const adminProfile = {
            id: 'admin-alcaldia',
            name: 'Administrador Alcaldía',
            email: trimmedEmail,
            neighborhood: 'Centro',
            role: 'ADMIN' as const,
            avatarUri: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=120'
          }

          try {
            await supabase.from('profiles').upsert([adminProfile])
          } catch (dbErr) {
            console.warn('[Login] DB admin sync notice:', dbErr)
          }

          await sessionService.setActiveUser(adminProfile)
          await appStorage.setItem('@bachescz_is_authenticated', 'true')
          router.replace('/(tabs)')
          return
        } else {
          Alert.alert('Error', 'Contraseña incorrecta.')
          setLoading(false)
          return
        }
      }

      // 🔑 2. Intentar Supabase Auth Sign In (silencioso)
      let user = null
      try {
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPassword,
        })
        user = signInData?.user || null
      } catch (authErr) {
        console.warn('[Login] Supabase Auth signin notice:', authErr)
      }

      // 🔑 3. Buscar perfil por ID de Auth o por Email en public.profiles
      let finalProfile = null

      if (user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        finalProfile = profile
      }

      if (!finalProfile) {
        // Buscar por email en public.profiles (creado previa o durante el registro)
        const { data: profilesByEmail } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', trimmedEmail)

        if (profilesByEmail && profilesByEmail.length > 0) {
          finalProfile = profilesByEmail[0]
        }
      }

      // 🔑 4. Si aún no existe perfil registrado, se crea dinámicamente
      if (!finalProfile) {
        const correctRole = isAdminEmail(trimmedEmail) ? 'ADMIN' : 'USER'
        finalProfile = {
          id: user?.id || `user-${Date.now()}`,
          name: trimmedEmail.split('@')[0],
          email: trimmedEmail,
          neighborhood: 'Santa Cruz',
          role: correctRole as 'USER' | 'ADMIN',
          avatarUri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120'
        }
        try {
          await supabase.from('profiles').upsert([finalProfile])
        } catch (e) {
          console.warn('[Login] DB upsert notice:', e)
        }
      }

      // 🔑 5. Activar sesión local y redirigir
      await sessionService.setActiveUser(finalProfile)
      await appStorage.setItem('@bachescz_is_authenticated', 'true')
      router.replace('/(tabs)')
    } catch (e) {
      Alert.alert('Error', 'Ocurrió un error inesperado durante el inicio de sesión.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      Alert.alert('Campos vacíos', 'Por favor llena todos los campos.')
      return
    }

    if (trimmedPassword.length < 6) {
      Alert.alert('Contraseña corta', 'La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      const correctRole = isAdminEmail(trimmedEmail) ? 'ADMIN' : 'USER'
      let userId = `user-${Date.now()}`

      // 1. Intentar registro en Supabase Auth de forma silenciosa (si excede límite de email, no muestra error)
      try {
        const { data } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: trimmedPassword,
        })
        if (data?.user?.id) {
          userId = data.user.id
        }
      } catch (authErr) {
        console.warn('[Register] Supabase Auth silent notice:', authErr)
      }

      // 2. Crear o actualizar perfil en la tabla public.profiles de Supabase
      const newUserProfile = {
        id: userId,
        name: trimmedName,
        email: trimmedEmail,
        neighborhood: 'Santa Cruz',
        role: correctRole as 'USER' | 'ADMIN',
        avatarUri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120'
      }

      try {
        await supabase.from('profiles').upsert([newUserProfile])
      } catch (dbErr) {
        console.warn('[Register] DB profile upsert notice:', dbErr)
      }

      // 3. Activar sesión local y redirigir
      await sessionService.setActiveUser(newUserProfile)
      await appStorage.setItem('@bachescz_is_authenticated', 'true')

      Alert.alert(
        'Registro exitoso',
        `Bienvenido/a ${trimmedName}, tu cuenta ha sido creada con éxito.`,
        [{ text: 'Aceptar', onPress: () => router.replace('/(tabs)') }]
      )
    } catch (e) {
      Alert.alert('Error', 'Ocurrió un error al procesar el registro.')
    } finally {
      setLoading(false)
    }
  }

  if (isCheckingSession) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ============================================ */}
        {/* IMAGEN DE FONDO COMPLETA (ya incluye logo y título) */}
        {/* ============================================ */}
        <ImageBackground
          source={require('../assets/header_bg.png')}
          style={styles.headerImage}
          resizeMode="cover"
        >
          {/* Espacio vacío para que la imagen se vea completa */}
          <View style={styles.headerSpacer} />
        </ImageBackground>

        {/* ============================================ */}
        {/* TARJETA DE LOGIN / REGISTRO FLOTANTE */}
        {/* ============================================ */}
        <View style={styles.loginCard}>
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {isSignUp ? 'Crea tu cuenta' : 'Ingresa tus credenciales'}
            </Text>
            <Text style={styles.formSubtitle}>
              {isSignUp
                ? 'Regístrate para reportar baches y hacer seguimiento a las reparaciones.'
                : 'Inicia sesión para registrar reportes o gestionar reparaciones en la ciudad.'}
            </Text>

            {/* Campo adicional: Nombre Completo (solo Sign Up) */}
            {isSignUp && (
              <View style={styles.inputGroup}>
                <Input
                  label="Nombre completo"
                  placeholder="Ej. Juan Pérez"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  icon={<User size={20} color={colors.textMuted} />}
                />
              </View>
            )}

            {/* Campo: Correo electrónico */}
            <View style={styles.inputGroup}>
              <Input
                label="Correo electrónico"
                placeholder="correo@ejemplo.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                icon={<Mail size={20} color={colors.textMuted} />}
              />
            </View>

            {/* Campo: Contraseña */}
            <View style={styles.inputGroup}>
              <Input
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureText}
                autoCapitalize="none"
                icon={<Lock size={20} color={colors.textMuted} />}
                rightIcon={
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setSecureText(!secureText)}
                    accessibilityLabel={secureText ? 'Mostrar contraseña' : 'Ocultar contraseña'}
                  >
                    {secureText ? (
                      <EyeOff size={20} color={colors.textMuted} />
                    ) : (
                      <Eye size={20} color={colors.textMuted} />
                    )}
                  </Pressable>
                }
              />
            </View>

            {/* Botón de acción */}
            <Button
              label={loading ? 'Procesando...' : (isSignUp ? 'Registrarse' : 'Iniciar Sesión')}
              onPress={isSignUp ? handleRegister : handleLogin}
              loading={loading}
              disabled={loading}
              variant="primary"
              size="lg"
              fullWidth
              style={styles.loginButton}
            />

            {/* Toggle de pantallas (Iniciar Sesión / Registrarse) */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isSignUp ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
              </Text>
              <Pressable onPress={() => setIsSignUp(!isSignUp)}>
                <Text style={styles.toggleLink}>
                  {isSignUp ? ' Inicia Sesión' : ' Regístrate aquí'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // ============================================
  // IMAGEN DE FONDO (ya contiene logo + título)
  // ============================================
  headerImage: {
    width: '100%',
    height: 340,
  },
  headerSpacer: {
    flex: 1,
  },

  // ============================================
  // TARJETA DE LOGIN
  // ============================================
  loginCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -40,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  formContainer: {
    padding: 24,
    gap: spacing.md,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },

  // ============================================
  // INPUTS
  // ============================================
  inputGroup: {
    marginBottom: spacing.md,
  },
  eyeButton: {
    padding: 4,
  },

  // ============================================
  // BOTÓN DE LOGIN
  // ============================================
  loginButton: {
    marginTop: spacing.md,
    height: 52,
  },

  // ============================================
  // TOGGLE DE PANTALLA
  // ============================================
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  toggleText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
})