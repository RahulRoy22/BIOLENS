import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, ROUNDING } from '../constants/theme';

interface Props {
  title: string;
  subtitle?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const ActionButton: React.FC<Props> = ({
  title,
  subtitle,
  onPress,
  variant = 'primary',
  disabled = false,
}) => {
  const backgroundColor =
    variant === 'primary' ? COLORS.primary : COLORS.bgCard;
  const textColor = variant === 'primary' ? COLORS.textLight : COLORS.textDark;
  const borderColor = variant === 'primary' ? COLORS.primary : COLORS.border;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor, borderColor },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: textColor, opacity: 0.8 }]}>
          {subtitle}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: ROUNDING.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
