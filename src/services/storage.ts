import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

/**
 * In-memory store used as a reliable fallback
 */
const inMemoryStore = new Map<string, string>()

let isNativeStorageAvailable: boolean | null = null

/**
 * Resilient Storage Adapter
 * Automatically and silently manages storage across:
 * 1. Web LocalStorage (in browser)
 * 2. Native AsyncStorage (when native binary is linked)
 * 3. In-memory Store (zero-crash fallback)
 */
export const appStorage = {
  async getItem(key: string): Promise<string | null> {
    // 1. Web browser localStorage
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(key)
      } catch {
        // Fall through to memory store
      }
    }

    // 2. Native AsyncStorage (only if native module is available)
    if (isNativeStorageAvailable !== false) {
      try {
        if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
          const val = await AsyncStorage.getItem(key)
          isNativeStorageAvailable = true
          if (val !== null) {
            inMemoryStore.set(key, val)
            return val
          }
        }
      } catch {
        // Flag as false to avoid repeated attempts
        isNativeStorageAvailable = false
      }
    }

    // 3. In-memory store
    return inMemoryStore.get(key) || null
  },

  async setItem(key: string, value: string): Promise<void> {
    inMemoryStore.set(key, value)

    // 1. Web browser localStorage
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, value)
        return
      } catch {
        // Fall through
      }
    }

    // 2. Native AsyncStorage
    if (isNativeStorageAvailable !== false) {
      try {
        if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
          await AsyncStorage.setItem(key, value)
          isNativeStorageAvailable = true
        }
      } catch {
        isNativeStorageAvailable = false
      }
    }
  },

  async removeItem(key: string): Promise<void> {
    inMemoryStore.delete(key)

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key)
      } catch {}
    }

    if (isNativeStorageAvailable !== false) {
      try {
        if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
          await AsyncStorage.removeItem(key)
        }
      } catch {
        isNativeStorageAvailable = false
      }
    }
  },
}
