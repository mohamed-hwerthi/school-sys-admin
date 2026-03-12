import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Users,
  CalendarDays,
  MapPin,
  UserPlus,
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
  useFormations,
  useCreateFormation,
  useUpdateFormation,
  useDeleteFormation,
  useAddParticipant,
  useRemoveParticipant,
} from "@/hooks/useRh";
import type {
  Formation,
  CreateFormationRequest,
  StatutFormation,
  AddParticipantRequest,
} from "@/types/rh";

const STATUT_LABELS: Record<StatutFormation, string> = {
  PLANIFIEE: "Planifiee",
  EN_COURS: "En cours",
  TERMINEE: "Terminee",
  ANNULEE: "Annulee",
};

const STATUT_COLORS: Record<StatutFormation, string> = {
  PLANIFIEE: "bg-blue-100 text-blue-700",
  EN_COURS: "bg-amber-100 text-amber-700",
  TERMINEE: "bg-emerald-100 text-emerald-700",
  ANNULEE: "bg-red-100 text-red-700",
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

export default function FormationsPage() {
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);

  // Formation form
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Formation | null>(null);
  const [form, setForm] = useState<CreateFormationRequest>({
    titre: "",
    description: "",
    formateur: "",
    dateDebut: "",
    dateFin: "",
    lieu: "",
    nombreHeures: undefined,
    cout: undefined,
    statut: "PLANIFIEE",
  });

  // Participant form
  const [participantDialogOpen, setParticipantDialogOpen] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(
    null
  );
  const [participantForm, setParticipantForm] = useState<AddParticipantRequest>(
    {
      employeId: 0,
      employeType: "ENSEIGNANT",
      present: false,
      certificatObtenu: false,
    }
  );

  const [deleteTarget, setDeleteTarget] = useState<Formation | null>(null);

  const { data: formations = [], isLoading } = useFormations();
  const createMutation = useCreateFormation();
  const updateMutation = useUpdateFormation();
  const deleteMutation = useDeleteFormation();
  const addParticipantMutation = useAddParticipant();
  const removeParticipantMutation = useRemoveParticipant();

  const filtered = useMemo(() => {
    let list = formations;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (f) =>
          f.titre.toLowerCase().includes(q) ||
          (f.formateur && f.formateur.toLowerCase().includes(q)) ||
          (f.lieu && f.lieu.toLowerCase().includes(q))
      );
    }
    if (filterStatut !== "all") {
      list = list.filter((f) => f.statut === filterStatut);
    }
    return list;
  }, [formations, search, filterStatut]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const stats = [
    {
      label: "Total formations",
      value: formations.length,
      icon: GraduationCap,
      color: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      label: "En cours",
      value: formations.filter((f) => f.statut === "EN_COURS").length,
      icon: CalendarDays,
      color: "bg-amber-50",
      textColor: "text-amber-700",
    },
    {
      label: "Terminees",
      value: formations.filter((f) => f.statut === "TERMINEE").length,
      icon: GraduationCap,
      color: "bg-emerald-50",
      textColor: "text-emerald-700",
    },
    {
      label: "Participants",
      value: formations.reduce(
        (sum, f) => sum + (f.participants?.length ?? 0),
        0
      ),
      icon: Users,
      color: "bg-purple-50",
      textColor: "text-purple-700",
    },
  ];

  const openCreate = () => {
    setEditTarget(null);
    setForm({
      titre: "",
      description: "",
      formateur: "",
      dateDebut: "",
      dateFin: "",
      lieu: "",
      nombreHeures: undefined,
      cout: undefined,
      statut: "PLANIFIEE",
    });
    setFormOpen(true);
  };

  const openEdit = (f: Formation) => {
    setEditTarget(f);
    setForm({
      titre: f.titre,
      description: f.description ?? "",
      formateur: f.formateur ?? "",
      dateDebut: f.dateDebut,
      dateFin: f.dateFin ?? "",
      lieu: f.lieu ?? "",
      nombreHeures: f.nombreHeures,
      cout: f.cout,
      statut: f.statut,
    });
    setFormOpen(true);
  };

  const openParticipantDialog = (f: Formation) => {
    setSelectedFormation(f);
    setParticipantForm({
      employeId: 0,
      employeType: "ENSEIGNANT",
      present: false,
      certificatObtenu: false,
    });
    setParticipantDialogOpen(true);
  };

  const handleSave = () => {
    const payload: CreateFormationRequest = {
      ...form,
      dateFin: form.dateFin || undefined,
      description: form.description || undefined,
      formateur: form.formateur || undefined,
      lieu: form.lieu || undefined,
    };

    if (editTarget) {
      updateMutation.mutate(
        { id: editTarget.id, data: payload },
        { onSuccess: () => setFormOpen(false) }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setFormOpen(false),
      });
    }
  };

  const handleAddParticipant = () => {
    if (!selectedFormation) return;
    addParticipantMutation.mutate(
      { formationId: selectedFormation.id, data: participantForm },
      {
        onSuccess: () => {
          setParticipantForm({
            employeId: 0,
            employeType: "ENSEIGNANT",
            present: false,
            certificatObtenu: false,
          });
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const hasFilters = search || filterStatut !== "all";
  const resetFilters = () => {
    setSearch("");
    setFilterStatut("all");
    setCurrentPage(0);
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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">
            Formations
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestion des formations et developpement professionnel
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-gradient-primary shadow-btn"
          onClick={openCreate}
        >
          <Plus className="h-4 w-4" />
          Nouvelle formation
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
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(0);
              }}
              placeholder="Rechercher par titre, formateur, lieu..."
              className="pl-9"
            />
          </div>
          <Select
            value={filterStatut}
            onValueChange={(v) => {
              setFilterStatut(v);
              setCurrentPage(0);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {(Object.keys(STATUT_LABELS) as StatutFormation[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUT_LABELS[s]}
                </SelectItem>
              ))}
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
                  Titre
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                  Formateur
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">
                  Dates
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                  Lieu
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                  Participants
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
                    colSpan={7}
                    className="py-16 text-center text-muted-foreground"
                  >
                    <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Aucune formation trouvee</p>
                  </td>
                </tr>
              ) : (
                paginated.map((f) => (
                  <tr
                    key={f.id}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">
                        {f.titre}
                      </div>
                      {f.nombreHeures && (
                        <span className="text-xs text-muted-foreground">
                          {f.nombreHeures}h
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground">
                      {f.formateur ?? "-"}
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">
                      <div className="text-xs">
                        {new Date(f.dateDebut).toLocaleDateString("fr-FR")}
                        {f.dateFin && (
                          <>
                            {" "}
                            - {new Date(f.dateFin).toLocaleDateString("fr-FR")}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground">
                      {f.lieu ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {f.lieu}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        {f.participants?.length ?? 0}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUT_COLORS[f.statut]}`}
                      >
                        {STATUT_LABELS[f.statut]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="hidden sm:flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                          onClick={() => openParticipantDialog(f)}
                          title="Gerer les participants"
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
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
                          <DropdownMenuItem
                            onClick={() => openParticipantDialog(f)}
                          >
                            <UserPlus className="h-4 w-4 mr-2" /> Participants
                          </DropdownMenuItem>
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

      {/* Create / Edit Formation Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Modifier la formation" : "Nouvelle formation"}
            </DialogTitle>
            <DialogDescription>
              {editTarget
                ? "Modifiez les details de la formation."
                : "Creez une nouvelle formation pour le personnel."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="titre">Titre</Label>
              <Input
                id="titre"
                value={form.titre}
                onChange={(e) => setForm({ ...form, titre: e.target.value })}
                placeholder="Titre de la formation"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Description..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="formateur">Formateur</Label>
                <Input
                  id="formateur"
                  value={form.formateur ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, formateur: e.target.value })
                  }
                  placeholder="Nom du formateur"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lieu">Lieu</Label>
                <Input
                  id="lieu"
                  value={form.lieu ?? ""}
                  onChange={(e) => setForm({ ...form, lieu: e.target.value })}
                  placeholder="Lieu"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dateDebut">Date debut</Label>
                <Input
                  id="dateDebut"
                  type="date"
                  value={form.dateDebut}
                  onChange={(e) =>
                    setForm({ ...form, dateDebut: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dateFin">Date fin</Label>
                <Input
                  id="dateFin"
                  type="date"
                  value={form.dateFin ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, dateFin: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="nombreHeures">Heures</Label>
                <Input
                  id="nombreHeures"
                  type="number"
                  value={form.nombreHeures ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nombreHeures: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cout">Cout (MAD)</Label>
                <Input
                  id="cout"
                  type="number"
                  value={form.cout ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      cout: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Statut</Label>
                <Select
                  value={form.statut}
                  onValueChange={(v) =>
                    setForm({ ...form, statut: v as StatutFormation })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUT_LABELS) as StatutFormation[]).map(
                      (s) => (
                        <SelectItem key={s} value={s}>
                          {STATUT_LABELS[s]}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
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
                !form.titre ||
                !form.dateDebut
              }
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Enregistrement..."
                : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Participants Dialog */}
      <Dialog
        open={participantDialogOpen}
        onOpenChange={setParticipantDialogOpen}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Participants - {selectedFormation?.titre}
            </DialogTitle>
            <DialogDescription>
              Gerez les participants de cette formation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Existing participants */}
            {selectedFormation?.participants &&
            selectedFormation.participants.length > 0 ? (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Participants inscrits
                </Label>
                <div className="max-h-[200px] overflow-y-auto space-y-1.5">
                  {selectedFormation.participants.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 p-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          #{p.employeId}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {p.employeType}
                        </Badge>
                        {p.present && (
                          <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                            Present
                          </Badge>
                        )}
                        {p.certificatObtenu && (
                          <Badge className="bg-blue-100 text-blue-700 text-[10px]">
                            Certifie
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-red-600"
                        onClick={() =>
                          removeParticipantMutation.mutate(p.id)
                        }
                        disabled={removeParticipantMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun participant inscrit
              </p>
            )}

            {/* Add participant form */}
            <div className="border-t border-border pt-4 space-y-3">
              <Label className="text-xs text-muted-foreground">
                Ajouter un participant
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="partEmployeId">ID Employe</Label>
                  <Input
                    id="partEmployeId"
                    type="number"
                    value={participantForm.employeId || ""}
                    onChange={(e) =>
                      setParticipantForm({
                        ...participantForm,
                        employeId: Number(e.target.value),
                      })
                    }
                    placeholder="ID"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select
                    value={participantForm.employeType}
                    onValueChange={(v) =>
                      setParticipantForm({
                        ...participantForm,
                        employeType: v,
                      })
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
              <Button
                onClick={handleAddParticipant}
                disabled={
                  addParticipantMutation.isPending ||
                  !participantForm.employeId
                }
                className="w-full gap-1.5"
              >
                <UserPlus className="h-4 w-4" />
                {addParticipantMutation.isPending
                  ? "Ajout..."
                  : "Ajouter le participant"}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Fermer</Button>
            </DialogClose>
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
            <DialogTitle>Supprimer la formation</DialogTitle>
            <DialogDescription>
              Etes-vous sur de vouloir supprimer la formation &quot;
              {deleteTarget?.titre}&quot; ? Cette action est irreversible.
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
