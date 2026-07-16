import { StyleSheet, Text, View } from "react-native";

import type { ApplicationStatus } from "../services/applicationStorage";

type StatusBadgeProps = Readonly<{
  status: ApplicationStatus;
}>;

const statusStyles: Record<
  ApplicationStatus,
  {
    backgroundColor: string;
    textColor: string;
  }
> = {
  Saved: {
    backgroundColor: "#F1F5F9",
    textColor: "#475569",
  },

  Applied: {
    backgroundColor: "#DBEAFE",
    textColor: "#2563EB",
  },

  Assessment: {
    backgroundColor: "#F3E8FF",
    textColor: "#9333EA",
  },

  Interview: {
    backgroundColor: "#FFEDD5",
    textColor: "#EA580C",
  },

  Offer: {
    backgroundColor: "#D1FAE5",
    textColor: "#059669",
  },

  Rejected: {
    backgroundColor: "#FEE2E2",
    textColor: "#DC2626",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusStyle = statusStyles[status];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: statusStyle.backgroundColor,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: statusStyle.textColor,
          },
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },

  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});