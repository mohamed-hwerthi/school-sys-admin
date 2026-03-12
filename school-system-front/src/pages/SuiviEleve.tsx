import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BookOpen,
  Clock,
  Shield,
  CreditCard,
  Search,
  Activity,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSuiviEleve } from "@/hooks/useAnalytics";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
};

const riskColors: Record<string, { bg: string; text: string; ring: string }> = {
  FAIBLE: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200" },
  MOYEN: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200" },
  ELEVE: { bg: "bg-orange-50", text: "text-orange-700", ring: "ring-orange-200" },
  CRITIQUE: { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200" },
};

const paiementLabels: Record<string, { label: string; color: string }> = {
  A_JOUR: { label: "A jour", color: "bg-emerald-100 text-emerald-700" },
  PARTIEL: { label: "Partiel", color: "bg-amber-100 text-amber-700" },
  EN_RETARD: { label: "En retard", color: "bg-red-100 text-red-700" },
  "N/A": { label: "N/A", color: "bg-gray-100 text-gray-600" },
};

export default function SuiviEleve() {
  const loading = useSimulatedLoading(600);
  const [eleveId, setEleveId] = useState<number>(0);
  const [searchInput, setSearchInput] = useState("");
  const { data: suivi, isLoading, isError } = useSuiviEleve(eleveId);

  const handleSearch = () => {
    const id = parseInt(searchInput, 10);
    if (!isNaN(id) && id > 0) {
      setEleveId(id);
    }
  };

  if (loading) return <DashboardSkeleton />;

  const gradeData = suivi
    ? suivi.moyenneParTrimestre.map((m, i) => ({
        trimestre: `T${i + 1}`,
        moyenne: m,
      }))
    : [];

  const risk = suivi ? riskColors[suivi.niveauRisque] || riskColors.FAIBLE : null;
  const paiement = suivi
    ? paiementLabels[suivi.paiementsStatus] || paiementLabels["N/A"]
    : null;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Suivi Eleve 360
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Vue complete du parcours scolaire
          </p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
        className="rounded-xl border border-border/50 bg-card p-4 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="ID de l'eleve..."
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch} size="sm" className="gap-1.5">
            <Search className="h-4 w-4" />
            Rechercher
          </Button>
        </div>
      </motion.div>

      {/* No student selected */}
      {!suivi && !isLoading && !isError && (
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
          className="rounded-xl border border-border/50 bg-card p-12 text-center"
        >
          <User className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">
            Entrez l'ID d'un eleve pour voir son suivi complet
          </p>
        </motion.div>
      )}

      {isLoading && <DashboardSkeleton />}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
          <p className="text-red-700">Eleve non trouve</p>
        </div>
      )}

      {suivi && (
        <>
          {/* Student Info Card */}
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
            className="rounded-xl border border-border/50 bg-card p-5 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold text-lg">
                {suivi.prenom.charAt(0)}{suivi.nom.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="font-heading text-lg font-bold text-foreground">
                  {suivi.prenom} {suivi.nom}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Classe: {suivi.classe || "Non assignee"} | ID: {suivi.eleveId}
                </p>
              </div>
              {risk && (
                <div className={`flex items-center gap-2 rounded-full px-4 py-2 ring-1 ${risk.bg} ${risk.text} ${risk.ring}`}>
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-semibold">
                    Risque: {suivi.niveauRisque} ({suivi.scoreRisque.toFixed(0)}/100)
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
              className="rounded-xl border border-border/50 bg-card p-4 shadow-sm"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                <Clock className="h-4 w-4 text-red-600" />
              </div>
              <p className="mt-2 font-heading text-2xl font-bold">{suivi.totalAbsences}</p>
              <p className="text-xs text-muted-foreground">Absences</p>
            </motion.div>

            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
              className="rounded-xl border border-border/50 bg-card p-4 shadow-sm"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <p className="mt-2 font-heading text-2xl font-bold">{suivi.totalRetards}</p>
              <p className="text-xs text-muted-foreground">Retards</p>
            </motion.div>

            <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible"
              className="rounded-xl border border-border/50 bg-card p-4 shadow-sm"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                <Shield className="h-4 w-4 text-purple-600" />
              </div>
              <p className="mt-2 font-heading text-2xl font-bold">{suivi.totalIncidents}</p>
              <p className="text-xs text-muted-foreground">Incidents</p>
            </motion.div>

            <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible"
              className="rounded-xl border border-border/50 bg-card p-4 shadow-sm"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <CreditCard className="h-4 w-4 text-blue-600" />
              </div>
              <div className="mt-2">
                {paiement && (
                  <Badge className={`${paiement.color} text-xs`}>
                    {paiement.label}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Paiements</p>
            </motion.div>
          </div>

          {/* Grade Evolution Chart */}
          <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible"
            className="rounded-xl border border-border/50 bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Evolution des moyennes
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Par trimestre</p>
              </div>
              <div className="flex items-center gap-1 text-sm">
                {gradeData.length > 1 && (
                  gradeData[gradeData.length - 1].moyenne >= gradeData[gradeData.length - 2].moyenne
                    ? <TrendingUp className="h-4 w-4 text-emerald-500" />
                    : <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={gradeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 93%)" />
                <XAxis dataKey="trimestre" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 20]} tick={{ fontSize: 11 }} />
                <RechartsTooltip />
                <Line
                  type="monotone"
                  dataKey="moyenne"
                  stroke="hsl(230 75% 57%)"
                  strokeWidth={2.5}
                  dot={{ r: 5, fill: "hsl(230 75% 57%)", strokeWidth: 2, stroke: "#fff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </>
      )}
    </div>
  );
}
