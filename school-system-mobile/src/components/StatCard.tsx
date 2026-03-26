import { View, Text } from "react-native";
import { colors, spacing, fontSize, borderRadius } from "@/constants/theme";

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  subtitle?: string;
}

export function StatCard({ icon, label, value, color, subtitle }: StatCardProps) {
  return (
    <View style={{
      flex: 1, backgroundColor: color + "10", borderRadius: borderRadius.lg,
      padding: spacing.md, borderWidth: 1, borderColor: color + "20",
    }}>
      <Text style={{ fontSize: 20, marginBottom: 4 }}>{icon}</Text>
      <Text style={{ fontSize: fontSize.xl, fontWeight: "800", color }}>{value}</Text>
      <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 }}>{label}</Text>
      {subtitle && <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 }}>{subtitle}</Text>}
    </View>
  );
}
