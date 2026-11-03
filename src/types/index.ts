export type Category = 'All' | 'General' | 'Work' | 'Personal' | 'Finance' | 'Social';

export interface PasswordItem {
  id: string;
  title: string;
  username: string;
  password: string;
  category: Exclude<Category, 'All'>;
  website?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceVariant: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  danger: string;
  dangerLight: string;
  success: string;
  successLight: string;
  card: string;
  inputBg: string;
}
