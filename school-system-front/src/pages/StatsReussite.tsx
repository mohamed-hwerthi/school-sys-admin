import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  Award,
  AlertTriangle,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useClasses } from "@/hooks/useClasses";
import { useNiveaux } from "@/hooks/useNiveaux";
import { useStatsReussite } from "@/hooks/useBulletins";

const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6"];

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
          {p.name}: <span className="font-medium text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function StatsReussite() {
  const { niveaux } = useNiveaux();
  const [selectedNiveau, setSelectedNiveau] = useState<number>(0);
  const { data: classes = [] } = useClasses(selectedNiveau || undefined);
  const [selectedClasse, setSelectedClasse] = useState<number>(0);
  const [selectedTrimestre, setSelectedTrimestre] = useState<number>(1);

  const { data: stats, isLoading } = useStatsReussite(
    selectedClasse,
    selectedTrimestre
  );

  const distributionData =
    stats?.distribution?.map((d, i) => ({
      name: d.range,
      count: d.count,
      fill: COLORS[i % COLORS.length],
    })) || [];

  const moduleData =
    stats?.modulesStats?.map((m) => ({
      name:
        m.moduleName.length > 12
          ? m.moduleName.slice(0, 12) + "..."
          : m.moduleName,
      moyenne: m.moyenne,
    })) || [];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="h-5 w-5 text-violet-600" />
          <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">
            Statistiques de reussite
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Analyse des performances par classe et par module
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div>
            <Label>Trimestre</Label>
            <Select
              value={String(selectedTrimestre)}
              onValueChange={(v) => setSelectedTrimestre(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Trimestre 1</SelectItem>
                <SelectItem value="2">Trimestre 2</SelectItem>
                <SelectItem value="3">Trimestre 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {!selectedClasse ? (
        <div className="text-center py-16">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">
            Selectionnez une classe pour afficher les statistiques
          </p>
        </div>
      ) : isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-2xl" />
            ))}
          </div>
          <div className="h-64 bg-muted rounded-2xl" />
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: Users,
                label: "Total eleves",
                value: stats.totalEleves,
                color: "blue",
              },
              {
                icon: TrendingUp,
                label: "Taux de reussite",
                value: `${stats.tauxReussite.toFixed(1)}%`,
                color: "emerald",
              },
              {
                icon: Award,
                label: "Reussis",
                value: stats.reussis,
                color: "green",
              },
              {
                icon: AlertTriangle,
                label: "En echec",
                value: stats.echoues,
                color: "red",
              },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="rounded-2xl border border-border/40 bg-card p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg bg-${card.color}-100 text-${card.color}-600`}
                  >
                    <card.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {card.label}
                  </span>
                </div>
                <p
                  className={`font-heading text-2xl font-bold ${
                    card.color === "red"
                      ? "text-red-500"
                      : card.color === "emerald"
                        ? "text-emerald-600"
                        : "text-foreground"
                  }`}
                >
                  {card.value}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-violet-500" />
                Distribution des moyennes
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={distributionData}>
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
                    tick={{ fontSize: 11, fill: "hsl(220 10% 55%)" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Eleves" radius={[4, 4, 0, 0]}>
                    {distributionData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Moyenne par module
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={moduleData} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(220 15% 93%)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 20]}
                    tick={{ fontSize: 11, fill: "hsl(220 10% 55%)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 10, fill: "hsl(220 10% 55%)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="moyenne"
                    name="Moyenne"
                    fill="#8b5cf6"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Moyennes de la classe
            </h3>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Minimum</p>
                <p className="text-xl font-bold text-red-500">
                  {stats.moyenneMin.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Moyenne classe
                </p>
                <p className="text-xl font-bold text-foreground">
                  {stats.moyenneClasse.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Maximum</p>
                <p className="text-xl font-bold text-emerald-600">
                  {stats.moyenneMax.toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </div>
  );
}
