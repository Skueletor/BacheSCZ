import { appStorage } from './storage'
import { User } from '../types/domain'

const ACTIVE_USER_KEY = '@bachescz_active_user_id'

export const USERS: Record<string, User> = {
  'vecino-scz': {
    id: 'vecino-scz',
    name: 'Vecino Vigilante SCZ',
    email: 'vecino@santacruz.gob.bo',
    neighborhood: 'Casco Viejo',
    role: 'USER',
    avatarUri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120',
  },
  'admin-alcaldia': {
    id: 'admin-alcaldia',
    name: 'Administrador Alcaldía',
    email: 'admin@santacruz.gob.bo',
    neighborhood: 'Centro',
    role: 'ADMIN',
    avatarUri: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=120',
  },
}

export const sessionService = {
  async getActiveUser(): Promise<User> {
    try {
      const savedValue = await appStorage.getItem(ACTIVE_USER_KEY)
      if (savedValue) {
        // If it looks like a JSON object, parse it
        if (savedValue.startsWith('{')) {
          return JSON.parse(savedValue) as User
        }
        // Otherwise, look it up in local users mapping
        if (USERS[savedValue]) {
          return USERS[savedValue]
        }
      }
    } catch (e) {
      console.warn('[sessionService] Failed to read active user from storage, defaulting to citizen:', e)
    }
    return USERS['vecino-scz']
  },

  async setActiveUser(userOrId: 'vecino-scz' | 'admin-alcaldia' | User): Promise<User> {
    try {
      if (typeof userOrId === 'string') {
        await appStorage.setItem(ACTIVE_USER_KEY, userOrId)
        return USERS[userOrId]
      } else {
        await appStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(userOrId))
        return userOrId
      }
    } catch (e) {
      console.warn('[sessionService] Failed to save active user to storage:', e)
    }
    return typeof userOrId === 'string' ? USERS[userOrId] : userOrId
  },

  async logout(): Promise<void> {
    try {
      await appStorage.removeItem(ACTIVE_USER_KEY)
      await appStorage.removeItem('@bachescz_is_authenticated')
    } catch (e) {
      console.warn('[sessionService] Logout error:', e)
    }
  }
}
