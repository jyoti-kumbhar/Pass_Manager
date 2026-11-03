import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useAppTheme } from '../theme/ThemeContext';
import {
  generatePassword,
  evaluatePasswordStrength,
  GeneratorOptions,
} from '../utils/passwordGenerator';

interface GeneratorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPassword: (password: string) => void;
  onCopied: (msg: string) => void;
}

export const GeneratorModal: React.FC<GeneratorModalProps> = ({
  visible,
  onClose,
  onSelectPassword,
  onCopied,
}) => {
  const { colors } = useAppTheme();
  const [length, setLength] = useState<number>(16);
  const [options, setOptions] = useState<Omit<GeneratorOptions, 'length'>>({
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
  });
  const [generated, setGenerated] = useState<string>('');

  const regenerate = () => {
    const pwd = generatePassword({
      length,
      ...options,
    });
    setGenerated(pwd);
  };

  useEffect(() => {
    if (visible) {
      regenerate();
    }
  }, [visible, length, options]);

  const toggleOption = (key: keyof typeof options) => {
    // Prevent unchecking all options
    const activeCount = Object.values(options).filter(Boolean).length;
    if (options[key] && activeCount === 1) return;

    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCopy = async () => {
    if (!generated) return;
    await Clipboard.setStringAsync(generated);
    onCopied('Generated password copied!');
  };

  const handleApply = () => {
    onSelectPassword(generated);
    onClose();
  };

  const strength = evaluatePasswordStrength(generated);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Ionicons name="key" size={20} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Password Generator
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Generated Result Box */}
          <View
            style={[
              styles.previewBox,
              { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.generatedText, { color: colors.textPrimary }]} numberOfLines={2}>
              {generated}
            </Text>
            <TouchableOpacity
              style={[styles.refreshBtn, { backgroundColor: colors.surface }]}
              onPress={regenerate}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="refresh" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Strength Indicator */}
          <View style={styles.strengthRow}>
            <Text style={[styles.strengthLabel, { color: colors.textSecondary }]}>Strength:</Text>
            <View style={styles.strengthBars}>
              {[1, 2, 3, 4].map((step) => (
                <View
                  key={step}
                  style={[
                    styles.bar,
                    {
                      backgroundColor:
                        step <= strength.score ? strength.color : colors.border,
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.strengthText, { color: strength.color }]}>
              {strength.label}
            </Text>
          </View>

          {/* Length Stepper */}
          <View style={styles.lengthSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Length: <Text style={{ color: colors.primary, fontWeight: '700' }}>{length}</Text>
            </Text>
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={[
                  styles.stepBtn,
                  { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
                ]}
                onPress={() => setLength((l) => Math.max(8, l - 1))}
                disabled={length <= 8}
              >
                <Ionicons name="remove" size={18} color={length <= 8 ? colors.textMuted : colors.textPrimary} />
              </TouchableOpacity>

              <View style={styles.lengthQuickPills}>
                {[12, 16, 20, 24].map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[
                      styles.quickPill,
                      {
                        backgroundColor: length === val ? colors.primary : colors.surfaceVariant,
                      },
                    ]}
                    onPress={() => setLength(val)}
                  >
                    <Text
                      style={[
                        styles.quickPillText,
                        { color: length === val ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {val}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.stepBtn,
                  { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
                ]}
                onPress={() => setLength((l) => Math.min(32, l + 1))}
                disabled={length >= 32}
              >
                <Ionicons name="add" size={18} color={length >= 32 ? colors.textMuted : colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Character Options */}
          <View style={styles.optionsGrid}>
            <OptionToggle
              label="Uppercase (A-Z)"
              checked={options.includeUppercase}
              onPress={() => toggleOption('includeUppercase')}
            />
            <OptionToggle
              label="Lowercase (a-z)"
              checked={options.includeLowercase}
              onPress={() => toggleOption('includeLowercase')}
            />
            <OptionToggle
              label="Numbers (0-9)"
              checked={options.includeNumbers}
              onPress={() => toggleOption('includeNumbers')}
            />
            <OptionToggle
              label="Symbols (!@#$)"
              checked={options.includeSymbols}
              onPress={() => toggleOption('includeSymbols')}
            />
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.copyButton,
                { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
              ]}
              onPress={handleCopy}
            >
              <Ionicons name="copy-outline" size={18} color={colors.textPrimary} />
              <Text style={[styles.copyButtonText, { color: colors.textPrimary }]}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Use Password</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

interface OptionToggleProps {
  label: string;
  checked: boolean;
  onPress: () => void;
}

const OptionToggle: React.FC<OptionToggleProps> = ({ label, checked, onPress }) => {
  const { colors } = useAppTheme();
  return (
    <TouchableOpacity
      style={[
        styles.toggleCard,
        {
          backgroundColor: checked ? colors.primaryLight : colors.surfaceVariant,
          borderColor: checked ? colors.primary : colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={checked ? 'checkbox' : 'square-outline'}
        size={18}
        color={checked ? colors.primary : colors.textMuted}
      />
      <Text
        style={[
          styles.toggleLabel,
          { color: checked ? colors.primary : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  previewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  generatedText: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
    letterSpacing: 0.5,
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  bar: {
    height: 4,
    flex: 1,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '700',
  },
  lengthSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lengthQuickPills: {
    flexDirection: 'row',
    gap: 8,
  },
  quickPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  quickPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    width: '48%',
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  copyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  copyButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
