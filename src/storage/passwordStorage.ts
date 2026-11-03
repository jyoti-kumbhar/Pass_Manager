import AsyncStorage from '@react-native-async-storage/async-storage';
import { PasswordItem, ThemeMode } from '../types';

const PASSWORDS_STORAGE_KEY = '@passwords_data_v1';
const THEME_STORAGE_KEY = '@app_theme_mode_v1';

export const passwordStorage = {
  // Load all passwords
  async getPasswords(): Promise<PasswordItem[]> {
    try {
      const data = await AsyncStorage.getItem(PASSWORDS_STORAGE_KEY);
      if (!data) return [];
      const parsed: PasswordItem[] = JSON.parse(data);
      // Sort newest first
      return parsed.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (error) {
      console.error('Error reading passwords from AsyncStorage', error);
      return [];
    }
  },

  // Save new password
  async createPassword(
    item: Omit<PasswordItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PasswordItem> {
    const list = await this.getPasswords();
    const now = Date.now();
    const newItem: PasswordItem = {
      ...item,
      id: now.toString() + '_' + Math.random().toString(36).substring(2, 9),
      createdAt: now,
      updatedAt: now,
    };

    const updatedList = [newItem, ...list];
    await AsyncStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(updatedList));
    return newItem;
  },

  // Update existing password
  async updatePassword(item: PasswordItem): Promise<PasswordItem> {
    const list = await this.getPasswords();
    const now = Date.now();
    const updatedItem: PasswordItem = {
      ...item,
      updatedAt: now,
    };

    const updatedList = list.map((p) => (p.id === item.id ? updatedItem : p));
    await AsyncStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(updatedList));
    return updatedItem;
  },

  // Delete password
  async deletePassword(id: string): Promise<void> {
    const list = await this.getPasswords();
    const filtered = list.filter((p) => p.id !== id);
    await AsyncStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(filtered));
  },

  // Theme Persistence
  async getSavedTheme(): Promise<ThemeMode | null> {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      return saved === 'dark' || saved === 'light' ? saved : null;
    } catch {
      return null;
    }
  },

  async saveTheme(theme: ThemeMode): Promise<void> {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.error('Error saving theme', error);
    }
  },
};
