import { Pressable, StyleSheet, Text } from "react-native";

import { colors } from "../theme/colors";

type StatCardProps = Readonly<{
  title: string;
  value: number | string;
  onPress?: () => void;
}>;

export default function StatCard({
  title,
  value,
  onPress,
}: StatCardProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && onPress ? styles.cardPressed : undefined,
      ]}
    >
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    minHeight: 112,
    justifyContent: "space-between",
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },

  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },

  value: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: "800",
  },

  title: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
});