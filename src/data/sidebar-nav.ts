import {
  Home,
  Users,
  UserCog,
  Calendar,
  ClipboardCheck,
  CalendarDays,
  FileText,
  Newspaper,
  BookOpen,
  Settings,
  DollarSign,
  TrendingDown,
  Wallet,
  Eye,
  PieChart,
  School,
  BadgePercent,
  Bell,
  BarChart3,
  Vault,
  UserCheck,
  Clock,
  AlertTriangle,
  GraduationCap,
  Receipt,
  FileSpreadsheet,
  Briefcase,
  CalendarClock,
  ShieldCheck,
  Palette,
  Printer,
  TrendingUp,
  Activity,
} from "lucide-react";

export type NavItem = {
  title: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  url: string;
  roles?: string[]; // roles that can see this item. undefined = all roles
};

export type NavSection = {
  label: string;
  collapsible: boolean;
  items: NavItem[];
};

export const sidebarSections: NavSection[] = [
  {
    label: "Principal",
    collapsible: true,
    items: [
      { title: "Général", icon: Home, iconBg: "bg-blue-100", iconColor: "text-blue-600", url: "/dashboard" },
      { title: "École", icon: School, iconBg: "bg-amber-100", iconColor: "text-amber-600", url: "/dashboard/ecole", roles: ["SUPER_ADMIN", "ADMIN", "DIRECTEUR"] },
      { title: "Élèves", icon: Users, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", url: "/dashboard/eleves", roles: ["SUPER_ADMIN", "ADMIN", "DIRECTEUR", "ENSEIGNANT", "COMPTABLE"] },
      { title: "Enseignants", icon: UserCog, iconBg: "bg-orange-100", iconColor: "text-orange-600", url: "/dashboard/enseignants", roles: ["SUPER_ADMIN", "ADMIN", "DIRECTEUR"] },
      { title: "Absences", icon: UserCheck, iconBg: "bg-red-100", iconColor: "text-red-500", url: "/dashboard/absences", roles: ["SUPER_ADMIN", "ADMIN", "DIRECTEUR", "ENSEIGNANT"] },
    ],
  },
  {
    label: "Planification",
    collapsible: true,
    items: [
      { title: "Emploi du temps", icon: Clock, iconBg: "bg-purple-100", iconColor: "text-purple-600", url: "/dashboard/emploi-du-temps" },
      { title: "Emploi - Salles", icon: Calendar, iconBg: "bg-purple-100", iconColor: "text-purple-600", url: "/dashboard/emploi-salles", roles: ["SUPER_ADMIN", "ADMIN", "DIRECTEUR"] },
      { title: "Évaluations", icon: ClipboardCheck, iconBg: "bg-rose-100", iconColor: "text-rose-600", url: "/dashboard/evaluations", roles: ["SUPER_ADMIN", "ADMIN", "DIRECTEUR", "ENSEIGNANT"] },
      { title: "Année scolaire", icon: CalendarClock, iconBg: "bg-sky-100", iconColor: "text-sky-600", url: "/dashboard/annee-scolaire", roles: ["SUPER_ADMIN", "ADMIN", "DIRECTEUR"] },
    ],
  },
  {
    label: "Documents",
    collapsible: true,
    items: [
      { title: "Rapports", icon: FileText, iconBg: "bg-indigo-100", iconColor: "text-indigo-600", url: "/dashboard/rapports", roles: ["SUPER_ADMIN", "ADMIN", "DIRECTEUR"] },
      { title: "Circulaires", icon: Newspaper, iconBg: "bg-lime-100", iconColor: "text-lime-600", url: "/dashboard/circulaires" },
      { title: "Carnets", icon: BookOpen, iconBg: "bg-slate-100", iconColor: "text-slate-600", url: "/dashboard/carnets", roles: ["SUPER_ADMIN", "ADMIN", "DIRECTEUR", "ENSEIGNANT", "PARENT"] },
      { title: "Templates Bulletin", icon: Palette, iconBg: "bg-indigo-100", iconColor: "text-indigo-600", url: "/dashboard/bulletin-templates", roles: ["SUPER_ADMIN", "ADMIN", "DIRECTEUR"] },
      { title: "Bulletins en masse", icon: Printer, iconBg: "bg-sky-100", iconColor: "text-sky-600", url: "/dashboard/bulletins-masse", roles: ["SUPER_ADMIN", "ADMIN", "DIRECTEUR"] },
      { title: "Stats Reussite", icon: TrendingUp, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", url: "/dashboard/stats-reussite", roles: ["SUPER_ADMIN", "ADMIN", "DIRECTEUR"] },
      { title: "Comparatif", icon: Activity, iconBg: "bg-fuchsia-100", iconColor: "text-fuchsia-600", url: "/dashboard/comparatif", roles: ["SUPER_ADMIN", "ADMIN", "DIRECTEUR"] },
      { title: "Factures", icon: Receipt, iconBg: "bg-teal-100", iconColor: "text-teal-600", url: "/dashboard/factures", roles: ["SUPER_ADMIN", "ADMIN", "COMPTABLE"] },
    ],
  },
  {
    label: "Vie Scolaire",
    collapsible: true,
    items: [
      { title: "Discipline", icon: AlertTriangle, iconBg: "bg-yellow-100", iconColor: "text-yellow-600", url: "/dashboard/discipline", roles: ["SUPER_ADMIN", "ADMIN", "DIRECTEUR", "ENSEIGNANT"] },
      { title: "Contrats & Congés", icon: Briefcase, iconBg: "bg-cyan-100", iconColor: "text-cyan-600", url: "/dashboard/contrats", roles: ["SUPER_ADMIN", "ADMIN", "DIRECTEUR"] },
    ],
  },
  {
    label: "Administration",
    collapsible: true,
    items: [
      { title: "Utilisateurs", icon: ShieldCheck, iconBg: "bg-violet-100", iconColor: "text-violet-600", url: "/dashboard/utilisateurs", roles: ["SUPER_ADMIN", "ADMIN"] },
      { title: "Configuration", icon: Settings, iconBg: "bg-amber-100", iconColor: "text-amber-600", url: "/dashboard/configuration", roles: ["SUPER_ADMIN", "ADMIN"] },
      { title: "Niveaux & Classes", icon: GraduationCap, iconBg: "bg-pink-100", iconColor: "text-pink-600", url: "/dashboard/config/niveaux", roles: ["SUPER_ADMIN", "ADMIN", "DIRECTEUR"] },
      { title: "Finance", icon: DollarSign, iconBg: "bg-teal-100", iconColor: "text-teal-600", url: "/dashboard/finance", roles: ["SUPER_ADMIN", "ADMIN", "COMPTABLE"] },
      { title: "Dépenses", icon: TrendingDown, iconBg: "bg-red-100", iconColor: "text-red-600", url: "/dashboard/finance/depenses", roles: ["SUPER_ADMIN", "ADMIN", "COMPTABLE"] },
      { title: "Trésorerie", icon: Wallet, iconBg: "bg-indigo-100", iconColor: "text-indigo-600", url: "/dashboard/finance/tresorerie", roles: ["SUPER_ADMIN", "ADMIN", "COMPTABLE"] },
      { title: "Remises & Pénalités", icon: BadgePercent, iconBg: "bg-orange-100", iconColor: "text-orange-600", url: "/dashboard/finance/remises-penalites", roles: ["SUPER_ADMIN", "ADMIN", "COMPTABLE"] },
      { title: "Relances", icon: Bell, iconBg: "bg-cyan-100", iconColor: "text-cyan-600", url: "/dashboard/finance/relances", roles: ["SUPER_ADMIN", "ADMIN", "COMPTABLE"] },
      { title: "Rapports Financiers", icon: BarChart3, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", url: "/dashboard/finance/rapports", roles: ["SUPER_ADMIN", "ADMIN", "COMPTABLE", "DIRECTEUR"] },
      { title: "Caisse", icon: Vault, iconBg: "bg-pink-100", iconColor: "text-pink-600", url: "/dashboard/finance/caisse", roles: ["SUPER_ADMIN", "ADMIN", "COMPTABLE"] },
      { title: "Traçabilité", icon: Eye, iconBg: "bg-violet-100", iconColor: "text-violet-600", url: "/dashboard/tracabilite", roles: ["SUPER_ADMIN", "ADMIN"] },
      { title: "Statistique", icon: PieChart, iconBg: "bg-fuchsia-100", iconColor: "text-fuchsia-600", url: "/dashboard/statistique", roles: ["SUPER_ADMIN", "ADMIN", "DIRECTEUR"] },
    ],
  },
];
