import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Banknote,
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  DollarSign,
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
  useFichesPaie,
  useCreateFichePaie,
  useUpdateFichePaie,
  useDeleteFichePaie,
} from "@/hooks/useRh";
import type { FichePaie, CreateFichePaieRequest } from "@/types/rh";

const MOIS_LABELS: Record<number, string> = {
  1: "Janvier",
  2: "Fevrier",
  3: "Mars",
  4: "Avril",
  5: "Mai",
  6: "Juin",
  7: "Juillet",
  8: "Aout",
  9: "Septembre",
  10: "Octobre",
  11: "Novembre",
  12: "Decembre",
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

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

export default function PaiePage() {
  const [filterMois, setFilterMois] = useState(String(currentMonth));
  const [filterAnnee, setFilterAnnee] = useState(String(currentYear));
  const [search, setSearch] = useState("");
  const [filterPaye, setFilterPaye] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FichePaie | null>(null);
  const [form, setForm] = useState<CreateFichePaieRequest>({
    employeId: 0,
    employeType: "ENSEIGNANT",
    mois: currentMonth,
    annee: currentYear,
    salaireBase: 0,
    primes: 0,
    retenues: 0,
    salaireNet: 0,
    paye: false,
    commentaire: "",
  });

  const [deleteTarget, setDeleteTarget] = useState<FichePaie | null>(null);

  const { data: fichesPaie = [], isLoading } = useFichesPaie();
  const createMutation = useCreateFichePaie();
  const updateMutation = useUpdateFichePaie();
  const deleteMutation = useDeleteFichePaie();

  // Filter by month/year + search
  const filtered = useMemo(() => {
    let list = fichesPaie;

    if (filterMois !== "all") {
      list = list.filter((f) => f.mois === Number(filterMois));
    }
    if (filterAnnee !== "all") {
      list = list.filter((f) => f.annee === Number(filterAnnee));
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (f) =>
          String(f.employeId).includes(q) ||
          f.employeType.toLowerCase().includes(q)
      );
    }
    if (filterPaye !== "all") {
      list = list.filter((f) =>
        filterPaye === "oui" ? f.paye : !f.paye
      );
    }
    return list;
  }, [fichesPaie, filterMois, filterAnnee, search, filterPaye]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const totalMasse = filtered.reduce((sum, f) => sum + f.salaireNet, 0);
  const totalPaye = filtered.filter((f) => f.paye).length;
  const totalNonPaye = filtered.filter((f) => !f.paye).length;

  const stats = [
    {
      label: "Masse salariale",
      value: `${totalMasse.toLocaleString()} MAD`,
      icon: DollarSign,
      color: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      label: "Fiches",
      value: filtered.length,
      icon: Banknote,
      color: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      label: "Payees",
      value: totalPaye,
      icon: CheckCircle,
      color: "bg-emerald-50",
      textColor: "text-emerald-700",
    },
    {
      label: "En attente",
      value: totalNonPaye,
      icon: Clock,
      color: "bg-amber-50",
      textColor: "text-amber-700",
    },
  ];

  // Auto-calculate salaire net
  const updateSalaireNet = (updates: Partial<CreateFichePaieRequest>) => {
    const newForm = { ...form, ...updates };
    const base = newForm.salaireBase || 0;
    const primes = newForm.primes || 0;
    const retenues = newForm.retenues || 0;
    newForm.salaireNet = base + primes - retenues;
    setForm(newForm);
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm({
      employeId: 0,
      employeType: "ENSEIGNANT",
      mois: currentMonth,
      annee: currentYear,
      salaireBase: 0,
      primes: 0,
      retenues: 0,
      salaireNet: 0,
      paye: false,
      commentaire: "",
    });
    setFormOpen(true);
  };

  const openEdit = (f: FichePaie) => {
    setEditTarget(f);
    setForm({
      employeId: f.employeId,
      employeType: f.employeType,
      mois: f.mois,
      annee: f.annee,
      salaireBase: f.salaireBase,
      primes: f.primes,
      retenues: f.retenues,
      salaireNet: f.salaireNet,
      datePaiement: f.datePaiement,
      paye: f.paye,
      commentaire: f.commentaire ?? "",
    });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (editTarget) {
      updateMutation.mutate(
        { id: editTarget.id, data: form },
        { onSuccess: () => setFormOpen(false) }
      );
    } else {
      createMutation.mutate(form, {
        onSuccess: () => setFormOpen(false),
      });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const hasFilters = search || filterPaye !== "all";
  const resetFilters = () => {
    setSearch("");
    setFilterPaye("all");
    setCurrentPage(0);
  };

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">
            Fiches de paie
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestion des salaires et fiches de paie du personnel
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-gradient-primary shadow-btn"
          onClick={openCreate}
        >
          <Plus className="h-4 w-4" />
          Nouvelle fiche de paie
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-xl border border-border/50 bg-card p-4 shadow-sm"
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}
            >
              <stat.icon className={`h-4.5 w-4.5 ${stat.textColor}`} />
            </div>
            <p className="mt-2.5 font-heading text-2xl font-bold text-foreground">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        custom={4}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="rounded-xl border border-border/50 bg-card p-4 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <Select
            value={filterMois}
            onValueChange={(v) => {
              setFilterMois(v);
              setCurrentPage(0);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Mois" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les mois</SelectItem>
              {Object.entries(MOIS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filterAnnee}
            onValueChange={(v) => {
              setFilterAnnee(v);
              setCurrentPage(0);
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Annee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(0);
              }}
              placeholder="Rechercher par ID employe..."
              className="pl-9"
            />
          </div>
          <Select
            value={filterPaye}
            onValueChange={(v) => {
              setFilterPaye(v);
              setCurrentPage(0);
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Paiement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="oui">Payees</SelectItem>
              <SelectItem value="non">Non payees</SelectItem>
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" /> Reinitialiser
            </Button>
          )}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        custom={5}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground">
                  Employe
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                  Periode
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">
                  Salaire base
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                  Primes
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                  Retenues
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground">
                  Net
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground">
                  Statut
                </th>
                <th className="py-3 px-4 text-right text-xs font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-16 text-center text-muted-foreground"
                  >
                    <Banknote className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Aucune fiche de paie trouvee</p>
                  </td>
                </tr>
              ) : (
                paginated.map((f) => (
                  <tr
                    key={f.id}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-medium text-foreground">
                          #{f.employeId}
                        </span>
                        <Badge variant="outline" className="ml-2 text-[10px]">
                          {f.employeType}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground">
                      {MOIS_LABELS[f.mois]} {f.annee}
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">
                      {f.salaireBase.toLocaleString()} MAD
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell text-emerald-600">
                      +{f.primes.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell text-red-600">
                      -{f.retenues.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground">
                      {f.salaireNet.toLocaleString()} MAD
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          f.paye
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {f.paye ? "Payee" : "En attente"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="hidden sm:flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-amber-600"
                          onClick={() => openEdit(f)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-600"
                          onClick={() => setDeleteTarget(f)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:hidden"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(f)}>
                            <Edit className="h-4 w-4 mr-2" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(f)}
                            className="text-red-600"
                          >
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
            <p className="text-xs text-muted-foreground">
              Page {currentPage + 1} sur {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Modifier la fiche de paie" : "Nouvelle fiche de paie"}
            </DialogTitle>
            <DialogDescription>
              {editTarget
                ? "Modifiez les details de la fiche de paie."
                : "Creez une nouvelle fiche de paie pour un employe."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="paieEmployeId">ID Employe</Label>
                <Input
                  id="paieEmployeId"
                  type="number"
                  value={form.employeId || ""}
                  onChange={(e) =>
                    setForm({ ...form, employeId: Number(e.target.value) })
                  }
                  placeholder="ID"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={form.employeType}
                  onValueChange={(v) =>
                    setForm({ ...form, employeType: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENSEIGNANT">Enseignant</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="PERSONNEL">Personnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Mois</Label>
                <Select
                  value={String(form.mois)}
                  onValueChange={(v) =>
                    setForm({ ...form, mois: Number(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MOIS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="paieAnnee">Annee</Label>
                <Input
                  id="paieAnnee"
                  type="number"
                  value={form.annee || ""}
                  onChange={(e) =>
                    setForm({ ...form, annee: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="salaireBase">Salaire base (MAD)</Label>
              <Input
                id="salaireBase"
                type="number"
                value={form.salaireBase || ""}
                onChange={(e) =>
                  updateSalaireNet({ salaireBase: Number(e.target.value) })
                }
                placeholder="0"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="primes">Primes (MAD)</Label>
                <Input
                  id="primes"
                  type="number"
                  value={form.primes || ""}
                  onChange={(e) =>
                    updateSalaireNet({ primes: Number(e.target.value) })
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="retenues">Retenues (MAD)</Label>
                <Input
                  id="retenues"
                  type="number"
                  value={form.retenues || ""}
                  onChange={(e) =>
                    updateSalaireNet({ retenues: Number(e.target.value) })
                  }
                  placeholder="0"
                />
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Salaire net
              </span>
              <span className="text-lg font-bold text-foreground">
                {form.salaireNet.toLocaleString()} MAD
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="datePaiement">Date de paiement</Label>
                <Input
                  id="datePaiement"
                  type="date"
                  value={form.datePaiement ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, datePaiement: e.target.value || undefined })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Statut paiement</Label>
                <Select
                  value={form.paye ? "true" : "false"}
                  onValueChange={(v) =>
                    setForm({ ...form, paye: v === "true" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">En attente</SelectItem>
                    <SelectItem value="true">Payee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="commentaire">Commentaire</Label>
              <Textarea
                id="commentaire"
                value={form.commentaire ?? ""}
                onChange={(e) =>
                  setForm({ ...form, commentaire: e.target.value })
                }
                placeholder="Commentaire..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button
              onClick={handleSave}
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                !form.employeId ||
                !form.salaireBase
              }
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Enregistrement..."
                : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer la fiche de paie</DialogTitle>
            <DialogDescription>
              Etes-vous sur de vouloir supprimer cette fiche de paie ? Cette action
              est irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
