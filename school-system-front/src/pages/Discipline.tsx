import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  X,
  Loader2,
  AlertTriangle,
  Gavel,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  useIncidents,
  useCreateIncident,
  useDeleteIncident,
  useSanctions,
  useCreateSanction,
  useDeleteSanction,
} from "@/hooks/useDiscipline";
import type { Incident, Sanction, TypeIncident, GraviteType, TypeSanction } from "@/types/discipline";

const TYPE_INCIDENT_LABELS: Record<TypeIncident, string> = {
  BAGARRE: "Bagarre",
  INSOLENCE: "Insolence",
  VANDALISME: "Vandalisme",
  TRICHERIE: "Tricherie",
  RETARD_REPETE: "Retard repete",
  ABSENCE_INJUSTIFIEE: "Absence injustifiee",
  AUTRE: "Autre",
};

const GRAVITE_LABELS: Record<GraviteType, string> = {
  LEGERE: "Legere",
  MOYENNE: "Moyenne",
  GRAVE: "Grave",
  TRES_GRAVE: "Tres grave",
};

const GRAVITE_COLORS: Record<GraviteType, string> = {
  LEGERE: "bg-blue-100 text-blue-700",
  MOYENNE: "bg-orange-100 text-orange-700",
  GRAVE: "bg-red-100 text-red-700",
  TRES_GRAVE: "bg-red-200 text-red-800",
};

const TYPE_SANCTION_LABELS: Record<TypeSanction, string> = {
  AVERTISSEMENT: "Avertissement",
  BLAME: "Blame",
  EXCLUSION_TEMPORAIRE: "Exclusion temporaire",
  EXCLUSION_DEFINITIVE: "Exclusion definitive",
  TRAVAIL_SUPPLEMENTAIRE: "Travail supplementaire",
  CONVOCATION_PARENT: "Convocation parent",
};

const ITEMS_PER_PAGE = 15;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
};

export default function DisciplinePage() {
  const [activeTab, setActiveTab] = useState("incidents");
  const [search, setSearch] = useState("");
  const [filterGravite, setFilterGravite] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);

  // Incident form state
  const [incidentFormOpen, setIncidentFormOpen] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    dateIncident: new Date().toISOString().split("T")[0],
    typeIncident: "AUTRE" as TypeIncident,
    description: "",
    gravite: "LEGERE" as GraviteType,
    elevesIds: [] as number[],
    enseignantId: undefined as number | undefined,
  });

  // Sanction form state
  const [sanctionFormOpen, setSanctionFormOpen] = useState(false);
  const [sanctionForm, setSanctionForm] = useState({
    eleveId: 0,
    incidentId: undefined as number | undefined,
    typeSanction: "AVERTISSEMENT" as TypeSanction,
    description: "",
    dateDebut: new Date().toISOString().split("T")[0],
    dateFin: "",
    notifieParent: false,
  });

  const [deleteIncidentTarget, setDeleteIncidentTarget] = useState<Incident | null>(null);
  const [deleteSanctionTarget, setDeleteSanctionTarget] = useState<Sanction | null>(null);

  const { data: incidents = [], isLoading: incidentsLoading } = useIncidents();
  const { data: sanctions = [], isLoading: sanctionsLoading } = useSanctions();
  const createIncidentMutation = useCreateIncident();
  const deleteIncidentMutation = useDeleteIncident();
  const createSanctionMutation = useCreateSanction();
  const deleteSanctionMutation = useDeleteSanction();

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    let list = incidents;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (inc) =>
          inc.description?.toLowerCase().includes(q) ||
          TYPE_INCIDENT_LABELS[inc.typeIncident].toLowerCase().includes(q)
      );
    }
    if (filterGravite !== "all") {
      list = list.filter((inc) => inc.gravite === filterGravite);
    }
    if (filterType !== "all") {
      list = list.filter((inc) => inc.typeIncident === filterType);
    }
    return list;
  }, [incidents, search, filterGravite, filterType]);

  // Filtered sanctions
  const filteredSanctions = useMemo(() => {
    let list = sanctions;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.eleveNom?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          TYPE_SANCTION_LABELS[s.typeSanction].toLowerCase().includes(q)
      );
    }
    return list;
  }, [sanctions, search]);

  const activeList = activeTab === "incidents" ? filteredIncidents : filteredSanctions;
  const totalPages = Math.max(1, Math.ceil(activeList.length / ITEMS_PER_PAGE));
  const paginatedIncidents = filteredIncidents.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );
  const paginatedSanctions = filteredSanctions.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const hasFilters = search || filterGravite !== "all" || filterType !== "all";
  const resetFilters = () => {
    setSearch("");
    setFilterGravite("all");
    setFilterType("all");
    setCurrentPage(0);
  };

  const stats = [
    { label: "Total Incidents", value: incidents.length, icon: AlertTriangle, color: "bg-red-50", textColor: "text-red-700" },
    { label: "Cas Graves", value: incidents.filter((i) => i.gravite === "GRAVE" || i.gravite === "TRES_GRAVE").length, icon: ShieldAlert, color: "bg-orange-50", textColor: "text-orange-700" },
    { label: "Sanctions Actives", value: sanctions.length, icon: Gavel, color: "bg-purple-50", textColor: "text-purple-700" },
  ];

  const handleCreateIncident = () => {
    createIncidentMutation.mutate(incidentForm, {
      onSuccess: () => setIncidentFormOpen(false),
    });
  };

  const handleCreateSanction = () => {
    createSanctionMutation.mutate(sanctionForm, {
      onSuccess: () => setSanctionFormOpen(false),
    });
  };

  const handleDeleteIncident = () => {
    if (!deleteIncidentTarget) return;
    deleteIncidentMutation.mutate(deleteIncidentTarget.id, {
      onSuccess: () => setDeleteIncidentTarget(null),
    });
  };

  const handleDeleteSanction = () => {
    if (!deleteSanctionTarget) return;
    deleteSanctionMutation.mutate(deleteSanctionTarget.id, {
      onSuccess: () => setDeleteSanctionTarget(null),
    });
  };

  const isLoading = incidentsLoading || sanctionsLoading;
  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">Discipline</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gerez les incidents disciplinaires et les sanctions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
            setSanctionForm({ eleveId: 0, incidentId: undefined, typeSanction: "AVERTISSEMENT", description: "", dateDebut: new Date().toISOString().split("T")[0], dateFin: "", notifieParent: false });
            setSanctionFormOpen(true);
          }}>
            <Gavel className="h-4 w-4" />
            Sanction
          </Button>
          <Button size="sm" className="gap-1.5 bg-gradient-primary shadow-btn" onClick={() => {
            setIncidentForm({ dateIncident: new Date().toISOString().split("T")[0], typeIncident: "AUTRE", description: "", gravite: "LEGERE", elevesIds: [], enseignantId: undefined });
            setIncidentFormOpen(true);
          }}>
            <Plus className="h-4 w-4" />
            Signaler un incident
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} custom={i} variants={fadeUp} initial="hidden" animate="visible" className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}>
              <stat.icon className={`h-4.5 w-4.5 ${stat.textColor}`} />
            </div>
            <p className="mt-2.5 font-heading text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs + Filters */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(0); }}>
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="rounded-xl border border-border/50 bg-card p-4 shadow-sm space-y-3">
          <TabsList>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="sanctions">Sanctions</TabsTrigger>
          </TabsList>
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(0); }} placeholder="Rechercher..." className="pl-9" />
            </div>
            {activeTab === "incidents" && (
              <div className="flex flex-wrap items-center gap-2">
                <Select value={filterType} onValueChange={(v) => { setFilterType(v); setCurrentPage(0); }}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {(Object.keys(TYPE_INCIDENT_LABELS) as TypeIncident[]).map((t) => (
                      <SelectItem key={t} value={t}>{TYPE_INCIDENT_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterGravite} onValueChange={(v) => { setFilterGravite(v); setCurrentPage(0); }}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Gravite" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {(Object.keys(GRAVITE_LABELS) as GraviteType[]).map((g) => (
                      <SelectItem key={g} value={g}>{GRAVITE_LABELS[g]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
                Reinitialiser
              </Button>
            )}
          </div>
        </motion.div>

        {/* Incidents Table */}
        <TabsContent value="incidents">
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground">Date</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground">Type</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">Gravite</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Description</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">Eleves impliques</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedIncidents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-muted-foreground">
                        <ShieldAlert className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">Aucun incident trouve</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedIncidents.map((inc) => (
                      <tr key={inc.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 text-muted-foreground">{new Date(inc.dateIncident).toLocaleDateString("fr-FR")}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{TYPE_INCIDENT_LABELS[inc.typeIncident]}</Badge>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${GRAVITE_COLORS[inc.gravite]}`}>
                            {GRAVITE_LABELS[inc.gravite]}
                          </span>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell text-muted-foreground max-w-[250px] truncate">
                          {inc.description ?? "-"}
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground">
                          {inc.elevesIds.length} eleve{inc.elevesIds.length !== 1 ? "s" : ""}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="hidden sm:flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={() => setDeleteIncidentTarget(inc)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 sm:hidden">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setDeleteIncidentTarget(inc)} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && activeTab === "incidents" && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <p className="text-xs text-muted-foreground">Page {currentPage + 1} sur {totalPages}</p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 0} onClick={() => setCurrentPage((p) => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage((p) => p + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* Sanctions Table */}
        <TabsContent value="sanctions">
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground">Eleve</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground">Type</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">Date debut</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Date fin</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">Description</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">Parent notifie</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSanctions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-muted-foreground">
                        <Gavel className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">Aucune sanction trouvee</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedSanctions.map((sanction) => (
                      <tr key={sanction.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 font-medium text-foreground">{sanction.eleveNom ?? `Eleve #${sanction.eleveId}`}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{TYPE_SANCTION_LABELS[sanction.typeSanction]}</Badge>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground">{new Date(sanction.dateDebut).toLocaleDateString("fr-FR")}</td>
                        <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">{sanction.dateFin ? new Date(sanction.dateFin).toLocaleDateString("fr-FR") : "-"}</td>
                        <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground max-w-[200px] truncate">{sanction.description ?? "-"}</td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <Badge variant="outline" className={sanction.notifieParent ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}>
                            {sanction.notifieParent ? "Oui" : "Non"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={() => setDeleteSanctionTarget(sanction)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && activeTab === "sanctions" && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <p className="text-xs text-muted-foreground">Page {currentPage + 1} sur {totalPages}</p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 0} onClick={() => setCurrentPage((p) => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage((p) => p + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Create Incident Dialog */}
      <Dialog open={incidentFormOpen} onOpenChange={setIncidentFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Signaler un incident</DialogTitle>
            <DialogDescription>Renseignez les details de l'incident disciplinaire.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="dateIncident">Date</Label>
              <Input id="dateIncident" type="date" value={incidentForm.dateIncident} onChange={(e) => setIncidentForm({ ...incidentForm, dateIncident: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={incidentForm.typeIncident} onValueChange={(v) => setIncidentForm({ ...incidentForm, typeIncident: v as TypeIncident })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TYPE_INCIDENT_LABELS) as TypeIncident[]).map((t) => (
                      <SelectItem key={t} value={t}>{TYPE_INCIDENT_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Gravite</Label>
                <Select value={incidentForm.gravite} onValueChange={(v) => setIncidentForm({ ...incidentForm, gravite: v as GraviteType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(GRAVITE_LABELS) as GraviteType[]).map((g) => (
                      <SelectItem key={g} value={g}>{GRAVITE_LABELS[g]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="incidentDesc">Description</Label>
              <Textarea id="incidentDesc" value={incidentForm.description} onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })} placeholder="Decrivez l'incident..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleCreateIncident} disabled={createIncidentMutation.isPending}>
              {createIncidentMutation.isPending ? "Creation..." : "Signaler"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Sanction Dialog */}
      <Dialog open={sanctionFormOpen} onOpenChange={setSanctionFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter une sanction</DialogTitle>
            <DialogDescription>Definissez la sanction pour l'eleve concerne.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="sanctionEleveId">ID Eleve</Label>
              <Input id="sanctionEleveId" type="number" value={sanctionForm.eleveId || ""} onChange={(e) => setSanctionForm({ ...sanctionForm, eleveId: Number(e.target.value) })} placeholder="ID de l'eleve" />
            </div>
            <div className="space-y-1.5">
              <Label>Type de sanction</Label>
              <Select value={sanctionForm.typeSanction} onValueChange={(v) => setSanctionForm({ ...sanctionForm, typeSanction: v as TypeSanction })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(TYPE_SANCTION_LABELS) as TypeSanction[]).map((t) => (
                    <SelectItem key={t} value={t}>{TYPE_SANCTION_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sanctionDebut">Date debut</Label>
                <Input id="sanctionDebut" type="date" value={sanctionForm.dateDebut} onChange={(e) => setSanctionForm({ ...sanctionForm, dateDebut: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sanctionFin">Date fin</Label>
                <Input id="sanctionFin" type="date" value={sanctionForm.dateFin} onChange={(e) => setSanctionForm({ ...sanctionForm, dateFin: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sanctionDesc">Description</Label>
              <Textarea id="sanctionDesc" value={sanctionForm.description} onChange={(e) => setSanctionForm({ ...sanctionForm, description: e.target.value })} placeholder="Details de la sanction..." rows={2} />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="notifieParent"
                checked={sanctionForm.notifieParent}
                onChange={(e) => setSanctionForm({ ...sanctionForm, notifieParent: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="notifieParent">Notifier le parent</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleCreateSanction} disabled={createSanctionMutation.isPending || !sanctionForm.eleveId}>
              {createSanctionMutation.isPending ? "Creation..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Incident Confirmation */}
      <Dialog open={!!deleteIncidentTarget} onOpenChange={(open) => !open && setDeleteIncidentTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer l'incident</DialogTitle>
            <DialogDescription>Etes-vous sur de vouloir supprimer cet incident ? Cette action est irreversible.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button variant="destructive" onClick={handleDeleteIncident} disabled={deleteIncidentMutation.isPending}>
              {deleteIncidentMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Sanction Confirmation */}
      <Dialog open={!!deleteSanctionTarget} onOpenChange={(open) => !open && setDeleteSanctionTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer la sanction</DialogTitle>
            <DialogDescription>Etes-vous sur de vouloir supprimer cette sanction ? Cette action est irreversible.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button variant="destructive" onClick={handleDeleteSanction} disabled={deleteSanctionMutation.isPending}>
              {deleteSanctionMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
