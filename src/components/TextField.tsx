import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { TextInputProps } from "react-native";

import { colors } from "../theme/colors";

type TextFieldProps = Readonly<
  TextInputProps & {
    label: string;
    error?: string;
    secure?: boolean;
  }
>;

export default function TextField({
  label,
  error,
  secure = false,
  style,
  ...textInputProps
}: TextFieldProps) {
const [isPasswordVisible, setIsPasswordVisible] = useState(false);
const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View
  style={[
    styles.inputContainer,
    isFocused ? styles.inputFocused : undefined,
    error ? styles.inputError : undefined,
  ]}
>
        <TextInput
  {...textInputProps}
  secureTextEntry={secure && !isPasswordVisible}
  onFocus={(event) => {
    setIsFocused(true);
    textInputProps.onFocus?.(event);
  }}
  onBlur={(event) => {
    setIsFocused(false);
    textInputProps.onBlur?.(event);
  }}
  style={[styles.input, style]}
  placeholderTextColor={colors.textSecondary}
/>

        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isPasswordVisible ? "Hide password" : "Show password"
            }
            onPress={() => setIsPasswordVisible((current) => !current)}
            hitSlop={8}
            style={styles.visibilityButton}
          >
            <Text style={styles.visibilityText}>
              {isPasswordVisible ? "Hide" : "Show"}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },

  label: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },

  inputContainer: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.background,
  },

  input: {
    flex: 1,
    minHeight: 54,
    paddingHorizontal: 16,
    color: colors.textPrimary,
    fontSize: 16,
  },
  inputFocused: {
  borderColor: colors.primary,
  borderWidth: 2,
},

  inputError: {
    borderColor: colors.danger,
  },

  visibilityButton: {
    minHeight: 54,
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  visibilityText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },

  errorText: {
    color: colors.danger,
    fontSize: 13,
  },
});