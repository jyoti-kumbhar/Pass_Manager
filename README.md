# 🔐 PassLock — Offline Expo Password Manager

A minimalist, high-performance, and privacy-focused password manager built with **React Native** and **Expo**.

- **No Remote Database**: 100% offline and local-first data storage.
- **No Login / Account Required**: Instant frictionless access directly to your passwords.
- **Dark & Light Mode**: Seamless theme switching with manual toggle and system appearance detection.
- **Simple, Modern UI**: Designed with clean typography, card layouts, category filters, and intuitive controls.
- **Built-in Password Generator**: Customizable length, character pools, and real-time password strength indicator.
- **One-Tap Copy & Feedback**: Instant clipboard copying with smooth visual feedback toasts.

---

## 📑 Table of Contents

1. [Architecture & Data Flow](#-architecture--data-flow)
2. [Features Breakdown](#-features-breakdown)
3. [File Tree](#-file-tree)
4. [Getting Started & Installation](#-getting-started--installation)
5. [Core Implementation Details](#-core-implementation-details)
   - [Data Storage Layer (`AsyncStorage`)](#1-storage-layer-srcstoragepasswordstoragets)
   - [Dark / Light Theme Context](#2-theme-context-srcthemethemecontexttsx)
   - [Password Generator & Strength Meter](#3-password-generator-srcutilspasswordgeneratorts)
   - [Component Hierarchy](#4-components)
6. [Security Best Practices](#-security--privacy-notes)
7. [Running & Building the App](#-running--building-the-app)

---

## 🏗 Architecture & Data Flow

PassLock operates completely on-device without any cloud dependencies or analytics tracking.

```mermaid
flowchart TD
    User([User]) -->|Interact| UI[App UI / React Native Components]
    UI -->|Toggle Theme| ThemeCtx[ThemeContext]
    ThemeCtx -->|Save Preference| Storage[(Device Local Storage: AsyncStorage)]
    
    UI -->|Search & Filter| FilterEngine[Filter & Search Engine]
    UI -->|Add / Edit / Delete| StorageService[passwordStorage Service]
    UI -->|Generate Password| PwdGen[passwordGenerator Utility]
    UI -->|One-Tap Copy| Clipboard[expo-clipboard API]
    
    StorageService <-->|JSON Serialization| Storage
    StorageService -->|Reactive State Update| UI
```

### Component Structure

```mermaid
graph TD
    App[App.tsx]
    App --> ThemeProvider[ThemeProvider]
    App --> Toast[Toast Notification]
    App --> Header[Header: Title & Dark Mode Switcher]
    App --> SearchBar[SearchBar: Real-time Query Filter]
    App --> CategoryFilter[CategoryFilter: All, Work, Finance, Social...]
    App --> FlatList[Password FlatList]
    FlatList --> PasswordCard[PasswordCard: Reveal, Copy, Category]
    App --> FAB[Floating Action Button (+)]
    App --> PasswordModal[PasswordModal: Add / Edit Form]
    PasswordModal --> GeneratorModal[GeneratorModal: Custom Password Engine]
```

---

## ✨ Features Breakdown

| Feature | Description |
| :--- | :--- |
| **Local-First Storage** | Stores credentials locally on the device using `@react-native-async-storage/async-storage`. No remote servers, no cloud leakage. |
| **No Login Friction** | Direct entry to credentials without login screens, internet checks, or master passwords. |
| **Dual Theme System** | Full Dark Mode and Light Mode support. Persists your theme preference across app relaunches and syncs with OS theme changes. |
| **Masked Security** | Passwords are hidden by default (`••••••••••••`) with one-tap show/hide toggle. |
| **1-Click Copy** | One-tap button copies password directly into the system clipboard with an animated checkmark and floating confirmation toast. |
| **Custom Generator** | Create strong random passwords with custom lengths (8–32) and character sets (A-Z, a-z, 0-9, symbols). |
| **Strength Analyzer** | Evaluates password complexity in real-time (Weak, Fair, Good, Strong) with color-coded meters. |
| **Categorization & Search** | Instant filter by category tags (Work, Personal, Finance, Social, General) or full-text query. |

---

## 📁 File Tree

```text
passwordManager/
├── App.tsx                          # Root application & state coordination
├── app.json                         # Expo configuration
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript compiler configuration
├── README.md                        # Documentation & setup guide
└── src/
    ├── types/
    │   └── index.ts                 # TypeScript models (PasswordItem, Theme, Category)
    ├── theme/
    │   ├── colors.ts                # Light & Dark color definitions
    │   └── ThemeContext.tsx         # Theme provider & hook (useAppTheme)
    ├── storage/
    │   └── passwordStorage.ts       # Local storage CRUD operations
    ├── utils/
    │   └── passwordGenerator.ts     # Password generation & strength evaluator
    └── components/
        ├── Header.tsx               # App bar with counter & theme toggle button
        ├── SearchBar.tsx            # Clean search input with quick clear
        ├── CategoryFilter.tsx       # Horizontal scrolling category filter pills
        ├── PasswordCard.tsx         # Password list card with show/hide and copy
        ├── PasswordModal.tsx        # Add/Edit bottom sheet modal
        ├── GeneratorModal.tsx       # Interactive password generator dialog
        └── Toast.tsx                # Floating notification banner
```

---

## 🚀 Getting Started & Installation

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** or **yarn** / **pnpm**
- **Expo Go** app on your physical iOS or Android phone (or an emulator/simulator)

### 2. Install Dependencies
Run the following command inside the project directory:

```bash
npm install
```

Installed packages:
- `expo`: React Native core framework.
- `@react-native-async-storage/async-storage`: Safe, local on-device key-value persistence.
- `expo-clipboard`: Native clipboard integration.
- `expo-status-bar`: Dynamic status bar style matching Dark / Light mode.
- `@expo/vector-icons`: Pre-bundled Ionicons.

---

## 💻 Core Implementation Details

### 1. Storage Layer (`src/storage/passwordStorage.ts`)
Manages reading, inserting, updating, and deleting credentials from the local device storage:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PasswordItem, ThemeMode } from '../types';

const PASSWORDS_STORAGE_KEY = '@passwords_data_v1';
const THEME_STORAGE_KEY = '@app_theme_mode_v1';

export const passwordStorage = {
  async getPasswords(): Promise<PasswordItem[]> {
    try {
      const data = await AsyncStorage.getItem(PASSWORDS_STORAGE_KEY);
      if (!data) return [];
      const parsed: PasswordItem[] = JSON.parse(data);
      return parsed.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (error) {
      console.error('Error reading passwords from AsyncStorage', error);
      return [];
    }
  },

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

  async deletePassword(id: string): Promise<void> {
    const list = await this.getPasswords();
    const filtered = list.filter((p) => p.id !== id);
    await AsyncStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(filtered));
  },

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
```

---

### 2. Theme Context (`src/theme/ThemeContext.tsx`)
Provides smooth toggling between Dark and Light mode. Automatically initializes from device settings and persists user choices.

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeColors, ThemeMode } from '../types';
import { darkColors, lightColors } from './colors';
import { passwordStorage } from '../storage/passwordStorage';

interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  colors: darkColors,
  isDark: true,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>(systemScheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    const initTheme = async () => {
      const saved = await passwordStorage.getSavedTheme();
      if (saved) {
        setThemeState(saved);
      } else if (systemScheme) {
        setThemeState(systemScheme === 'dark' ? 'dark' : 'light');
      }
    };
    initTheme();
  }, [systemScheme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    passwordStorage.saveTheme(mode);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
```

#### Color Palettes (`src/theme/colors.ts`)

| Token | Light Theme | Dark Theme | Purpose |
| :--- | :--- | :--- | :--- |
| `background` | `#F8FAFC` (Slate 50) | `#0B0F19` (Deep Obsidian) | Main app canvas |
| `surface` | `#FFFFFF` (Pure White) | `#151D2F` (Navy Surface) | Card and modal surfaces |
| `surfaceVariant` | `#F1F5F9` (Slate 100) | `#1E293B` (Slate 800) | Pill tags, secondary inputs |
| `primary` | `#4F46E5` (Indigo 600) | `#6366F1` (Indigo 500) | Primary buttons, active tabs |
| `textPrimary` | `#0F172A` (Slate 900) | `#F8FAFC` (Slate 50) | Main text & titles |
| `textSecondary` | `#475569` (Slate 600) | `#94A3B8` (Slate 400) | Subtitles, labels |
| `border` | `#E2E8F0` (Slate 200) | `#2A364F` (Slate 700) | Card and input borders |

---

### 3. Password Generator (`src/utils/passwordGenerator.ts`)
Generates cryptographically random passwords with Fisher-Yates shuffle and checks strength.

```typescript
export interface GeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

export const generatePassword = (options: GeneratorOptions): string => {
  let charPool = '';
  const mandatoryChars: string[] = [];

  if (options.includeUppercase) {
    charPool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    mandatoryChars.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]);
  }
  if (options.includeLowercase) {
    charPool += 'abcdefghijklmnopqrstuvwxyz';
    mandatoryChars.push('abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]);
  }
  if (options.includeNumbers) {
    charPool += '0123456789';
    mandatoryChars.push('0123456789'[Math.floor(Math.random() * 10)]);
  }
  if (options.includeSymbols) {
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    charPool += symbols;
    mandatoryChars.push(symbols[Math.floor(Math.random() * symbols.length)]);
  }

  if (!charPool) {
    charPool = 'abcdefghijklmnopqrstuvwxyz0123456789';
  }

  const generatedChars: string[] = [...mandatoryChars];
  const remainingLength = Math.max(0, options.length - mandatoryChars.length);

  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = Math.floor(Math.random() * charPool.length);
    generatedChars.push(charPool[randomIndex]);
  }

  // Fisher-Yates shuffle
  for (let i = generatedChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [generatedChars[i], generatedChars[j]] = [generatedChars[j], generatedChars[i]];
  }

  return generatedChars.join('');
};
```

---

### 4. Components

#### Password Card (`src/components/PasswordCard.tsx`)
- Displays account initial avatar, service title, category tag, and username.
- Obfuscates password with dots (`••••••••••••`).
- Eye icon enables instant viewing.
- Clipboard icon copies the string and gives immediate visual confirmation.

#### Password Add/Edit Modal (`src/components/PasswordModal.tsx`)
- Allows adding accounts, usernames, passwords, category selection, websites, and notes.
- Quick link opens the generator modal directly to populate a secure password.
- Safe deletion with native confirmation alert dialog.

#### Interactive Generator Modal (`src/components/GeneratorModal.tsx`)
- Stepper buttons and quick pills for lengths (12, 16, 20, 24).
- Toggles for Uppercase, Lowercase, Numbers, and Symbols.
- Real-time password strength meter (Weak, Fair, Good, Strong).
- "Use Password" button injects the generated password directly into the form.

---

## 🔒 Security & Privacy Notes

1. **Zero Network Transmission**:
   - The application does not communicate with external servers or databases.
   - Credentials never leave your physical device.

2. **Device Sandboxing**:
   - Android and iOS isolate `AsyncStorage` inside the app's private sandboxed directory. Other apps cannot read this data unless the device is rooted/jailbroken.

3. **Optional Hardening (Keychain / Hardware Keystore)**:
   - For additional hardware-backed encryption, you can integrate `expo-secure-store` or AES-256 encryption (`crypto-js`) using a local device salt if you ever require hardware-level key wrapping.

---

## 📲 Running & Building the App

### Start Development Server
```bash
npx expo start
```

### Run on Platforms
- **Android**: Press <kbd>a</kbd> in the terminal or scan QR with Expo Go.
- **iOS**: Press <kbd>i</kbd> in the terminal or scan QR with Camera app.
- **Web**: Press <kbd>w</kbd> in the terminal to view in your web browser.

### Creating Production Builds (APK / IPA)
Using Expo Application Services (EAS):

```bash
# Install EAS CLI
npm install -g eas-cli

# Login and build standalone Android APK
eas build -p android --profile preview
```

---

## 💡 Summary

PassLock gives you an uncluttered, responsive, and completely private password management experience with zero account sign-up and zero database configuration required.
