import { View, Text } from "react-native";
import { colors, spacing, fontSize, borderRadius } from "@/constants/theme";

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View style={{
      backgroundColor: colors.surface, borderRadius: borderRadius.lg,
      padding: spacing.xl, alignItems: "center",
    }}>
      <Text style={{ fontSize: 48, marginBottom: spacing.md }}>{icon}</Text>
      <Text style={{ fontSize: fontSize.md, fontWeight: "600", color: colors.textSecondary, textAlign: "center" }}>{title}</Text>
      {subtitle && <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, textAlign: "center", marginTop: spacing.xs }}>{subtitle}</Text>}
    </View>
  );
}
