import { useState, useMemo } from "react";
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Calendar,
  Users,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAnnonces,
  useCreateAnnonce,
  useUpdateAnnonce,
  useDeleteAnnonce,
} from "@/hooks/useAnnonces";
import type { Annonce, AnnonceType, DestinatairesType } from "@/types/notification";
import { notify } from "@/lib/toast";

const TYPE_LABELS: Record<AnnonceType, string> = {
  GENERAL: "General",
  URGENT: "Urgent",
  EVENEMENT: "Evenement",
  REUNION: "Reunion",
};

const TYPE_COLORS: Record<AnnonceType, string> = {
  GENERAL: "bg-blue-100 text-blue-700",
  URGENT: "bg-red-100 text-red-700 border-red-300",
  EVENEMENT: "bg-purple-100 text-purple-700",
  REUNION: "bg-emerald-100 text-emerald-700",
};

const DEST_LABELS: Record<DestinatairesType, string> = {
  TOUS: "Tous",
  PARENTS: "Parents",
  ENSEIGNANTS: "Enseignants",
  ELEVES: "Eleves",
  CLASSE: "Classe",
};

interface FormState {
  titre: string;
  contenu: string;
  type: AnnonceType;
  destinataires: DestinatairesType;
  classeId?: string;
  dateExpiration?: string;
}

const initialForm: FormState = {
  titre: "",
  contenu: "",
  type: "GENERAL",
  destinataires: "TOUS",
  classeId: "",
  dateExpiration: "",
};

export default function AnnoncesPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const { data: annonces = [], isLoading } = useAnnonces();
  const createAnnonce = useCreateAnnonce();
  const updateAnnonce = useUpdateAnnonce();
  const deleteAnnonce = useDeleteAnnonce();

  const filtered = useMemo(() => {
    if (typeFilter === "ALL") return annonces;
    return annonces.filter((a) => a.type === typeFilter);
  }, [annonces, typeFilter]);

  const handleOpenCreate = () => {
    setForm(initialForm);
    setEditId(null);
    setShowDialog(true);
  };

  const handleOpenEdit = (annonce: Annonce) => {
    setForm({
      titre: annonce.titre,
      contenu: annonce.contenu,
      type: annonce.type,
      destinataires: annonce.destinataires,
      classeId: annonce.classeId?.toString() || "",
      dateExpiration: annonce.dateExpiration
        ? new Date(annonce.dateExpiration).toISOString().slice(0, 16)
        : "",
    });
    setEditId(annonce.id);
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (!form.titre.trim() || !form.contenu.trim()) {
      notify.error("Le titre et le contenu sont requis");
      return;
    }

    const payload: Record<string, unknown> = {
      titre: form.titre,
      contenu: form.contenu,
      type: form.type,
      destinataires: form.destinataires,
    };
    if (form.classeId) payload.classeId = Number(form.classeId);
    if (form.dateExpiration) payload.dateExpiration = form.dateExpiration;

    if (editId) {
      updateAnnonce.mutate(
        { id: editId, data: payload as Partial<Annonce> },
        {
          onSuccess: () => {
            notify.success("Annonce mise a jour");
            setShowDialog(false);
          },
          onError: () => notify.error("Erreur lors de la mise a jour"),
        }
      );
    } else {
      createAnnonce.mutate(payload as Omit<Annonce, "id" | "createdAt" | "actif">, {
        onSuccess: () => {
          notify.success("Annonce creee");
          setShowDialog(false);
        },
        onError: () => notify.error("Erreur lors de la creation"),
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteAnnonce.mutate(id, {
      onSuccess: () => notify.success("Annonce supprimee"),
      onError: () => notify.error("Erreur lors de la suppression"),
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Annonces</h1>
          <p className="text-muted-foreground">
            Gerez les annonces et communications de l'ecole
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les types</SelectItem>
              {(Object.keys(TYPE_LABELS) as AnnonceType[]).map((type) => (
                <SelectItem key={type} value={type}>
                  {TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle annonce
          </Button>
        </div>
      </div>

      {/* Annonces grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Megaphone className="mb-4 h-12 w-12" />
          <p className="text-lg font-medium">Aucune annonce</p>
          <p className="text-sm">Creez votre premiere annonce pour commencer.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((annonce) => (
            <Card
              key={annonce.id}
              className={`relative ${
                annonce.type === "URGENT" ? "border-red-300 border-2" : ""
              }`}
            >
              {annonce.type === "URGENT" && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-red-500 text-white animate-pulse">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    URGENT
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{annonce.titre}</CardTitle>
                    <CardDescription className="text-xs">
                      {annonce.auteurName && `Par ${annonce.auteurName} - `}
                      {new Date(annonce.datePublication).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {annonce.contenu}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline" className={TYPE_COLORS[annonce.type]}>
                    {TYPE_LABELS[annonce.type]}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Users className="mr-1 h-3 w-3" />
                    {DEST_LABELS[annonce.destinataires]}
                  </Badge>
                  {annonce.dateExpiration && (
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="mr-1 h-3 w-3" />
                      Expire:{" "}
                      {new Date(annonce.dateExpiration).toLocaleDateString("fr-FR")}
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEdit(annonce)}
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Modifier
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(annonce.id)}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Supprimer
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Modifier l'annonce" : "Nouvelle annonce"}
            </DialogTitle>
            <DialogDescription>
              {editId
                ? "Modifiez les informations de l'annonce."
                : "Remplissez les informations pour creer une nouvelle annonce."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="titre">Titre</Label>
              <Input
                id="titre"
                value={form.titre}
                onChange={(e) => setForm({ ...form, titre: e.target.value })}
                placeholder="Titre de l'annonce"
              />
            </div>
            <div>
              <Label htmlFor="contenu">Contenu</Label>
              <Textarea
                id="contenu"
                value={form.contenu}
                onChange={(e) => setForm({ ...form, contenu: e.target.value })}
                placeholder="Contenu de l'annonce..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as AnnonceType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TYPE_LABELS) as AnnonceType[]).map((type) => (
                      <SelectItem key={type} value={type}>
                        {TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Destinataires</Label>
                <Select
                  value={form.destinataires}
                  onValueChange={(v) =>
                    setForm({ ...form, destinataires: v as DestinatairesType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(DEST_LABELS) as DestinatairesType[]).map((dest) => (
                      <SelectItem key={dest} value={dest}>
                        {DEST_LABELS[dest]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.destinataires === "CLASSE" && (
              <div>
                <Label htmlFor="classeId">ID de la classe</Label>
                <Input
                  id="classeId"
                  type="number"
                  value={form.classeId}
                  onChange={(e) => setForm({ ...form, classeId: e.target.value })}
                  placeholder="ID de la classe"
                />
              </div>
            )}
            <div>
              <Label htmlFor="dateExpiration">Date d'expiration (optionnel)</Label>
              <Input
                id="dateExpiration"
                type="datetime-local"
                value={form.dateExpiration}
                onChange={(e) => setForm({ ...form, dateExpiration: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                <X className="mr-2 h-4 w-4" />
                Annuler
              </Button>
            </DialogClose>
            <Button
              onClick={handleSubmit}
              disabled={createAnnonce.isPending || updateAnnonce.isPending}
            >
              {(createAnnonce.isPending || updateAnnonce.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editId ? "Mettre a jour" : "Creer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
