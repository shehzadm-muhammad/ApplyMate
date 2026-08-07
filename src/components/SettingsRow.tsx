import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../theme/colors";

type SettingsRowProps = Readonly<{
  icon:
    | "notifications-outline"
    | "finger-print-outline"
    | "download-outline"
    | "trash-outline"
    | "document-text-outline"
    | "log-out-outline";
  title: string;
  description?: string;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
  destructive?: boolean;
}>;

export default function SettingsRow({
  icon,
  title,
  description,
  value,
  onValueChange,
  onPress,
  destructive = false,
}: SettingsRowProps) {
  const isSwitchRow =
    value !== undefined && onValueChange !== undefined;

  return (
    <Pressable
      accessibilityRole={isSwitchRow ? undefined : "button"}
      disabled={isSwitchRow}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && !isSwitchRow
          ? styles.rowPressed
          : undefined,
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          destructive
            ? styles.destructiveIconContainer
            : undefined,
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={
            destructive ? colors.danger : colors.primary
          }
        />
      </View>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            destructive ? styles.destructiveText : undefined,
          ]}
        >
          {title}
        </Text>

        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>

      {isSwitchRow ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{
            false: colors.border,
            true: colors.primary,
          }}
        />
      ) : (
        <Ionicons
          name="chevron-forward"
          size={19}
          color={colors.textSecondary}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },

  rowPressed: {
    opacity: 0.72,
  },

  iconContainer: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#DBEAFE",
  },

  destructiveIconContainer: {
    backgroundColor: "#FEE2E2",
  },

  content: {
    flex: 1,
    paddingHorizontal: 14,
  },

  title: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },

  destructiveText: {
    color: colors.danger,
  },

  description: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
});