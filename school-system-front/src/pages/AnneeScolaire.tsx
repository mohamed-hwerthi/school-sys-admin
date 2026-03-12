import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  CalendarDays,
  Sun,
  Star,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  useAllAnneesScolaires,
  useCreateAnneeScolaire,
  useUpdateAnneeScolaire,
  useCloturerAnneeScolaire,
  useActivateAnneeScolaire,
  useTrimestres,
  useCreateTrimestre,
  useDeleteTrimestre,
  useVacances,
  useCreateVacance,
  useDeleteVacance,
  useJoursFeries,
  useCreateJourFerie,
  useDeleteJourFerie,
} from "@/hooks/useAnneeScolaire";
import type { AnneeScolaire, Trimestre, Vacance, JourFerie } from "@/types/annee-scolaire";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
};

export default function AnneeScolairePage() {
  const [selectedAnneeId, setSelectedAnneeId] = useState(0);
  const [activeTab, setActiveTab] = useState("trimestres");

  // Annee form
  const [anneeFormOpen, setAnneeFormOpen] = useState(false);
  const [editAnnee, setEditAnnee] = useState<AnneeScolaire | null>(null);
  const [anneeForm, setAnneeForm] = useState({ label: "", dateDebut: "", dateFin: "" });

  // Trimestre form
  const [trimestreFormOpen, setTrimestreFormOpen] = useState(false);
  const [trimestreForm, setTrimestreForm] = useState({
    numero: 1,
    label: "",
    dateDebut: "",
    dateFin: "",
    saisieNotesOuverte: false,
  });

  // Vacance form
  const [vacanceFormOpen, setVacanceFormOpen] = useState(false);
  const [vacanceForm, setVacanceForm] = useState({ label: "", dateDebut: "", dateFin: "" });

  // Jour ferie form
  const [jourFerieFormOpen, setJourFerieFormOpen] = useState(false);
  const [jourFerieForm, setJourFerieForm] = useState({ label: "", date: "" });

  // Delete targets
  const [deleteTrimestreId, setDeleteTrimestreId] = useState<number | null>(null);
  const [deleteVacanceId, setDeleteVacanceId] = useState<number | null>(null);
  const [deleteJourFerieId, setDeleteJourFerieId] = useState<number | null>(null);

  const { data: annees = [], isLoading } = useAllAnneesScolaires();
  const createAnneeMutation = useCreateAnneeScolaire();
  const updateAnneeMutation = useUpdateAnneeScolaire();
  const cloturerMutation = useCloturerAnneeScolaire();
  const activateMutation = useActivateAnneeScolaire();

  const { data: trimestres = [] } = useTrimestres(selectedAnneeId);
  const createTrimestreMutation = useCreateTrimestre();
  const deleteTrimestreMutation = useDeleteTrimestre();

  const { data: vacances = [] } = useVacances(selectedAnneeId);
  const createVacanceMutation = useCreateVacance();
  const deleteVacanceMutation = useDeleteVacance();

  const { data: joursFeries = [] } = useJoursFeries(selectedAnneeId);
  const createJourFerieMutation = useCreateJourFerie();
  const deleteJourFerieMutation = useDeleteJourFerie();

  const selectedAnnee = annees.find((a) => a.id === selectedAnneeId);

  const openCreateAnnee = () => {
    setEditAnnee(null);
    setAnneeForm({ label: "", dateDebut: "", dateFin: "" });
    setAnneeFormOpen(true);
  };

  const openEditAnnee = (a: AnneeScolaire) => {
    setEditAnnee(a);
    setAnneeForm({ label: a.label, dateDebut: a.dateDebut, dateFin: a.dateFin });
    setAnneeFormOpen(true);
  };

  const handleSaveAnnee = () => {
    if (editAnnee) {
      updateAnneeMutation.mutate(
        { id: editAnnee.id, data: anneeForm },
        { onSuccess: () => setAnneeFormOpen(false) }
      );
    } else {
      createAnneeMutation.mutate(anneeForm, {
        onSuccess: () => setAnneeFormOpen(false),
      });
    }
  };

  const handleCreateTrimestre = () => {
    if (!selectedAnneeId) return;
    createTrimestreMutation.mutate(
      { anneeScolaireId: selectedAnneeId, data: trimestreForm },
      { onSuccess: () => setTrimestreFormOpen(false) }
    );
  };

  const handleCreateVacance = () => {
    if (!selectedAnneeId) return;
    createVacanceMutation.mutate(
      { anneeScolaireId: selectedAnneeId, data: vacanceForm },
      { onSuccess: () => setVacanceFormOpen(false) }
    );
  };

  const handleCreateJourFerie = () => {
    if (!selectedAnneeId) return;
    createJourFerieMutation.mutate(
      { anneeScolaireId: selectedAnneeId, data: jourFerieForm },
      { onSuccess: () => setJourFerieFormOpen(false) }
    );
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
          <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">Annee Scolaire</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gerez les annees scolaires, trimestres et vacances</p>
        </div>
        <Button size="sm" className="gap-1.5 bg-gradient-primary shadow-btn" onClick={openCreateAnnee}>
          <Plus className="h-4 w-4" />
          Nouvelle annee
        </Button>
      </motion.div>

      {/* Annees list */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {annees.map((annee) => (
          <div
            key={annee.id}
            className={`rounded-xl border p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
              selectedAnneeId === annee.id
                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                : "border-border/50 bg-card"
            }`}
            onClick={() => setSelectedAnneeId(annee.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-heading font-bold text-foreground">{annee.label}</span>
              </div>
              <div className="flex items-center gap-1">
                {annee.active && (
                  <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                )}
                {annee.cloturee && (
                  <Badge className="bg-red-100 text-red-700">Cloturee</Badge>
                )}
                {!annee.active && !annee.cloturee && (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(annee.dateDebut).toLocaleDateString("fr-FR")} -{" "}
              {new Date(annee.dateFin).toLocaleDateString("fr-FR")}
            </p>
            <div className="flex items-center gap-1 mt-3">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEditAnnee(annee); }}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              {!annee.active && !annee.cloturee && (
                <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600" onClick={(e) => { e.stopPropagation(); activateMutation.mutate(annee.id); }}>
                  <Unlock className="h-3.5 w-3.5" />
                </Button>
              )}
              {annee.active && !annee.cloturee && (
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={(e) => { e.stopPropagation(); cloturerMutation.mutate(annee.id); }}>
                  <Lock className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}
        {annees.length === 0 && (
          <div className="col-span-full rounded-xl border border-border/50 bg-card p-12 text-center">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30 text-muted-foreground" />
            <p className="font-medium text-muted-foreground">Aucune annee scolaire</p>
            <p className="text-xs text-muted-foreground mt-1">Creez une nouvelle annee scolaire pour commencer</p>
          </div>
        )}
      </motion.div>

      {/* Selected year details */}
      {selectedAnneeId > 0 && selectedAnnee && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-lg font-bold text-foreground">
                {selectedAnnee.label} - Details
              </h2>
              <TabsList>
                <TabsTrigger value="trimestres">Trimestres</TabsTrigger>
                <TabsTrigger value="vacances">Vacances</TabsTrigger>
                <TabsTrigger value="jours-feries">Jours feries</TabsTrigger>
              </TabsList>
            </div>

            {/* Trimestres */}
            <TabsContent value="trimestres" className="space-y-3">
              <div className="flex justify-end">
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => {
                  setTrimestreForm({ numero: trimestres.length + 1, label: `Trimestre ${trimestres.length + 1}`, dateDebut: "", dateFin: "", saisieNotesOuverte: false });
                  setTrimestreFormOpen(true);
                }}>
                  <Plus className="h-4 w-4" />
                  Ajouter un trimestre
                </Button>
              </div>
              {trimestres.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucun trimestre defini</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {trimestres.map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/10 p-3">
                      <div>
                        <p className="font-medium text-foreground">{t.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(t.dateDebut).toLocaleDateString("fr-FR")} - {new Date(t.dateFin).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={t.saisieNotesOuverte ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}>
                          {t.saisieNotesOuverte ? "Notes ouvertes" : "Notes fermees"}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-600" onClick={() => setDeleteTrimestreId(t.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Vacances */}
            <TabsContent value="vacances" className="space-y-3">
              <div className="flex justify-end">
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => {
                  setVacanceForm({ label: "", dateDebut: "", dateFin: "" });
                  setVacanceFormOpen(true);
                }}>
                  <Plus className="h-4 w-4" />
                  Ajouter des vacances
                </Button>
              </div>
              {vacances.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Sun className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucune periode de vacances definie</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {vacances.map((v) => (
                    <div key={v.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/10 p-3">
                      <div>
                        <p className="font-medium text-foreground">{v.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(v.dateDebut).toLocaleDateString("fr-FR")} - {new Date(v.dateFin).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-600" onClick={() => setDeleteVacanceId(v.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Jours Feries */}
            <TabsContent value="jours-feries" className="space-y-3">
              <div className="flex justify-end">
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => {
                  setJourFerieForm({ label: "", date: "" });
                  setJourFerieFormOpen(true);
                }}>
                  <Plus className="h-4 w-4" />
                  Ajouter un jour ferie
                </Button>
              </div>
              {joursFeries.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Star className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucun jour ferie defini</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {joursFeries.map((jf) => (
                    <div key={jf.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/10 p-3">
                      <div>
                        <p className="font-medium text-foreground">{jf.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(jf.date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-600" onClick={() => setDeleteJourFerieId(jf.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </motion.div>
        </Tabs>
      )}

      {/* Create / Edit Annee Dialog */}
      <Dialog open={anneeFormOpen} onOpenChange={setAnneeFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editAnnee ? "Modifier l'annee scolaire" : "Nouvelle annee scolaire"}</DialogTitle>
            <DialogDescription>
              {editAnnee ? "Modifiez les informations de l'annee scolaire." : "Definissez les dates de la nouvelle annee scolaire."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="anneeLabel">Libelle</Label>
              <Input id="anneeLabel" value={anneeForm.label} onChange={(e) => setAnneeForm({ ...anneeForm, label: e.target.value })} placeholder="Ex: 2025-2026" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="anneeDebut">Date debut</Label>
                <Input id="anneeDebut" type="date" value={anneeForm.dateDebut} onChange={(e) => setAnneeForm({ ...anneeForm, dateDebut: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="anneeFin">Date fin</Label>
                <Input id="anneeFin" type="date" value={anneeForm.dateFin} onChange={(e) => setAnneeForm({ ...anneeForm, dateFin: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button onClick={handleSaveAnnee} disabled={createAnneeMutation.isPending || updateAnneeMutation.isPending || !anneeForm.label}>
              {(createAnneeMutation.isPending || updateAnneeMutation.isPending) ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Trimestre Dialog */}
      <Dialog open={trimestreFormOpen} onOpenChange={setTrimestreFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un trimestre</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="trimestreNum">Numero</Label>
                <Input id="trimestreNum" type="number" min={1} max={4} value={trimestreForm.numero} onChange={(e) => setTrimestreForm({ ...trimestreForm, numero: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="trimestreLabel">Libelle</Label>
                <Input id="trimestreLabel" value={trimestreForm.label} onChange={(e) => setTrimestreForm({ ...trimestreForm, label: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="trimestreDebut">Date debut</Label>
                <Input id="trimestreDebut" type="date" value={trimestreForm.dateDebut} onChange={(e) => setTrimestreForm({ ...trimestreForm, dateDebut: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="trimestreFin">Date fin</Label>
                <Input id="trimestreFin" type="date" value={trimestreForm.dateFin} onChange={(e) => setTrimestreForm({ ...trimestreForm, dateFin: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="saisieNotes" checked={trimestreForm.saisieNotesOuverte} onChange={(e) => setTrimestreForm({ ...trimestreForm, saisieNotesOuverte: e.target.checked })} className="h-4 w-4 rounded border-border" />
              <Label htmlFor="saisieNotes">Saisie des notes ouverte</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button onClick={handleCreateTrimestre} disabled={createTrimestreMutation.isPending}>
              {createTrimestreMutation.isPending ? "Creation..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Vacance Dialog */}
      <Dialog open={vacanceFormOpen} onOpenChange={setVacanceFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter des vacances</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="vacanceLabel">Libelle</Label>
              <Input id="vacanceLabel" value={vacanceForm.label} onChange={(e) => setVacanceForm({ ...vacanceForm, label: e.target.value })} placeholder="Ex: Vacances d'hiver" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="vacanceDebut">Date debut</Label>
                <Input id="vacanceDebut" type="date" value={vacanceForm.dateDebut} onChange={(e) => setVacanceForm({ ...vacanceForm, dateDebut: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vacanceFin">Date fin</Label>
                <Input id="vacanceFin" type="date" value={vacanceForm.dateFin} onChange={(e) => setVacanceForm({ ...vacanceForm, dateFin: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button onClick={handleCreateVacance} disabled={createVacanceMutation.isPending}>
              {createVacanceMutation.isPending ? "Creation..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Jour Ferie Dialog */}
      <Dialog open={jourFerieFormOpen} onOpenChange={setJourFerieFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un jour ferie</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="jfLabel">Libelle</Label>
              <Input id="jfLabel" value={jourFerieForm.label} onChange={(e) => setJourFerieForm({ ...jourFerieForm, label: e.target.value })} placeholder="Ex: Fete de l'independance" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="jfDate">Date</Label>
              <Input id="jfDate" type="date" value={jourFerieForm.date} onChange={(e) => setJourFerieForm({ ...jourFerieForm, date: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button onClick={handleCreateJourFerie} disabled={createJourFerieMutation.isPending}>
              {createJourFerieMutation.isPending ? "Creation..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Trimestre Confirmation */}
      <Dialog open={deleteTrimestreId !== null} onOpenChange={(open) => !open && setDeleteTrimestreId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer le trimestre</DialogTitle>
            <DialogDescription>Etes-vous sur de vouloir supprimer ce trimestre ? Cette action est irreversible.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button variant="destructive" onClick={() => { if (deleteTrimestreId !== null) deleteTrimestreMutation.mutate(deleteTrimestreId, { onSuccess: () => setDeleteTrimestreId(null) }); }} disabled={deleteTrimestreMutation.isPending}>
              {deleteTrimestreMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Vacance Confirmation */}
      <Dialog open={deleteVacanceId !== null} onOpenChange={(open) => !open && setDeleteVacanceId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer les vacances</DialogTitle>
            <DialogDescription>Etes-vous sur de vouloir supprimer cette periode de vacances ?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button variant="destructive" onClick={() => { if (deleteVacanceId !== null) deleteVacanceMutation.mutate(deleteVacanceId, { onSuccess: () => setDeleteVacanceId(null) }); }} disabled={deleteVacanceMutation.isPending}>
              {deleteVacanceMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Jour Ferie Confirmation */}
      <Dialog open={deleteJourFerieId !== null} onOpenChange={(open) => !open && setDeleteJourFerieId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer le jour ferie</DialogTitle>
            <DialogDescription>Etes-vous sur de vouloir supprimer ce jour ferie ?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button variant="destructive" onClick={() => { if (deleteJourFerieId !== null) deleteJourFerieMutation.mutate(deleteJourFerieId, { onSuccess: () => setDeleteJourFerieId(null) }); }} disabled={deleteJourFerieMutation.isPending}>
              {deleteJourFerieMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
