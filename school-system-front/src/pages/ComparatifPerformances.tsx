import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, TrendingUp, BarChart3 } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Cell,
} from "recharts";
import { useClasses } from "@/hooks/useClasses";
import { useNiveaux } from "@/hooks/useNiveaux";
import {
  useComparatifByNiveau,
  useComparatifEvolution,
} from "@/hooks/useBulletins";

const COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
];

interface TooltipEntry {
  name: string;
  value: number;
  color: string;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-card/95 px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-xs text-muted-foreground">
          <span
            className="inline-block h-2 w-2 rounded-full mr-1.5"
            style={{ backgroundColor: p.color }}
          />
          {p.name}:{" "}
          <span className="font-medium text-foreground">
            {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export default function ComparatifPerformances() {
  const { niveaux } = useNiveaux();
  const [selectedNiveau, setSelectedNiveau] = useState<number>(0);
  const { data: classes = [] } = useClasses(selectedNiveau || undefined);
  const [selectedClasse, setSelectedClasse] = useState<number>(0);
  const [tab, setTab] = useState("comparatif");

  const { data: comparatifData, isLoading: loadingComparatif } =
    useComparatifByNiveau(selectedNiveau);
  const { data: evolutionData, isLoading: loadingEvolution } =
    useComparatifEvolution(selectedClasse);

  const classBarData =
    comparatifData?.classesPerformance?.map((c) => ({
      name: c.classeName,
      moyenne: c.moyenneGenerale,
      tauxReussite: c.tauxReussite,
    })) || [];

  const evolutionLineData =
    evolutionData?.evolution?.map((e) => ({
      name: `T${e.trimestre}`,
      moyenne: e.moyenneGenerale,
      tauxReussite: e.tauxReussite,
    })) || [];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Activity className="h-5 w-5 text-teal-600" />
          <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">
            Comparatif des performances
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Comparez les performances entre classes et suivez l'evolution
        </p>
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="comparatif" className="gap-1">
            <BarChart3 className="h-3.5 w-3.5" /> Comparatif classes
          </TabsTrigger>
          <TabsTrigger value="evolution" className="gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> Evolution trimestrielle
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comparatif" className="space-y-4 mt-4">
          <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
            <div className="max-w-xs">
              <Label>Niveau</Label>
              <Select
                value={selectedNiveau ? String(selectedNiveau) : ""}
                onValueChange={(v) => setSelectedNiveau(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un niveau" />
                </SelectTrigger>
                <SelectContent>
                  {niveaux.map((n) => (
                    <SelectItem key={n.id} value={String(n.id)}>
                      {n.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!selectedNiveau ? (
            <div className="text-center py-16">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                Selectionnez un niveau pour comparer les classes
              </p>
            </div>
          ) : loadingComparatif ? (
            <div className="animate-pulse">
              <div className="h-64 bg-muted rounded-2xl" />
            </div>
          ) : classBarData.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                Aucune donnee disponible pour ce niveau
              </p>
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm"
              >
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Moyenne generale par classe
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={classBarData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(220 15% 93%)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "hsl(220 10% 55%)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 20]}
                      tick={{ fontSize: 11, fill: "hsl(220 10% 55%)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar
                      dataKey="moyenne"
                      name="Moyenne"
                      radius={[4, 4, 0, 0]}
                    >
                      {classBarData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm"
              >
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  Taux de reussite par classe (%)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={classBarData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(220 15% 93%)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "hsl(220 10% 55%)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: "hsl(220 10% 55%)" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `${v}%`}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar
                      dataKey="tauxReussite"
                      name="Taux reussite"
                      radius={[4, 4, 0, 0]}
                    >
                      {classBarData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm"
              >
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Detail par classe
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40 text-left">
                        <th className="pb-2 font-medium text-muted-foreground">
                          Classe
                        </th>
                        <th className="pb-2 font-medium text-muted-foreground text-center">
                          Eleves
                        </th>
                        <th className="pb-2 font-medium text-muted-foreground text-center">
                          Moyenne
                        </th>
                        <th className="pb-2 font-medium text-muted-foreground text-center">
                          Reussis
                        </th>
                        <th className="pb-2 font-medium text-muted-foreground text-center">
                          Taux
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparatifData?.classesPerformance?.map((c) => (
                        <tr
                          key={c.classeId}
                          className="border-b border-border/20"
                        >
                          <td className="py-2 font-medium">
                            {c.classeName}
                          </td>
                          <td className="py-2 text-center">
                            {c.totalEleves}
                          </td>
                          <td className="py-2 text-center font-semibold">
                            {c.moyenneGenerale.toFixed(2)}
                          </td>
                          <td className="py-2 text-center text-emerald-600">
                            {c.reussis}
                          </td>
                          <td className="py-2 text-center">
                            <span
                              className={`font-semibold ${
                                c.tauxReussite >= 50
                                  ? "text-emerald-600"
                                  : "text-red-500"
                              }`}
                            >
                              {c.tauxReussite.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </>
          )}
        </TabsContent>

        <TabsContent value="evolution" className="space-y-4 mt-4">
          <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Niveau</Label>
                <Select
                  value={selectedNiveau ? String(selectedNiveau) : ""}
                  onValueChange={(v) => {
                    setSelectedNiveau(Number(v));
                    setSelectedClasse(0);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {niveaux.map((n) => (
                      <SelectItem key={n.id} value={String(n.id)}>
                        {n.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Classe</Label>
                <Select
                  value={selectedClasse ? String(selectedClasse) : ""}
                  onValueChange={(v) => setSelectedClasse(Number(v))}
                  disabled={!selectedNiveau}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une classe" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {!selectedClasse ? (
            <div className="text-center py-16">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                Selectionnez une classe pour voir l'evolution
              </p>
            </div>
          ) : loadingEvolution ? (
            <div className="animate-pulse">
              <div className="h-64 bg-muted rounded-2xl" />
            </div>
          ) : evolutionLineData.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                Aucune donnee disponible
              </p>
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm"
              >
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Evolution de la moyenne et du taux de reussite
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={evolutionLineData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(220 15% 93%)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "hsl(220 10% 55%)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      domain={[0, 20]}
                      tick={{ fontSize: 11, fill: "hsl(220 10% 55%)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: "hsl(220 10% 55%)" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `${v}%`}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="moyenne"
                      name="Moyenne"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      dot={{
                        r: 5,
                        fill: "#8b5cf6",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="tauxReussite"
                      name="Taux reussite (%)"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{
                        r: 5,
                        fill: "#10b981",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm"
              >
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Detail par trimestre
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40 text-left">
                        <th className="pb-2 font-medium text-muted-foreground">
                          Trimestre
                        </th>
                        <th className="pb-2 font-medium text-muted-foreground text-center">
                          Eleves
                        </th>
                        <th className="pb-2 font-medium text-muted-foreground text-center">
                          Moyenne
                        </th>
                        <th className="pb-2 font-medium text-muted-foreground text-center">
                          Reussis
                        </th>
                        <th className="pb-2 font-medium text-muted-foreground text-center">
                          Taux
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {evolutionData?.evolution?.map((e) => (
                        <tr
                          key={e.trimestre}
                          className="border-b border-border/20"
                        >
                          <td className="py-2 font-medium">
                            Trimestre {e.trimestre}
                          </td>
                          <td className="py-2 text-center">
                            {e.totalEleves}
                          </td>
                          <td className="py-2 text-center font-semibold">
                            {e.moyenneGenerale.toFixed(2)}
                          </td>
                          <td className="py-2 text-center text-emerald-600">
                            {e.reussis}
                          </td>
                          <td className="py-2 text-center">
                            <span
                              className={`font-semibold ${
                                e.tauxReussite >= 50
                                  ? "text-emerald-600"
                                  : "text-red-500"
                              }`}
                            >
                              {e.tauxReussite.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
