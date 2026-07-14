import { StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";

type StatCardProps = Readonly<{
  title: string;
  value: number | string;
}>;

export default function StatCard({ title, value }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
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