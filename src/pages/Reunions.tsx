import { useState, useMemo } from "react";
import {
  CalendarDays,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Clock,
  User,
  Users,
  List,
  LayoutGrid,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
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
  useMeetings,
  useCreateMeeting,
  useUpdateMeeting,
  useDeleteMeeting,
} from "@/hooks/useMeetings";
import type { MeetingRequest, MeetingResponse } from "@/api/meetings.api";
import { notify } from "@/lib/toast";

const STATUT_CONFIG: Record<string, { label: string; color: string }> = {
  PLANIFIE: { label: "Planifie", color: "bg-blue-100 text-blue-700" },
  CONFIRME: { label: "Confirme", color: "bg-emerald-100 text-emerald-700" },
  ANNULE: { label: "Annule", color: "bg-red-100 text-red-700" },
};

interface FormState {
  title: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  enseignantId: string;
  parentId: string;
  studentId: string;
  statut: string;
  notes: string;
}

const initialForm: FormState = {
  title: "",
  date: "",
  heureDebut: "",
  heureFin: "",
  enseignantId: "",
  parentId: "",
  studentId: "",
  statut: "PLANIFIE",
  notes: "",
};

export default function ReunionsPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [statutFilter, setStatutFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const { data: meetings = [], isLoading } = useMeetings();
  const createMeeting = useCreateMeeting();
  const updateMeeting = useUpdateMeeting();
  const deleteMeeting = useDeleteMeeting();

  const filtered = useMemo(() => {
    if (statutFilter === "ALL") return meetings;
    return meetings.filter((m) => m.statut === statutFilter);
  }, [meetings, statutFilter]);

  // Group meetings by date for calendar view
  const groupedByDate = useMemo(() => {
    const groups: Record<string, MeetingResponse[]> = {};
    for (const m of filtered) {
      const key = m.date;
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const handleOpenCreate = () => {
    setForm(initialForm);
    setEditId(null);
    setShowDialog(true);
  };

  const handleOpenEdit = (meeting: MeetingResponse) => {
    setForm({
      title: meeting.title,
      date: meeting.date,
      heureDebut: meeting.heureDebut,
      heureFin: meeting.heureFin,
      enseignantId: meeting.enseignantId?.toString() || "",
      parentId: meeting.parentId?.toString() || "",
      studentId: meeting.studentId?.toString() || "",
      statut: meeting.statut,
      notes: meeting.notes || "",
    });
    setEditId(meeting.id);
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.date || !form.heureDebut || !form.heureFin) {
      notify.error("Le titre, la date et les horaires sont requis");
      return;
    }

    const payload: MeetingRequest = {
      title: form.title,
      date: form.date,
      heureDebut: form.heureDebut,
      heureFin: form.heureFin,
      statut: form.statut,
      notes: form.notes || undefined,
    };
    if (form.enseignantId) payload.enseignantId = Number(form.enseignantId);
    if (form.parentId) payload.parentId = Number(form.parentId);
    if (form.studentId) payload.studentId = Number(form.studentId);

    if (editId) {
      updateMeeting.mutate(
        { id: editId, data: payload },
        {
          onSuccess: () => {
            notify.success("Reunion mise a jour");
            setShowDialog(false);
          },
          onError: () => notify.error("Erreur lors de la mise a jour"),
        }
      );
    } else {
      createMeeting.mutate(payload, {
        onSuccess: () => {
          notify.success("Reunion creee");
          setShowDialog(false);
        },
        onError: () => notify.error("Erreur lors de la creation"),
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteMeeting.mutate(id, {
      onSuccess: () => notify.success("Reunion supprimee"),
      onError: () => notify.error("Erreur lors de la suppression"),
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
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
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            Reunions
          </h1>
          <p className="text-muted-foreground">
            Planifiez et gerez les reunions parents-enseignants
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="rounded-l-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Select value={statutFilter} onValueChange={setStatutFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les statuts</SelectItem>
              <SelectItem value="PLANIFIE">Planifie</SelectItem>
              <SelectItem value="CONFIRME">Confirme</SelectItem>
              <SelectItem value="ANNULE">Annule</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle reunion
          </Button>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <CalendarDays className="mb-4 h-12 w-12" />
          <p className="text-lg font-medium">Aucune reunion</p>
          <p className="text-sm">Planifiez votre premiere reunion pour commencer.</p>
        </div>
      ) : viewMode === "calendar" ? (
        /* Calendar-style grouped view */
        <div className="space-y-6">
          {groupedByDate.map(([date, dateMeetings]) => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {formatDate(date)}
              </h2>
              <div className="space-y-2">
                {dateMeetings.map((meeting) => {
                  const config = STATUT_CONFIG[meeting.statut] || STATUT_CONFIG.PLANIFIE;
                  return (
                    <div
                      key={meeting.id}
                      className="flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col items-center justify-center rounded-lg bg-primary/5 px-3 py-2 min-w-[80px]">
                        <span className="text-xs text-muted-foreground">
                          {meeting.heureDebut?.slice(0, 5)}
                        </span>
                        <span className="text-xs text-muted-foreground">-</span>
                        <span className="text-xs text-muted-foreground">
                          {meeting.heureFin?.slice(0, 5)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{meeting.title}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                          {meeting.enseignantName && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {meeting.enseignantName}
                            </span>
                          )}
                          {meeting.parentName && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {meeting.parentName}
                            </span>
                          )}
                          {meeting.studentName && (
                            <span className="flex items-center gap-1">
                              Eleve: {meeting.studentName}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge className={config.color}>{config.label}</Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(meeting)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(meeting.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List view */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((meeting) => {
            const config = STATUT_CONFIG[meeting.statut] || STATUT_CONFIG.PLANIFIE;
            return (
              <Card key={meeting.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{meeting.title}</CardTitle>
                    <Badge className={config.color}>{config.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    {formatDate(meeting.date)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {meeting.heureDebut?.slice(0, 5)} - {meeting.heureFin?.slice(0, 5)}
                  </div>
                  {meeting.enseignantName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      Enseignant: {meeting.enseignantName}
                    </div>
                  )}
                  {meeting.parentName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Parent: {meeting.parentName}
                    </div>
                  )}
                  {meeting.studentName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      Eleve: {meeting.studentName}
                    </div>
                  )}
                  {meeting.notes && (
                    <p className="text-xs text-muted-foreground border-t pt-2 line-clamp-2">
                      {meeting.notes}
                    </p>
                  )}
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(meeting)}
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Modifier
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(meeting.id)}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Modifier la reunion" : "Nouvelle reunion"}
            </DialogTitle>
            <DialogDescription>
              {editId
                ? "Modifiez les informations de la reunion."
                : "Planifiez une nouvelle reunion parent-enseignant."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Objet de la reunion"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="heureDebut">Debut</Label>
                <Input
                  id="heureDebut"
                  type="time"
                  value={form.heureDebut}
                  onChange={(e) => setForm({ ...form, heureDebut: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="heureFin">Fin</Label>
                <Input
                  id="heureFin"
                  type="time"
                  value={form.heureFin}
                  onChange={(e) => setForm({ ...form, heureFin: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="enseignantId">ID Enseignant</Label>
                <Input
                  id="enseignantId"
                  type="number"
                  value={form.enseignantId}
                  onChange={(e) => setForm({ ...form, enseignantId: e.target.value })}
                  placeholder="ID de l'enseignant"
                />
              </div>
              <div>
                <Label htmlFor="parentId">ID Parent</Label>
                <Input
                  id="parentId"
                  type="number"
                  value={form.parentId}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  placeholder="ID du parent"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentId">ID Eleve</Label>
                <Input
                  id="studentId"
                  type="number"
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  placeholder="ID de l'eleve"
                />
              </div>
              <div>
                <Label>Statut</Label>
                <Select
                  value={form.statut}
                  onValueChange={(v) => setForm({ ...form, statut: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANIFIE">Planifie</SelectItem>
                    <SelectItem value="CONFIRME">Confirme</SelectItem>
                    <SelectItem value="ANNULE">Annule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Notes sur la reunion..."
                rows={3}
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
              disabled={createMeeting.isPending || updateMeeting.isPending}
            >
              {(createMeeting.isPending || updateMeeting.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editId ? "Mettre a jour" : "Planifier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
