import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Share } from "react-native";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useChild } from "@/context/ChildContext";
import { bulletinsApi } from "@/api/bulletins.api";
import { EmptyState } from "@/components/EmptyState";
import { colors, spacing, fontSize, borderRadius } from "@/constants/theme";

export default function BulletinScreen({ onBack }: { onBack: () => void }) {
  const { selectedChild } = useChild();
  const [trimestre, setTrimestre] = useState(1);

  const { data: bulletin, isLoading, refetch } = useQuery({
    queryKey: ["bulletin", selectedChild?.id, selectedChild?.classeId, trimestre],
    queryFn: () => bulletinsApi.getStudentBulletin(selectedChild!.id, selectedChild!.classeId, trimestre),
    enabled: !!selectedChild,
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.lg }}>
        <TouchableOpacity onPress={onBack} style={{ marginRight: spacing.md, padding: 4 }}>
          <Text style={{ fontSize: 24, color: colors.primary }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fontSize.heading, fontWeight: "800", color: colors.text }}>Bulletin</Text>
          {selectedChild && (
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
              {selectedChild.firstName} {selectedChild.lastName} · {selectedChild.classe}
            </Text>
          )}
        </View>
      </View>

      {/* Trimestre selector */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: spacing.lg }}>
        {[1, 2, 3].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTrimestre(t)}
            style={{
              flex: 1, paddingVertical: 10, borderRadius: borderRadius.lg, alignItems: "center",
              backgroundColor: trimestre === t ? colors.primary : colors.surface,
              borderWidth: 1, borderColor: trimestre === t ? colors.primary : colors.border,
            }}
          >
            <Text style={{ fontSize: fontSize.sm, fontWeight: "700", color: trimestre === t ? "#fff" : colors.textSecondary }}>
              Trimestre {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {!selectedChild ? (
        <EmptyState icon="📋" title="Selectionnez un enfant" />
      ) : isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : !bulletin ? (
        <EmptyState icon="📋" title="Bulletin non disponible" subtitle="Le bulletin n'a pas encore ete genere pour ce trimestre" />
      ) : (
        <>
          {/* Student info header */}
          <View style={{
            backgroundColor: colors.primary, borderRadius: borderRadius.xl, padding: spacing.lg,
            marginBottom: spacing.lg,
          }}>
            <Text style={{ fontSize: fontSize.lg, fontWeight: "800", color: "#fff" }}>
              {selectedChild.firstName} {selectedChild.lastName}
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
              {selectedChild.classe} · {selectedChild.niveau} · {selectedChild.matricule}
            </Text>
            {bulletin.moyenneGenerale != null && (
              <View style={{
                marginTop: spacing.md, backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: borderRadius.lg, padding: spacing.md, alignItems: "center",
              }}>
                <Text style={{ fontSize: fontSize.xs, color: "rgba(255,255,255,0.7)" }}>Moyenne Generale</Text>
                <Text style={{ fontSize: 32, fontWeight: "900", color: "#fff" }}>
                  {bulletin.moyenneGenerale}/20
                </Text>
              </View>
            )}
          </View>

          {/* Subjects */}
          {(bulletin.modules || bulletin.matieres || []).map((mod: any, i: number) => (
            <View key={i} style={{
              backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md,
              marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border,
            }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: fontSize.md, fontWeight: "700", color: colors.text, flex: 1 }}>
                  {mod.moduleName || mod.matiere || mod.name}
                </Text>
                <View style={{
                  backgroundColor: ((mod.moyenne || mod.note) >= 14 ? colors.success : (mod.moyenne || mod.note) >= 10 ? colors.warning : colors.error) + "15",
                  borderRadius: borderRadius.md, paddingHorizontal: 10, paddingVertical: 4,
                }}>
                  <Text style={{
                    fontSize: fontSize.md, fontWeight: "800",
                    color: (mod.moyenne || mod.note) >= 14 ? colors.success : (mod.moyenne || mod.note) >= 10 ? colors.warning : colors.error,
                  }}>
                    {mod.moyenne ?? mod.note ?? "—"}/20
                  </Text>
                </View>
              </View>
              {mod.teacher && (
                <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4 }}>{mod.teacher}</Text>
              )}
              {mod.appreciation && (
                <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 4, fontStyle: "italic" }}>
                  "{mod.appreciation}"
                </Text>
              )}
            </View>
          ))}

          {/* General appreciation */}
          {bulletin.appreciationGenerale && (
            <View style={{
              backgroundColor: colors.info + "10", borderRadius: borderRadius.lg, padding: spacing.lg,
              marginTop: spacing.md, borderWidth: 1, borderColor: colors.info + "20",
            }}>
              <Text style={{ fontSize: fontSize.xs, fontWeight: "600", color: colors.info, marginBottom: spacing.xs }}>
                APPRECIATION GENERALE
              </Text>
              <Text style={{ fontSize: fontSize.sm, color: colors.text, fontStyle: "italic", lineHeight: 20 }}>
                "{bulletin.appreciationGenerale}"
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}
