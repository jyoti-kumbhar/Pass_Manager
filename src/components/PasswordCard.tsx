import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { PasswordItem } from '../types';
import { useAppTheme } from '../theme/ThemeContext';

interface PasswordCardProps {
  item: PasswordItem;
  onPress: (item: PasswordItem) => void;
  onCopied: (label: string) => void;
}

export const PasswordCard: React.FC<PasswordCardProps> = ({ item, onPress, onCopied }) => {
  const { colors } = useAppTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(item.password);
    setCopied(true);
    onCopied(`Password for ${item.title} copied!`);
    setTimeout(() => {
      setCopied(false);
    }, 1800);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Work':
        return '#3B82F6'; // Blue
      case 'Finance':
        return '#10B981'; // Green
      case 'Social':
        return '#EC4899'; // Pink
      case 'Personal':
        return '#F59E0B'; // Amber
      default:
        return '#8B5CF6'; // Purple
    }
  };

  const catColor = getCategoryColor(item.category);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleArea}>
          <View style={[styles.avatarBadge, { backgroundColor: catColor + '20' }]}>
            <Text style={[styles.avatarText, { color: catColor }]}>
              {item.title.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.username, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.username}
            </Text>
          </View>
        </View>

        <View style={[styles.categoryBadge, { backgroundColor: catColor + '15' }]}>
          <Text style={[styles.categoryBadgeText, { color: catColor }]}>{item.category}</Text>
        </View>
      </View>

      <View style={[styles.passwordBox, { backgroundColor: colors.surfaceVariant }]}>
        <Text
          style={[
            styles.passwordText,
            {
              color: colors.textPrimary,
              fontFamily: showPassword ? undefined : 'Courier',
              letterSpacing: showPassword ? 0 : 2,
            },
          ]}
          numberOfLines={1}
        >
          {showPassword ? item.password : '••••••••••••'}
        </Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.copyBtn, copied && { backgroundColor: colors.successLight }]}
            onPress={handleCopy}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Copy password"
          >
            <Ionicons
              name={copied ? 'checkmark' : 'copy-outline'}
              size={17}
              color={copied ? colors.success : colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatarBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  infoCol: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  username: {
    fontSize: 13,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  passwordBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  passwordText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
  },
  copyBtn: {
    padding: 6,
    borderRadius: 8,
  },
});
