import { Pressable, StyleSheet, Text, View } from "react-native";

import type { JobApplication } from "../services/applicationStorage";
import { colors } from "../theme/colors";
import StatusBadge from "./StatusBadge";

type ApplicationCardProps = Readonly<{
  application: JobApplication;
  onPress: () => void;
  compact?: boolean;
}>;

export default function ApplicationCard({
  application,
  onPress,
  compact = false,
}: ApplicationCardProps) {
  const createdDate = new Date(application.createdAt).toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "short",
    }
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${application.company} ${application.jobTitle} application`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact ? styles.compactCard : styles.fullCard,
        pressed ? styles.cardPressed : undefined,
      ]}
    >
      <View style={styles.mainContent}>
        <Text style={styles.companyName} numberOfLines={1}>
          {application.company}
        </Text>

        <Text
          style={styles.jobTitle}
          numberOfLines={compact ? 1 : 2}
        >
          {application.jobTitle}
        </Text>

        {!compact && application.location ? (
          <Text style={styles.location} numberOfLines={1}>
            {application.location}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightContent}>
        <StatusBadge status={application.status} />

        {!compact ? (
          <Text style={styles.dateText}>{createdDate}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },

  fullCard: {
    minHeight: 112,
    marginBottom: 12,
    padding: 18,
  },

  compactCard: {
    minHeight: 84,
    marginBottom: 12,
    padding: 18,
  },

  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },

  mainContent: {
    flex: 1,
    paddingRight: 14,
  },

  companyName: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
  },

  jobTitle: {
    marginTop: 5,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },

  location: {
    marginTop: 7,
    color: colors.textSecondary,
    fontSize: 13,
  },

  rightContent: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    alignSelf: "stretch",
  },

  dateText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});