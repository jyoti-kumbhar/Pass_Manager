import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeContext';

interface HeaderProps {
  itemCount: number;
}

export const Header: React.FC<HeaderProps> = ({ itemCount }) => {
  const { colors, isDark, toggleTheme } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.leftContainer}>
        <View style={[styles.iconWrapper, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
        </View>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>PassLock</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {itemCount} {itemCount === 1 ? 'account' : 'accounts'} saved
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.themeButton,
          { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
        ]}
        onPress={toggleTheme}
        activeOpacity={0.7}
        accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <Ionicons
          name={isDark ? 'sunny' : 'moon'}
          size={20}
          color={isDark ? '#FBBF24' : colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 1,
  },
  themeButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});
