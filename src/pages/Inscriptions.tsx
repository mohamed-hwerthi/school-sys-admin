import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Search,
  Filter,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  ListOrdered,
} from "lucide-react";
import { notify } from "@/lib/toast";
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
  useInscriptions,
  useInscriptionStats,
  useUpdateStatut,
} from "@/hooks/useInscriptions";
import type { Inscription, InscriptionStatut } from "@/types/inscription";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
};

const STATUT_OPTIONS: { value: InscriptionStatut; label: string }[] = [
  { value: "SOUMISE", label: "Soumise" },
  { value: "EN_REVISION", label: "En revision" },
  { value: "ACCEPTEE", label: "Acceptee" },
  { value: "REFUSEE", label: "Refusee" },
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "LISTE_ATTENTE", label: "Liste d'attente" },
];

function getStatutBadge(statut: InscriptionStatut) {
  switch (statut) {
    case "SOUMISE":
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-700">
          Soumise
        </Badge>
      );
    case "EN_REVISION":
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
          En revision
        </Badge>
      );
    case "ACCEPTEE":
      return (
        <Badge variant="outline" className="bg-emerald-100 text-emerald-700">
          Acceptee
        </Badge>
      );
    case "REFUSEE":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-700">
          Refusee
        </Badge>
      );
    case "EN_ATTENTE":
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-700">
          En attente
        </Badge>
      );
    case "LISTE_ATTENTE":
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-700">
          Liste d'attente
        </Badge>
      );
    default:
      return <Badge variant="outline">{statut}</Badge>;
  }
}

export default function InscriptionsPage() {
  const [filterStatut, setFilterStatut] = useState<string>("all");
  const [filterAnnee, setFilterAnnee] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedInscription, setSelectedInscription] =
    useState<Inscription | null>(null);
  const [changeStatutOpen, setChangeStatutOpen] = useState(false);
  const [newStatut, setNewStatut] = useState<string>("");
  const [commentaire, setCommentaire] = useState("");

  const queryParams = {
    statut: filterStatut !== "all" ? filterStatut : undefined,
    anneeScolaire: filterAnnee || undefined,
    page: currentPage,
    size: 20,
  };

  const { data: pagedData, isLoading } = useInscriptions(queryParams);
  const { data: stats } = useInscriptionStats(filterAnnee || undefined);
  const updateStatutMutation = useUpdateStatut();

  const inscriptions = pagedData?.content ?? [];
  const totalPages = pagedData?.totalPages ?? 1;
  const totalElements = pagedData?.totalElements ?? 0;

  const hasFilters = filterStatut !== "all" || !!filterAnnee;

  const resetFilters = () => {
    setFilterStatut("all");
    setFilterAnnee("");
    setCurrentPage(0);
  };

  const openDetail = (inscription: Inscription) => {
    setSelectedInscription(inscription);
  };

  const openChangeStatut = (inscription: Inscription) => {
    setSelectedInscription(inscription);
    setNewStatut(inscription.statut);
    setCommentaire(inscription.commentaire ?? "");
    setChangeStatutOpen(true);
  };

  const handleChangeStatut = () => {
    if (!selectedInscription || !newStatut) return;
    updateStatutMutation.mutate(
      {
        id: selectedInscription.id,
        data: {
          statut: newStatut as InscriptionStatut,
          commentaire: commentaire || undefined,
        },
      },
      {
        onSuccess: () => {
          notify.success("Statut mis a jour avec succes");
          setChangeStatutOpen(false);
          setSelectedInscription(null);
        },
        onError: (error) => {
          notify.error(
            error instanceof Error ? error.message : "Erreur lors de la mise a jour"
          );
        },
      }
    );
  };

  const statCards = [
    {
      label: "Soumises",
      value: stats?.totalSoumises ?? 0,
      icon: FileText,
      color: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      label: "Acceptees",
      value: stats?.totalAcceptees ?? 0,
      icon: CheckCircle,
      color: "bg-emerald-50",
      textColor: "text-emerald-700",
    },
    {
      label: "Refusees",
      value: stats?.totalRefusees ?? 0,
      icon: XCircle,
      color: "bg-red-50",
      textColor: "text-red-700",
    },
    {
      label: "En attente",
      value: stats?.totalEnAttente ?? 0,
      icon: Clock,
      color: "bg-orange-50",
      textColor: "text-orange-700",
    },
    {
      label: "Liste d'attente",
      value: stats?.totalListeAttente ?? 0,
      icon: ListOrdered,
      color: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      label: "Taux de conversion",
      value: `${stats?.tauxConversion ?? 0}%`,
      icon: TrendingUp,
      color: "bg-teal-50",
      textColor: "text-teal-700",
    },
  ];

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
            Inscriptions en Ligne
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerez les demandes d'inscription des nouveaux eleves
          </p>
        </div>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((stat, i) => (
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
        custom={6}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="rounded-xl border border-border/50 bg-card p-4 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <Select
              value={filterStatut}
              onValueChange={(v) => {
                setFilterStatut(v);
                setCurrentPage(0);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {STATUT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="Annee scolaire (ex: 2025-2026)"
              value={filterAnnee}
              onChange={(e) => {
                setFilterAnnee(e.target.value);
                setCurrentPage(0);
              }}
              className="w-[220px]"
            />
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="gap-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
                Reinitialiser
              </Button>
            )}
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {totalElements} inscription{totalElements !== 1 ? "s" : ""} trouvee
          {totalElements !== 1 ? "s" : ""}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        custom={7}
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
                  N. Dossier
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground">
                  Nom complet
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">
                  Niveau
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                  Date soumission
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
              {inscriptions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-muted-foreground"
                  >
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Aucune inscription trouvee</p>
                    <p className="text-xs mt-1">
                      Aucune inscription ne correspond aux filtres selectionnes
                    </p>
                  </td>
                </tr>
              ) : (
                inscriptions.map((inscription) => (
                  <tr
                    key={inscription.id}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => openDetail(inscription)}
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs text-muted-foreground">
                        {inscription.numeroDossier}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground">
                        {inscription.prenom} {inscription.nom}
                      </p>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">
                      {inscription.niveauNom ?? "-"}
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground">
                      {inscription.createdAt
                        ? new Date(inscription.createdAt).toLocaleDateString(
                            "fr-FR"
                          )
                        : "-"}
                    </td>
                    <td className="py-3 px-4">
                      {getStatutBadge(inscription.statut)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(inscription);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            openChangeStatut(inscription);
                          }}
                        >
                          Changer statut
                        </Button>
                      </div>
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

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedInscription && !changeStatutOpen}
        onOpenChange={(open) => !open && setSelectedInscription(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail de l'inscription</DialogTitle>
            <DialogDescription>
              Dossier:{" "}
              <span className="font-mono font-semibold text-foreground">
                {selectedInscription?.numeroDossier}
              </span>
            </DialogDescription>
          </DialogHeader>

          {selectedInscription && (
            <div className="space-y-6 py-2">
              {/* Status */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Statut actuel
                  </span>
                  <div className="mt-1">
                    {getStatutBadge(selectedInscription.statut)}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openChangeStatut(selectedInscription)}
                >
                  Changer le statut
                </Button>
              </div>

              {/* Informations eleve */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Informations de l'eleve
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground">Nom</span>
                    <p className="font-medium">{selectedInscription.nom}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Prenom
                    </span>
                    <p className="font-medium">{selectedInscription.prenom}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Date de naissance
                    </span>
                    <p className="font-medium">
                      {selectedInscription.dateNaissance
                        ? new Date(
                            selectedInscription.dateNaissance
                          ).toLocaleDateString("fr-FR")
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Lieu de naissance
                    </span>
                    <p className="font-medium">
                      {selectedInscription.lieuNaissance ?? "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Sexe</span>
                    <p className="font-medium">
                      {selectedInscription.sexe === "M"
                        ? "Masculin"
                        : selectedInscription.sexe === "F"
                          ? "Feminin"
                          : "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Adresse
                    </span>
                    <p className="font-medium">
                      {selectedInscription.adresse ?? "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informations parent */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Informations du parent
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Nom du parent
                    </span>
                    <p className="font-medium">
                      {selectedInscription.prenomParent ?? ""}{" "}
                      {selectedInscription.nomParent ?? "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Telephone
                    </span>
                    <p className="font-medium">
                      {selectedInscription.telephoneParent ?? "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Email</span>
                    <p className="font-medium">
                      {selectedInscription.emailParent ?? "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informations scolaires */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Informations scolaires
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Niveau demande
                    </span>
                    <p className="font-medium">
                      {selectedInscription.niveauNom ?? "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Annee scolaire
                    </span>
                    <p className="font-medium">
                      {selectedInscription.anneeScolaire}
                    </p>
                  </div>
                </div>
              </div>

              {/* Commentaire */}
              {selectedInscription.commentaire && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    Commentaire
                  </h3>
                  <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                    {selectedInscription.commentaire}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Fermer</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog
        open={changeStatutOpen}
        onOpenChange={(open) => {
          if (!open) {
            setChangeStatutOpen(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Changer le statut</DialogTitle>
            <DialogDescription>
              Inscription de{" "}
              <span className="font-semibold text-foreground">
                {selectedInscription?.prenom} {selectedInscription?.nom}
              </span>{" "}
              — Dossier{" "}
              <span className="font-mono">
                {selectedInscription?.numeroDossier}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="statut">Nouveau statut</Label>
              <Select value={newStatut} onValueChange={setNewStatut}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {STATUT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="commentaire">Commentaire</Label>
              <Textarea
                id="commentaire"
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Ajouter un commentaire (optionnel)..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button
              onClick={handleChangeStatut}
              disabled={
                updateStatutMutation.isPending ||
                !newStatut ||
                newStatut === selectedInscription?.statut
              }
            >
              {updateStatutMutation.isPending
                ? "Mise a jour..."
                : "Mettre a jour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
