export interface GeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export const generatePassword = (options: GeneratorOptions): string => {
  let charPool = '';
  const mandatoryChars: string[] = [];

  if (options.includeUppercase) {
    charPool += UPPERCASE_CHARS;
    mandatoryChars.push(UPPERCASE_CHARS[Math.floor(Math.random() * UPPERCASE_CHARS.length)]);
  }
  if (options.includeLowercase) {
    charPool += LOWERCASE_CHARS;
    mandatoryChars.push(LOWERCASE_CHARS[Math.floor(Math.random() * LOWERCASE_CHARS.length)]);
  }
  if (options.includeNumbers) {
    charPool += NUMBER_CHARS;
    mandatoryChars.push(NUMBER_CHARS[Math.floor(Math.random() * NUMBER_CHARS.length)]);
  }
  if (options.includeSymbols) {
    charPool += SYMBOL_CHARS;
    mandatoryChars.push(SYMBOL_CHARS[Math.floor(Math.random() * SYMBOL_CHARS.length)]);
  }

  // Fallback if none selected
  if (!charPool) {
    charPool = LOWERCASE_CHARS + NUMBER_CHARS;
  }

  const generatedChars: string[] = [...mandatoryChars];
  const remainingLength = Math.max(0, options.length - mandatoryChars.length);

  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = Math.floor(Math.random() * charPool.length);
    generatedChars.push(charPool[randomIndex]);
  }

  // Shuffle array using Fisher-Yates
  for (let i = generatedChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [generatedChars[i], generatedChars[j]] = [generatedChars[j], generatedChars[i]];
  }

  return generatedChars.join('');
};

export interface PasswordStrength {
  score: 1 | 2 | 3 | 4;
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
}

export const evaluatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return { score: 1, label: 'Weak', color: '#EF4444' };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 14) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: '#EF4444' };
  if (score === 2) return { score: 2, label: 'Fair', color: '#F59E0B' };
  if (score === 3 || score === 4) return { score: 3, label: 'Good', color: '#10B981' };
  return { score: 4, label: 'Strong', color: '#059669' };
};
