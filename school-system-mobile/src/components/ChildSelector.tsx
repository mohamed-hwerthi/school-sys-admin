import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useChild, type Child } from "@/context/ChildContext";
import { colors, spacing, fontSize, borderRadius } from "@/constants/theme";

export function ChildSelector() {
  const { children, selectedChild, selectChild } = useChild();

  if (children.length <= 1) return null;

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={{ fontSize: fontSize.xs, fontWeight: "600", color: colors.textMuted, marginBottom: spacing.sm, textTransform: "uppercase", letterSpacing: 1 }}>
        Selectionner un enfant
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {children.map((child: Child) => {
          const selected = selectedChild?.id === child.id;
          return (
            <TouchableOpacity
              key={child.id}
              onPress={() => selectChild(child)}
              style={{
                flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10,
                borderRadius: borderRadius.xl, borderWidth: 1.5,
                backgroundColor: selected ? colors.primary + "10" : colors.surface,
                borderColor: selected ? colors.primary : colors.border,
              }}
            >
              <View style={{
                width: 32, height: 32, borderRadius: 10,
                backgroundColor: selected ? colors.primary : colors.textMuted + "30",
                justifyContent: "center", alignItems: "center", marginRight: 10,
              }}>
                <Text style={{ fontSize: 13, fontWeight: "800", color: selected ? "#fff" : colors.textSecondary }}>
                  {child.firstName[0]}{child.lastName[0]}
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: fontSize.sm, fontWeight: "700", color: selected ? colors.primary : colors.text }}>
                  {child.firstName}
                </Text>
                <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>{child.classe}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
