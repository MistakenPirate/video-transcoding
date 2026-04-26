import React, { useState } from 'react';
import { StyleSheet, Text, TextInput as RNTextInput, type TextInputProps, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export function TextInput({ label, error, style, ...rest }: Props) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {label.toUpperCase()}
      </Text>
      <RNTextInput
        style={[
          styles.input,
          {
            color: theme.text,
            borderBottomColor: error
              ? theme.error
              : focused
                ? theme.primary
                : theme.border,
            borderBottomWidth: focused ? 2 : 1,
          },
          style,
        ]}
        placeholderTextColor={theme.textSecondary}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        {...rest}
      />
      {error ? (
        <Text style={[styles.error, { color: theme.error }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 6,
  },
  input: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
