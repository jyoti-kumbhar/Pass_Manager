import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';
import { passwordStorage } from './src/storage/passwordStorage';
import { PasswordItem, Category } from './src/types';
import { Header } from './src/components/Header';
import { SearchBar } from './src/components/SearchBar';
import { PasswordCard } from './src/components/PasswordCard';
import { PasswordModal } from './src/components/PasswordModal';
import { Toast } from './src/components/Toast';

function MainApp() {
  const { colors, isDark } = useAppTheme();
  const [passwords, setPasswords] = useState<PasswordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<PasswordItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load passwords from AsyncStorage
  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await passwordStorage.getPasswords();
    setPasswords(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter passwords based on search query
  const filteredPasswords = useMemo(() => {
    if (!searchQuery.trim()) return passwords;
    const query = searchQuery.toLowerCase();
    return passwords.filter((item) => {
      return (
        item.title.toLowerCase().includes(query) ||
        item.username.toLowerCase().includes(query) ||
        (item.website && item.website.toLowerCase().includes(query))
      );
    });
  }, [passwords, searchQuery]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (item: PasswordItem) => {
    setEditingItem(item);
    setModalVisible(true);
  };

  const handleSave = async (data: {
    title: string;
    username: string;
    password: string;
    category: Exclude<Category, 'All'>;
    website?: string;
    notes?: string;
  }) => {
    if (editingItem) {
      const updated = await passwordStorage.updatePassword({
        ...editingItem,
        ...data,
      });
      setPasswords((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setToastMessage('Password updated successfully!');
    } else {
      const created = await passwordStorage.createPassword(data);
      setPasswords((prev) => [created, ...prev]);
      setToastMessage('Password saved successfully!');
    }
  };

  const handleDelete = async (id: string) => {
    await passwordStorage.deletePassword(id);
    setPasswords((prev) => prev.filter((p) => p.id !== id));
    setToastMessage('Password deleted');
  };

  const handleToastNotify = (msg: string) => {
    setToastMessage(msg);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ExpoStatusBar style={isDark ? 'light' : 'dark'} />
      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />

      {/* App Header */}
      <Header itemCount={passwords.length} />

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
      />

      {/* Main Content / Password List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredPasswords}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <PasswordCard
              item={item}
              onPress={handleOpenEdit}
              onCopied={handleToastNotify}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconBg, { backgroundColor: colors.surfaceVariant }]}>
                <Ionicons
                  name={searchQuery ? 'search-outline' : 'lock-closed-outline'}
                  size={36}
                  color={colors.textMuted}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                {searchQuery ? 'No matching passwords' : 'No passwords yet'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {searchQuery
                  ? 'Try a different search keyword'
                  : 'Tap the + button below to securely store your first password locally.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button (Add) */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleOpenAdd}
        activeOpacity={0.8}
        accessibilityLabel="Add new password"
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add / Edit Modal */}
      <PasswordModal
        visible={modalVisible}
        item={editingItem}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        onCopied={handleToastNotify}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 90,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
