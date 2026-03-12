import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Receipt,
  Search,
  Filter,
  Plus,
  Eye,
  Trash2,
  MoreHorizontal,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Ban,
  DollarSign,
  Clock,
  CheckCircle,
  FileText,
  CreditCard,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
  useFacturesPaged,
  useAllFactures,
  useCreateFacture,
  useGenerateFacture,
  useCancelFacture,
  useDeleteFacture,
  useEcheanciers,
  useCreateEcheancier,
  useDeleteEcheancier,
} from "@/hooks/useFactures";
import type { Facture, Echeancier } from "@/types/facture";

const STATUT_LABELS: Record<Facture["statut"], string> = {
  NON_PAYEE: "Non payee",
  PARTIELLEMENT_PAYEE: "Partiellement payee",
  PAYEE: "Payee",
  ANNULEE: "Annulee",
};

const STATUT_COLORS: Record<Facture["statut"], string> = {
  NON_PAYEE: "bg-red-100 text-red-700",
  PARTIELLEMENT_PAYEE: "bg-amber-100 text-amber-700",
  PAYEE: "bg-emerald-100 text-emerald-700",
  ANNULEE: "bg-muted text-muted-foreground",
};

const ITEMS_PER_PAGE = 20;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
};

export default function FacturesPage() {
  const [activeTab, setActiveTab] = useState("factures");
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);

  // Generate facture
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateEleveId, setGenerateEleveId] = useState("");

  // Create facture form
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    eleveId: 0,
    dateEmission: new Date().toISOString().split("T")[0],
    dateEcheance: "",
    montantTotal: 0,
    montantRemise: 0,
    montantNet: 0,
  });

  // Detail view
  const [detailTarget, setDetailTarget] = useState<Facture | null>(null);

  // Echeancier form
  const [echeancierFormOpen, setEcheancierFormOpen] = useState(false);
  const [echeancierForm, setEcheancierForm] = useState({
    eleveId: 0,
    typeFraisId: undefined as number | undefined,
    montantTotal: 0,
    nbMensualites: 3,
    dateDebut: "",
  });

  const [deleteTarget, setDeleteTarget] = useState<Facture | null>(null);
  const [deleteEcheancierTarget, setDeleteEcheancierTarget] = useState<Echeancier | null>(null);

  const { data: pagedData, isLoading, isFetching } = useFacturesPaged({
    page: currentPage,
    size: ITEMS_PER_PAGE,
    search: search || undefined,
    statut: filterStatut !== "all" ? filterStatut : undefined,
  });

  const { data: allFactures = [] } = useAllFactures();
  const createFactureMutation = useCreateFacture();
  const generateMutation = useGenerateFacture();
  const cancelMutation = useCancelFacture();
  const deleteMutation = useDeleteFacture();

  const { data: echeanciers = [] } = useEcheanciers();
  const createEcheancierMutation = useCreateEcheancier();
  const deleteEcheancierMutation = useDeleteEcheancier();

  const factures = pagedData?.content ?? [];
  const totalElements = pagedData?.totalElements ?? 0;
  const totalPages = pagedData?.totalPages ?? 1;

  const totalMontant = allFactures.reduce((s, f) => s + f.montantNet, 0);
  const payees = allFactures.filter((f) => f.statut === "PAYEE");
  const montantPaye = payees.reduce((s, f) => s + f.montantNet, 0);
  const nonPayees = allFactures.filter((f) => f.statut === "NON_PAYEE" || f.statut === "PARTIELLEMENT_PAYEE");
  const montantRestant = nonPayees.reduce((s, f) => s + f.montantNet, 0);

  const stats = [
    { label: "Total Factures", value: allFactures.length, icon: Receipt, color: "bg-blue-50", textColor: "text-blue-700" },
    { label: "Montant total", value: `${totalMontant.toLocaleString()} MAD`, icon: DollarSign, color: "bg-purple-50", textColor: "text-purple-700" },
    { label: "Montant paye", value: `${montantPaye.toLocaleString()} MAD`, icon: CheckCircle, color: "bg-emerald-50", textColor: "text-emerald-700" },
    { label: "Montant restant", value: `${montantRestant.toLocaleString()} MAD`, icon: Clock, color: "bg-red-50", textColor: "text-red-700" },
  ];

  const hasFilters = search || filterStatut !== "all";
  const resetFilters = () => {
    setSearch("");
    setFilterStatut("all");
    setCurrentPage(0);
  };

  const handleCreateFacture = () => {
    createFactureMutation.mutate(createForm, {
      onSuccess: () => setCreateOpen(false),
    });
  };

  const handleGenerate = () => {
    if (!generateEleveId) return;
    generateMutation.mutate(Number(generateEleveId), {
      onSuccess: () => {
        setGenerateOpen(false);
        setGenerateEleveId("");
      },
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const handleCreateEcheancier = () => {
    createEcheancierMutation.mutate(echeancierForm, {
      onSuccess: () => setEcheancierFormOpen(false),
    });
  };

  const handleDeleteEcheancier = () => {
    if (!deleteEcheancierTarget) return;
    deleteEcheancierMutation.mutate(deleteEcheancierTarget.id, {
      onSuccess: () => setDeleteEcheancierTarget(null),
    });
  };

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
          <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">Facturation</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gerez les factures et les echeanciers de paiement</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setGenerateEleveId(""); setGenerateOpen(true); }}>
            <FileText className="h-4 w-4" />
            Generer facture
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
            setEcheancierForm({ eleveId: 0, typeFraisId: undefined, montantTotal: 0, nbMensualites: 3, dateDebut: "" });
            setEcheancierFormOpen(true);
          }}>
            <CreditCard className="h-4 w-4" />
            Echeancier
          </Button>
          <Button size="sm" className="gap-1.5 bg-gradient-primary shadow-btn" onClick={() => {
            setCreateForm({ eleveId: 0, dateEmission: new Date().toISOString().split("T")[0], dateEcheance: "", montantTotal: 0, montantRemise: 0, montantNet: 0 });
            setCreateOpen(true);
          }}>
            <Plus className="h-4 w-4" />
            Nouvelle facture
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} custom={i} variants={fadeUp} initial="hidden" animate="visible" className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}>
              <stat.icon className={`h-4.5 w-4.5 ${stat.textColor}`} />
            </div>
            <p className="mt-2.5 font-heading text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(0); }}>
        {/* Filters */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="rounded-xl border border-border/50 bg-card p-4 shadow-sm space-y-3">
          <TabsList>
            <TabsTrigger value="factures">Factures</TabsTrigger>
            <TabsTrigger value="echeanciers">Echeanciers</TabsTrigger>
          </TabsList>
          {activeTab === "factures" && (
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(0); }} placeholder="Rechercher par numero, eleve..." className="pl-9" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={filterStatut} onValueChange={(v) => { setFilterStatut(v); setCurrentPage(0); }}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    {(Object.keys(STATUT_LABELS) as Facture["statut"][]).map((s) => (
                      <SelectItem key={s} value={s}>{STATUT_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasFilters && (
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1 text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" /> Reinitialiser
                  </Button>
                )}
              </div>
            </div>
          )}
          {activeTab === "factures" && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              {totalElements} facture{totalElements !== 1 ? "s" : ""} trouvee{totalElements !== 1 ? "s" : ""}
              {isFetching && <Loader2 className="h-3 w-3 animate-spin" />}
            </div>
          )}
        </motion.div>

        {/* Factures Table */}
        <TabsContent value="factures">
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground">Numero</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground">Eleve</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">Date emission</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-muted-foreground hidden md:table-cell">Montant</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-muted-foreground hidden md:table-cell">Remise</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-muted-foreground">Net</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground">Statut</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {factures.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-muted-foreground">
                        <Receipt className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">Aucune facture trouvee</p>
                        <p className="text-xs mt-1">Essayez de modifier vos filtres</p>
                      </td>
                    </tr>
                  ) : (
                    factures.map((facture) => (
                      <tr key={facture.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs font-medium text-foreground">{facture.numero}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">{facture.eleveNom ?? `Eleve #${facture.eleveId}`}</td>
                        <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground">{new Date(facture.dateEmission).toLocaleDateString("fr-FR")}</td>
                        <td className="py-3 px-4 hidden md:table-cell text-right text-muted-foreground">{facture.montantTotal.toLocaleString()} MAD</td>
                        <td className="py-3 px-4 hidden md:table-cell text-right text-muted-foreground">{facture.montantRemise > 0 ? `-${facture.montantRemise.toLocaleString()}` : "-"}</td>
                        <td className="py-3 px-4 text-right font-semibold text-foreground">{facture.montantNet.toLocaleString()} MAD</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUT_COLORS[facture.statut]}`}>
                            {STATUT_LABELS[facture.statut]}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="hidden sm:flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-600" onClick={() => setDetailTarget(facture)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {facture.statut !== "ANNULEE" && facture.statut !== "PAYEE" && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-orange-600" onClick={() => cancelMutation.mutate(facture.id)}>
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={() => setDeleteTarget(facture)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 sm:hidden"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setDetailTarget(facture)}>
                                <Eye className="h-4 w-4 mr-2" /> Details
                              </DropdownMenuItem>
                              {facture.statut !== "ANNULEE" && facture.statut !== "PAYEE" && (
                                <DropdownMenuItem onClick={() => cancelMutation.mutate(facture.id)}>
                                  <Ban className="h-4 w-4 mr-2" /> Annuler
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => setDeleteTarget(facture)} className="text-red-600">
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

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <p className="text-xs text-muted-foreground">Page {currentPage + 1} sur {totalPages}</p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 0} onClick={() => setCurrentPage((p) => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 7) pageNum = i;
                    else if (currentPage < 4) pageNum = i;
                    else if (currentPage > totalPages - 5) pageNum = totalPages - 7 + i;
                    else pageNum = currentPage - 3 + i;
                    return (
                      <Button key={pageNum} variant={pageNum === currentPage ? "default" : "outline"} size="icon" className="h-8 w-8 text-xs" onClick={() => setCurrentPage(pageNum)}>
                        {pageNum + 1}
                      </Button>
                    );
                  })}
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage((p) => p + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* Echeanciers Tab */}
        <TabsContent value="echeanciers">
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground">ID</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground">Eleve</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-muted-foreground">Montant total</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">Mensualites</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Date debut</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">Echeances</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {echeanciers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-muted-foreground">
                        <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">Aucun echeancier trouve</p>
                      </td>
                    </tr>
                  ) : (
                    echeanciers.map((ech) => {
                      const paidCount = ech.echeances.filter((e) => e.statut === "PAYEE").length;
                      const lateCount = ech.echeances.filter((e) => e.statut === "EN_RETARD").length;
                      return (
                        <tr key={ech.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4 font-mono text-xs text-muted-foreground">#{ech.id}</td>
                          <td className="py-3 px-4 font-medium text-foreground">Eleve #{ech.eleveId}</td>
                          <td className="py-3 px-4 text-right font-semibold text-foreground">{ech.montantTotal.toLocaleString()} MAD</td>
                          <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground">{ech.nbMensualites}</td>
                          <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">{new Date(ech.dateDebut).toLocaleDateString("fr-FR")}</td>
                          <td className="py-3 px-4 hidden lg:table-cell">
                            <div className="flex gap-1">
                              <Badge variant="outline" className="bg-emerald-100 text-emerald-700 text-[10px]">{paidCount} payees</Badge>
                              {lateCount > 0 && <Badge variant="outline" className="bg-red-100 text-red-700 text-[10px]">{lateCount} en retard</Badge>}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={() => setDeleteEcheancierTarget(ech)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Generate Facture Dialog */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Generer une facture</DialogTitle>
            <DialogDescription>Generez automatiquement une facture pour un eleve.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="genEleveId">ID Eleve</Label>
              <Input id="genEleveId" type="number" value={generateEleveId} onChange={(e) => setGenerateEleveId(e.target.value)} placeholder="Saisissez l'ID de l'eleve" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button onClick={handleGenerate} disabled={generateMutation.isPending || !generateEleveId}>
              {generateMutation.isPending ? "Generation..." : "Generer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Facture Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle facture</DialogTitle>
            <DialogDescription>Creez une facture manuellement.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="factEleveId">ID Eleve</Label>
              <Input id="factEleveId" type="number" value={createForm.eleveId || ""} onChange={(e) => {
                const v = Number(e.target.value);
                setCreateForm({ ...createForm, eleveId: v });
              }} placeholder="ID de l'eleve" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="factDateEmission">Date emission</Label>
                <Input id="factDateEmission" type="date" value={createForm.dateEmission} onChange={(e) => setCreateForm({ ...createForm, dateEmission: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="factDateEcheance">Date echeance</Label>
                <Input id="factDateEcheance" type="date" value={createForm.dateEcheance} onChange={(e) => setCreateForm({ ...createForm, dateEcheance: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="factMontant">Montant</Label>
                <Input id="factMontant" type="number" value={createForm.montantTotal || ""} onChange={(e) => {
                  const total = Number(e.target.value);
                  setCreateForm({ ...createForm, montantTotal: total, montantNet: total - createForm.montantRemise });
                }} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="factRemise">Remise</Label>
                <Input id="factRemise" type="number" value={createForm.montantRemise || ""} onChange={(e) => {
                  const remise = Number(e.target.value);
                  setCreateForm({ ...createForm, montantRemise: remise, montantNet: createForm.montantTotal - remise });
                }} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="factNet">Net</Label>
                <Input id="factNet" type="number" value={createForm.montantNet || ""} readOnly className="bg-muted/30" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button onClick={handleCreateFacture} disabled={createFactureMutation.isPending || !createForm.eleveId}>
              {createFactureMutation.isPending ? "Creation..." : "Creer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailTarget} onOpenChange={(open) => !open && setDetailTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Details de la facture</DialogTitle>
          </DialogHeader>
          {detailTarget && (
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Numero</p>
                  <p className="font-mono font-medium">{detailTarget.numero}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Eleve</p>
                  <p className="font-medium">{detailTarget.eleveNom ?? `#${detailTarget.eleveId}`}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date emission</p>
                  <p>{new Date(detailTarget.dateEmission).toLocaleDateString("fr-FR")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date echeance</p>
                  <p>{detailTarget.dateEcheance ? new Date(detailTarget.dateEcheance).toLocaleDateString("fr-FR") : "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Montant total</p>
                  <p className="font-medium">{detailTarget.montantTotal.toLocaleString()} MAD</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Remise</p>
                  <p>{detailTarget.montantRemise > 0 ? `${detailTarget.montantRemise.toLocaleString()} MAD` : "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Montant net</p>
                  <p className="font-heading text-lg font-bold">{detailTarget.montantNet.toLocaleString()} MAD</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Statut</p>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUT_COLORS[detailTarget.statut]}`}>
                    {STATUT_LABELS[detailTarget.statut]}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Fermer</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Echeancier Dialog */}
      <Dialog open={echeancierFormOpen} onOpenChange={setEcheancierFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvel echeancier</DialogTitle>
            <DialogDescription>Creez un echeancier de paiement pour un eleve.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="echEleveId">ID Eleve</Label>
              <Input id="echEleveId" type="number" value={echeancierForm.eleveId || ""} onChange={(e) => setEcheancierForm({ ...echeancierForm, eleveId: Number(e.target.value) })} placeholder="ID de l'eleve" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="echMontant">Montant total</Label>
                <Input id="echMontant" type="number" value={echeancierForm.montantTotal || ""} onChange={(e) => setEcheancierForm({ ...echeancierForm, montantTotal: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="echMensualites">Nombre de mensualites</Label>
                <Input id="echMensualites" type="number" min={1} value={echeancierForm.nbMensualites} onChange={(e) => setEcheancierForm({ ...echeancierForm, nbMensualites: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="echDateDebut">Date debut</Label>
              <Input id="echDateDebut" type="date" value={echeancierForm.dateDebut} onChange={(e) => setEcheancierForm({ ...echeancierForm, dateDebut: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button onClick={handleCreateEcheancier} disabled={createEcheancierMutation.isPending || !echeancierForm.eleveId || !echeancierForm.montantTotal}>
              {createEcheancierMutation.isPending ? "Creation..." : "Creer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Facture Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer la facture</DialogTitle>
            <DialogDescription>
              Etes-vous sur de vouloir supprimer la facture{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.numero}</span> ?
              Cette action est irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Echeancier Confirmation */}
      <Dialog open={!!deleteEcheancierTarget} onOpenChange={(open) => !open && setDeleteEcheancierTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer l'echeancier</DialogTitle>
            <DialogDescription>Etes-vous sur de vouloir supprimer cet echeancier ? Cette action est irreversible.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button variant="destructive" onClick={handleDeleteEcheancier} disabled={deleteEcheancierMutation.isPending}>
              {deleteEcheancierMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
