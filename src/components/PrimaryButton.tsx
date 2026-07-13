import { Pressable, StyleSheet, Text } from "react-native";

import { colors } from "../theme/colors";

type PrimaryButtonProps = Readonly<{
  title: string;
  onPress: () => void;
  disabled?: boolean;
}>;

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled ? styles.buttonPressed : undefined,
        disabled ? styles.buttonDisabled : undefined,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.primary,
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  buttonDisabled: {
    opacity: 0.45,
  },

  text: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});