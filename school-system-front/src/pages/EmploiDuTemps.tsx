import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Save,
  Loader2,
  AlertTriangle,
  Plus,
  X,
  Clock,
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
  useEmploiByClasse,
  useCreneaux,
  useSaveEmploi,
  useCheckConflits,
  useCreateCreneau,
} from "@/hooks/useEmploiDuTemps";
import { useClasses } from "@/hooks/useClasses";
import { useTeachers } from "@/hooks/useTeachers";
import { useModules } from "@/hooks/useModules";
import type { EmploiDuTempsEntry, Creneau, Conflit } from "@/types/emploi-du-temps";

const JOURS = [
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
};

const SLOT_COLORS = [
  "bg-blue-50 border-blue-200 text-blue-800",
  "bg-emerald-50 border-emerald-200 text-emerald-800",
  "bg-purple-50 border-purple-200 text-purple-800",
  "bg-orange-50 border-orange-200 text-orange-800",
  "bg-pink-50 border-pink-200 text-pink-800",
  "bg-cyan-50 border-cyan-200 text-cyan-800",
];

export default function EmploiDuTempsPage() {
  const [selectedClasseId, setSelectedClasseId] = useState(0);
  const [editingEntry, setEditingEntry] = useState<{
    jour: number;
    creneauId: number;
    existing?: EmploiDuTempsEntry;
  } | null>(null);
  const [entryModuleId, setEntryModuleId] = useState("");
  const [entryEnseignantId, setEntryEnseignantId] = useState("");
  const [entrySalle, setEntrySalle] = useState("");
  const [creneauDialogOpen, setCreneauDialogOpen] = useState(false);
  const [newCreneau, setNewCreneau] = useState({
    label: "",
    heureDebut: "",
    heureFin: "",
    type: "COURS" as Creneau["type"],
  });
  const [conflits, setConflits] = useState<Conflit[]>([]);
  const [localEntries, setLocalEntries] = useState<EmploiDuTempsEntry[]>([]);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  const { data: classes = [] } = useClasses();
  const { teachers } = useTeachers();
  const { data: modules = [] } = useModules();
  const { data: creneaux = [], isLoading: creneauxLoading } = useCreneaux();
  const { data: serverEntries = [], isLoading: entriesLoading } =
    useEmploiByClasse(selectedClasseId);

  const saveMutation = useSaveEmploi();
  const checkConflitsMutation = useCheckConflits();
  const createCreneauMutation = useCreateCreneau();

  // Sync server entries to local when they change and no local edits
  const entries = hasLocalChanges ? localEntries : serverEntries;

  const courseCreneaux = useMemo(
    () => creneaux.filter((c) => c.type === "COURS"),
    [creneaux]
  );

  const getEntry = (jour: number, creneauId: number) =>
    entries.find((e) => e.jourSemaine === jour && e.creneauId === creneauId);

  const getModuleColor = (moduleId?: number) => {
    if (!moduleId) return "";
    return SLOT_COLORS[moduleId % SLOT_COLORS.length];
  };

  const openSlotEditor = (jour: number, creneauId: number) => {
    const existing = getEntry(jour, creneauId);
    setEditingEntry({ jour, creneauId, existing });
    setEntryModuleId(existing?.moduleId ? String(existing.moduleId) : "");
    setEntryEnseignantId(
      existing?.enseignantId ? String(existing.enseignantId) : ""
    );
    setEntrySalle(existing?.salle ?? "");
  };

  const handleSaveSlot = () => {
    if (!editingEntry) return;
    const { jour, creneauId } = editingEntry;
    const newEntry: EmploiDuTempsEntry = {
      classeId: selectedClasseId,
      jourSemaine: jour,
      creneauId,
      moduleId: entryModuleId ? Number(entryModuleId) : undefined,
      moduleName: modules.find((m) => m.id === Number(entryModuleId))?.name,
      enseignantId: entryEnseignantId ? Number(entryEnseignantId) : undefined,
      enseignantNom: teachers.find((t) => t.id === Number(entryEnseignantId))
        ? `${teachers.find((t) => t.id === Number(entryEnseignantId))!.prenom} ${teachers.find((t) => t.id === Number(entryEnseignantId))!.nom}`
        : undefined,
      salle: entrySalle || undefined,
    };

    const updated = [
      ...entries.filter(
        (e) => !(e.jourSemaine === jour && e.creneauId === creneauId)
      ),
      newEntry,
    ];
    setLocalEntries(updated);
    setHasLocalChanges(true);
    setEditingEntry(null);
  };

  const handleRemoveSlot = () => {
    if (!editingEntry) return;
    const { jour, creneauId } = editingEntry;
    const updated = entries.filter(
      (e) => !(e.jourSemaine === jour && e.creneauId === creneauId)
    );
    setLocalEntries(updated);
    setHasLocalChanges(true);
    setEditingEntry(null);
  };

  const handleSaveAll = () => {
    if (!selectedClasseId) return;
    checkConflitsMutation.mutate(
      { classeId: selectedClasseId, entries: localEntries },
      {
        onSuccess: (result) => {
          if (result.length > 0) {
            setConflits(result);
          } else {
            saveMutation.mutate(
              { classeId: selectedClasseId, entries: localEntries },
              {
                onSuccess: () => {
                  setHasLocalChanges(false);
                  setConflits([]);
                },
              }
            );
          }
        },
      }
    );
  };

  const handleForceSave = () => {
    if (!selectedClasseId) return;
    saveMutation.mutate(
      { classeId: selectedClasseId, entries: localEntries },
      {
        onSuccess: () => {
          setHasLocalChanges(false);
          setConflits([]);
        },
      }
    );
  };

  const handleCreateCreneau = () => {
    createCreneauMutation.mutate(newCreneau, {
      onSuccess: () => {
        setCreneauDialogOpen(false);
        setNewCreneau({ label: "", heureDebut: "", heureFin: "", type: "COURS" });
      },
    });
  };

  const isLoading = creneauxLoading || (entriesLoading && selectedClasseId > 0);

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
            Emploi du Temps
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerez l'emploi du temps par classe
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setCreneauDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Nouveau creneau
          </Button>
          {hasLocalChanges && (
            <Button
              size="sm"
              className="gap-1.5 bg-gradient-primary shadow-btn"
              onClick={handleSaveAll}
              disabled={saveMutation.isPending || checkConflitsMutation.isPending}
            >
              {saveMutation.isPending || checkConflitsMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Enregistrer
            </Button>
          )}
        </div>
      </motion.div>

      {/* Class selector */}
      <motion.div
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="rounded-xl border border-border/50 bg-card p-4 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <Select
            value={selectedClasseId ? String(selectedClasseId) : ""}
            onValueChange={(v) => {
              setSelectedClasseId(Number(v));
              setHasLocalChanges(false);
              setConflits([]);
            }}
          >
            <SelectTrigger className="w-[250px]">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Selectionner une classe" />
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
      </motion.div>

      {/* Conflicts warning */}
      {conflits.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-orange-200 bg-orange-50 p-4 space-y-2"
        >
          <div className="flex items-center gap-2 text-orange-700 font-medium">
            <AlertTriangle className="h-4 w-4" />
            Conflits detectes
          </div>
          <ul className="text-sm text-orange-600 list-disc pl-5 space-y-1">
            {conflits.map((c, i) => (
              <li key={i}>{c.message}</li>
            ))}
          </ul>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setConflits([])}>
              Corriger
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleForceSave}
              disabled={saveMutation.isPending}
            >
              Enregistrer quand meme
            </Button>
          </div>
        </motion.div>
      )}

      {/* Grid */}
      {selectedClasseId > 0 ? (
        isLoading ? (
          <div className="flex h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="py-3 px-3 text-left text-xs font-semibold text-muted-foreground w-[100px]">
                      Creneau
                    </th>
                    {JOURS.map((j) => (
                      <th
                        key={j.value}
                        className="py-3 px-2 text-center text-xs font-semibold text-muted-foreground min-w-[140px]"
                      >
                        {j.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {creneaux.map((creneau) => (
                    <tr
                      key={creneau.id}
                      className={`border-b border-border/50 ${
                        creneau.type !== "COURS" ? "bg-muted/10" : ""
                      }`}
                    >
                      <td className="py-2 px-3 text-xs text-muted-foreground">
                        <div className="font-medium">{creneau.label}</div>
                        <div className="text-[10px]">
                          {creneau.heureDebut} - {creneau.heureFin}
                        </div>
                        {creneau.type !== "COURS" && (
                          <Badge variant="outline" className="text-[10px] mt-0.5">
                            {creneau.type === "PAUSE" ? "Pause" : "Recreation"}
                          </Badge>
                        )}
                      </td>
                      {JOURS.map((jour) => {
                        if (creneau.type !== "COURS") {
                          return (
                            <td
                              key={jour.value}
                              className="py-2 px-2 text-center text-xs text-muted-foreground/50"
                            >
                              -
                            </td>
                          );
                        }
                        const entry = getEntry(jour.value, creneau.id);
                        return (
                          <td key={jour.value} className="py-2 px-2">
                            <button
                              className={`w-full rounded-lg border p-2 text-left text-xs transition-all hover:shadow-md cursor-pointer ${
                                entry
                                  ? getModuleColor(entry.moduleId)
                                  : "border-dashed border-border hover:border-primary/40 hover:bg-muted/30"
                              }`}
                              onClick={() =>
                                openSlotEditor(jour.value, creneau.id)
                              }
                            >
                              {entry ? (
                                <>
                                  <div className="font-semibold truncate">
                                    {entry.moduleName ?? "Module"}
                                  </div>
                                  {entry.enseignantNom && (
                                    <div className="text-[10px] opacity-70 truncate">
                                      {entry.enseignantNom}
                                    </div>
                                  )}
                                  {entry.salle && (
                                    <div className="text-[10px] opacity-60">
                                      Salle: {entry.salle}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-muted-foreground/50 text-center py-1">
                                  <Plus className="h-3 w-3 mx-auto" />
                                </div>
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )
      ) : (
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="rounded-xl border border-border/50 bg-card shadow-sm p-16 text-center"
        >
          <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30 text-muted-foreground" />
          <p className="font-medium text-muted-foreground">
            Selectionnez une classe
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Choisissez une classe pour afficher et modifier son emploi du temps
          </p>
        </motion.div>
      )}

      {/* Slot Editor Dialog */}
      <Dialog
        open={!!editingEntry}
        onOpenChange={(open) => !open && setEditingEntry(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEntry?.existing
                ? "Modifier le creneau"
                : "Assigner un creneau"}
            </DialogTitle>
            <DialogDescription>
              {JOURS.find((j) => j.value === editingEntry?.jour)?.label} -{" "}
              {creneaux.find((c) => c.id === editingEntry?.creneauId)?.label}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Matiere</Label>
              <Select value={entryModuleId} onValueChange={setEntryModuleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectionner une matiere" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Enseignant</Label>
              <Select
                value={entryEnseignantId}
                onValueChange={setEntryEnseignantId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectionner un enseignant" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.prenom} {t.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="salle">Salle</Label>
              <Input
                id="salle"
                value={entrySalle}
                onChange={(e) => setEntrySalle(e.target.value)}
                placeholder="Ex: Salle 101"
              />
            </div>
          </div>
          <DialogFooter>
            {editingEntry?.existing && (
              <Button
                variant="destructive"
                onClick={handleRemoveSlot}
                className="mr-auto"
              >
                Supprimer
              </Button>
            )}
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleSaveSlot}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Creneau Dialog */}
      <Dialog open={creneauDialogOpen} onOpenChange={setCreneauDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau creneau horaire</DialogTitle>
            <DialogDescription>
              Definissez un nouveau creneau horaire pour l'emploi du temps.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="creneauLabel">Libelle</Label>
              <Input
                id="creneauLabel"
                value={newCreneau.label}
                onChange={(e) =>
                  setNewCreneau({ ...newCreneau, label: e.target.value })
                }
                placeholder="Ex: 1ere heure"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="heureDebut">Heure debut</Label>
                <Input
                  id="heureDebut"
                  type="time"
                  value={newCreneau.heureDebut}
                  onChange={(e) =>
                    setNewCreneau({ ...newCreneau, heureDebut: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="heureFin">Heure fin</Label>
                <Input
                  id="heureFin"
                  type="time"
                  value={newCreneau.heureFin}
                  onChange={(e) =>
                    setNewCreneau({ ...newCreneau, heureFin: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={newCreneau.type}
                onValueChange={(v) =>
                  setNewCreneau({
                    ...newCreneau,
                    type: v as Creneau["type"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COURS">Cours</SelectItem>
                  <SelectItem value="PAUSE">Pause</SelectItem>
                  <SelectItem value="RECREATION">Recreation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button
              onClick={handleCreateCreneau}
              disabled={
                createCreneauMutation.isPending ||
                !newCreneau.label ||
                !newCreneau.heureDebut ||
                !newCreneau.heureFin
              }
            >
              {createCreneauMutation.isPending
                ? "Creation..."
                : "Creer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
