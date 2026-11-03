import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Category, PasswordItem } from '../types';
import { useAppTheme } from '../theme/ThemeContext';
import { GeneratorModal } from './GeneratorModal';

interface PasswordModalProps {
  visible: boolean;
  item: PasswordItem | null;
  onClose: () => void;
  onSave: (data: {
    title: string;
    username: string;
    password: string;
    category: Exclude<Category, 'All'>;
    website?: string;
    notes?: string;
  }) => void;
  onDelete?: (id: string) => void;
  onCopied: (msg: string) => void;
}

const CATEGORIES: Exclude<Category, 'All'>[] = ['General', 'Work', 'Personal', 'Finance', 'Social'];

export const PasswordModal: React.FC<PasswordModalProps> = ({
  visible,
  item,
  onClose,
  onSave,
  onDelete,
  onCopied,
}) => {
  const { colors } = useAppTheme();

  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState<Exclude<Category, 'All'>>('General');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [generatorVisible, setGeneratorVisible] = useState(false);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setUsername(item.username);
      setPassword(item.password);
      setCategory(item.category);
      setWebsite(item.website || '');
      setNotes(item.notes || '');
    } else {
      setTitle('');
      setUsername('');
      setPassword('');
      setCategory('General');
      setWebsite('');
      setNotes('');
    }
    setShowPassword(false);
  }, [item, visible]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter an account or service name.');
      return;
    }
    if (!password) {
      Alert.alert('Required', 'Please enter or generate a password.');
      return;
    }

    onSave({
      title: title.trim(),
      username: username.trim(),
      password,
      category,
      website: website.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    if (!item || !onDelete) return;
    Alert.alert(
      'Delete Entry',
      `Are you sure you want to delete "${item.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(item.id);
            onClose();
          },
        },
      ]
    );
  };

  const copyPasswordToClipboard = async () => {
    if (!password) return;
    await Clipboard.setStringAsync(password);
    onCopied('Password copied!');
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.overlay}
        >
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                {item ? 'Edit Password' : 'Add New Password'}
              </Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
              {/* Category selector */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryRow}
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          {
                            color: isSelected ? '#FFFFFF' : colors.textSecondary,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Title Input */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Account / Website Name *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="e.g. Google, GitHub, Netflix"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />

              {/* Username Input */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>Username / Email</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="e.g. user@example.com"
                placeholderTextColor={colors.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              {/* Password Input with Generate and Eye */}
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 0 }]}>
                  Password *
                </Text>
                <TouchableOpacity
                  style={styles.generateLink}
                  onPress={() => setGeneratorVisible(true)}
                >
                  <Ionicons name="sparkles" size={14} color={colors.primary} />
                  <Text style={[styles.generateLinkText, { color: colors.primary }]}>
                    Generate Strong
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.passwordContainer,
                  { backgroundColor: colors.inputBg, borderColor: colors.border },
                ]}
              >
                <TextInput
                  style={[styles.passwordInput, { color: colors.textPrimary }]}
                  placeholder="Enter or generate password"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.actionIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                {password.length > 0 && (
                  <TouchableOpacity
                    style={styles.actionIcon}
                    onPress={copyPasswordToClipboard}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="copy-outline" size={18} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Website Input */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Website URL (Optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="https://..."
                placeholderTextColor={colors.textMuted}
                value={website}
                onChangeText={setWebsite}
                autoCapitalize="none"
                keyboardType="url"
              />

              {/* Notes Input */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>Notes (Optional)</Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="Additional info, security questions, etc."
                placeholderTextColor={colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              {/* Action Buttons */}
              <View style={styles.bottomButtons}>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                  onPress={handleSave}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>
                    {item ? 'Save Changes' : 'Save Password'}
                  </Text>
                </TouchableOpacity>

                {item && onDelete && (
                  <TouchableOpacity
                    style={[
                      styles.deleteBtn,
                      { backgroundColor: colors.dangerLight, borderColor: colors.danger },
                    ]}
                    onPress={handleDelete}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    <Text style={[styles.deleteBtnText, { color: colors.danger }]}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Embedded Password Generator modal */}
      <GeneratorModal
        visible={generatorVisible}
        onClose={() => setGeneratorVisible(false)}
        onSelectPassword={(pwd) => {
          setPassword(pwd);
          setShowPassword(true);
        }}
        onCopied={onCopied}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: '90%',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  scroll: {
    paddingBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  generateLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  generateLinkText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  actionIcon: {
    padding: 6,
    marginLeft: 4,
  },
  textArea: {
    minHeight: 70,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
  },
  bottomButtons: {
    marginTop: 22,
    gap: 10,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  deleteBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
