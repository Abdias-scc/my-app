import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AuthUser } from '../../types';
import { logger } from '../../utils/logger';

const SESSION_KEY = 'odoo_user_session';
const isWeb = Platform.OS === 'web';

export const sessionStorage = {
  save: async (user: AuthUser): Promise<void> => {
    try {
      const data = JSON.stringify(user);
      if (isWeb) {
        localStorage.setItem(SESSION_KEY, data);
      } else {
        await SecureStore.setItemAsync(SESSION_KEY, data);
      }
    } catch (error) {
      logger.error('Failed to save session', error);
      throw error;
    }
  },

  get: async (): Promise<AuthUser | null> => {
    try {
      let raw: string | null = null;
      if (isWeb) {
        raw = localStorage.getItem(SESSION_KEY);
      } else {
        raw = await SecureStore.getItemAsync(SESSION_KEY);
      }
      if (!raw) return null;
      return JSON.parse(raw) as AuthUser;
    } catch (error) {
      logger.error('Failed to read session', error);
      return null;
    }
  },

  clear: async (): Promise<void> => {
    try {
      if (isWeb) {
        localStorage.removeItem(SESSION_KEY);
      } else {
        await SecureStore.deleteItemAsync(SESSION_KEY);
      }
    } catch (error) {
      logger.error('Failed to clear session', error);
    }
  },
};