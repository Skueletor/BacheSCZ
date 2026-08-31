import { Tabs } from 'expo-router'
import {
  ClipboardList,
  Home,
  MapPin,
  User,
} from 'lucide-react-native'
import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../../src/theme'

export default function TabsLayout() {
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.select({
            ios: 58 + insets.bottom,
            android: 62 + insets.bottom,
            default: 62 + insets.bottom,
          }),
          paddingTop: 6,
          paddingBottom: Platform.select({
            ios: insets.bottom > 0 ? insets.bottom : 6,
            android: 8 + insets.bottom,
            default: 8 + insets.bottom,
          }),
          elevation: 4,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <Home size={21} color={color} strokeWidth={focused ? 2.5 : 1.75} />
          ),
        }}
      />
      <Tabs.Screen
        name="reportes"
        options={{
          title: 'Reportes',
          tabBarLabel: 'Reportes',
          tabBarIcon: ({ color, focused }) => (
            <ClipboardList size={21} color={color} strokeWidth={focused ? 2.5 : 1.75} />
          ),
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          tabBarLabel: 'Mapa',
          tabBarIcon: ({ color, focused }) => (
            <MapPin size={21} color={color} strokeWidth={focused ? 2.5 : 1.75} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <User size={21} color={color} strokeWidth={focused ? 2.5 : 1.75} />
          ),
        }}
      />
    </Tabs>
  )
}
