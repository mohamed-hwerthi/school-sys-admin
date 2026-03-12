import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/config/queryClient";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import PrivateRoute from "./components/PrivateRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Forbidden from "./pages/Forbidden";
import DashboardLayout from "./components/layout/DashboardLayout";
import { TeachersProvider } from "./hooks/useTeachers";
import { RoomsProvider } from "./hooks/useRooms";
import { MessagesProvider } from "./hooks/useMessages";
import { SchoolProvider } from "./hooks/useSchool";
import { Loader2 } from "lucide-react";

// Lazy loaded pages for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Students = lazy(() => import("./pages/Students"));
const AddStudent = lazy(() => import("./pages/AddStudent"));
const EditStudent = lazy(() => import("./pages/EditStudent"));
const StudentProfile = lazy(() => import("./pages/StudentProfile"));
const StudentMessages = lazy(() => import("./pages/StudentMessages"));
const Teachers = lazy(() => import("./pages/Teachers"));
const AddTeacher = lazy(() => import("./pages/AddTeacher"));
const EditTeacher = lazy(() => import("./pages/EditTeacher"));
const EmploiSalles = lazy(() => import("./pages/EmploiSalles"));
const AddRoom = lazy(() => import("./pages/AddRoom"));
const EditRoom = lazy(() => import("./pages/EditRoom"));
const Niveaux = lazy(() => import("./pages/Niveaux"));
const SchoolInfo = lazy(() => import("./pages/SchoolInfo"));
const FinancePaiement = lazy(() => import("./pages/FinancePaiement"));
const Evaluations = lazy(() => import("./pages/Evaluations"));
const CarnetNotes = lazy(() => import("./pages/CarnetNotes"));
const Rapports = lazy(() => import("./pages/Rapports"));
const Circulaires = lazy(() => import("./pages/Circulaires"));
const Configuration = lazy(() => import("./pages/Configuration"));
const Tracabilite = lazy(() => import("./pages/Tracabilite"));
const Statistiques = lazy(() => import("./pages/Statistiques"));
const Depenses = lazy(() => import("./pages/Depenses"));
const Tresorerie = lazy(() => import("./pages/Tresorerie"));
const RemisesPenalites = lazy(() => import("./pages/RemisesPenalites"));
const Relances = lazy(() => import("./pages/Relances"));
const RapportsFinanciers = lazy(() => import("./pages/RapportsFinanciers"));
const GestionCaisse = lazy(() => import("./pages/GestionCaisse"));

// Auth pages
const UsersPage = lazy(() => import("./pages/Users"));
const AbsencesPage = lazy(() => import("./pages/Absences"));
const EmploiDuTempsPage = lazy(() => import("./pages/EmploiDuTemps"));
const DisciplinePage = lazy(() => import("./pages/Discipline"));
const AnneeScolairePage = lazy(() => import("./pages/AnneeScolaire"));
const ContratsPage = lazy(() => import("./pages/Contrats"));
const FacturesPage = lazy(() => import("./pages/Factures"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VitrineSite = lazy(() => import("./pages/VitrineSite"));
const VitrineAdminPage = lazy(() => import("./pages/VitrineAdmin"));

// Bulletin pages
const BulletinTemplatesPage = lazy(() => import("./pages/BulletinTemplates"));
const BulletinsMassePage = lazy(() => import("./pages/BulletinsMasse"));
const StatsReussitePage = lazy(() => import("./pages/StatsReussite"));
const ComparatifPerformancesPage = lazy(() => import("./pages/ComparatifPerformances"));

// Communication & Parent Portal
const NotificationsPage = lazy(() => import("./pages/Notifications"));
const AnnoncesPage = lazy(() => import("./pages/Annonces"));
const ParentPortalPage = lazy(() => import("./pages/ParentPortal"));

// Board 13: Inscriptions
const InscriptionsPage = lazy(() => import("./pages/Inscriptions"));
const InscriptionPubliquePage = lazy(() => import("./pages/InscriptionPublique"));

// Board 14: Bibliothèque
const BibliothequePage = lazy(() => import("./pages/Bibliotheque"));

// Board 15: Transport
const TransportPage = lazy(() => import("./pages/Transport"));

// Board 16: Cantine
const CantinePage = lazy(() => import("./pages/Cantine"));

// Board 17: Devoirs & Ressources
const DevoirsPage = lazy(() => import("./pages/Devoirs"));

// Board 18: Examens en ligne
const QuizManagementPage = lazy(() => import("./pages/QuizManagement"));
const QuizPassationPage = lazy(() => import("./pages/QuizPassation"));

// Board 19: RH
const PointagePage = lazy(() => import("./pages/Pointage"));
const PaiePage = lazy(() => import("./pages/Paie"));
const FormationsPage = lazy(() => import("./pages/Formations"));
const TeacherEvaluationsPage = lazy(() => import("./pages/TeacherEvaluations"));

// Board 20: Documents
const GenerationDocumentsPage = lazy(() => import("./pages/GenerationDocuments"));

// Board 21: Intégrations
const IntegrationsPage = lazy(() => import("./pages/Integrations"));

// Board 22: Analytics
const AnalyticsDashboardPage = lazy(() => import("./pages/AnalyticsDashboard"));
const SuiviElevePage = lazy(() => import("./pages/SuiviEleve"));

// Board 24: SaaS
const OnboardingPage = lazy(() => import("./pages/Onboarding"));
const SuperAdminDashboardPage = lazy(() => import("./pages/SuperAdminDashboard"));

const PageLoader = () => (
  <div className="flex h-[50vh] items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/forgot-password" element={<Suspense fallback={<PageLoader />}><ForgotPassword /></Suspense>} />
            <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPassword /></Suspense>} />
            <Route path="/forbidden" element={<Forbidden />} />
            {/* Public pages */}
            <Route path="/vitrine/:slug" element={<Suspense fallback={<PageLoader />}><VitrineSite /></Suspense>} />
            <Route path="/vitrine/:slug/:pageSlug" element={<Suspense fallback={<PageLoader />}><VitrineSite /></Suspense>} />
            <Route path="/inscription" element={<Suspense fallback={<PageLoader />}><InscriptionPubliquePage /></Suspense>} />
            <Route path="/onboarding" element={<Suspense fallback={<PageLoader />}><OnboardingPage /></Suspense>} />
            {/* Quiz passation (student exam taking) */}
            <Route path="/quiz/:quizId" element={<Suspense fallback={<PageLoader />}><QuizPassationPage /></Suspense>} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <SchoolProvider>
                    <MessagesProvider>
                      <TeachersProvider>
                        <RoomsProvider>
                          <DashboardLayout />
                        </RoomsProvider>
                      </TeachersProvider>
                    </MessagesProvider>
                  </SchoolProvider>
                </PrivateRoute>
              }
            >
              <Suspense fallback={<PageLoader />}>
                <Route index element={<Dashboard />} />

                {/* Élèves */}
                <Route path="eleves" element={<Students />} />
                <Route path="eleves/ajouter" element={<AddStudent />} />
                <Route path="eleves/modifier/:id" element={<EditStudent />} />
                <Route path="eleves/:id" element={<StudentProfile />} />
                <Route path="eleves/:id/messages" element={<StudentMessages />} />

                {/* Enseignants */}
                <Route path="enseignants" element={<Teachers />} />
                <Route path="enseignants/ajouter" element={<AddTeacher />} />
                <Route path="enseignants/modifier/:id" element={<EditTeacher />} />

                {/* Absences */}
                <Route path="absences" element={<AbsencesPage />} />

                {/* Inscriptions (Board 13) */}
                <Route path="inscriptions" element={<InscriptionsPage />} />

                {/* Emploi du temps */}
                <Route path="emploi-du-temps" element={<EmploiDuTempsPage />} />
                <Route path="emploi-salles" element={<EmploiSalles />} />
                <Route path="emploi-salles/ajouter" element={<AddRoom />} />
                <Route path="emploi-salles/modifier/:id" element={<EditRoom />} />

                {/* Configuration */}
                <Route path="config/niveaux" element={<Niveaux />} />
                <Route path="ecole" element={<SchoolInfo />} />

                {/* Finance */}
                <Route path="finance" element={<FinancePaiement />} />
                <Route path="finance/paiement" element={<FinancePaiement />} />
                <Route path="finance/depenses" element={<Depenses />} />
                <Route path="finance/tresorerie" element={<Tresorerie />} />
                <Route path="finance/remises-penalites" element={<RemisesPenalites />} />
                <Route path="finance/relances" element={<Relances />} />
                <Route path="finance/rapports" element={<RapportsFinanciers />} />
                <Route path="finance/caisse" element={<GestionCaisse />} />
                <Route path="factures" element={<FacturesPage />} />

                {/* Pédagogie */}
                <Route path="evaluations" element={<Evaluations />} />
                <Route path="carnets" element={<CarnetNotes />} />
                <Route path="annee-scolaire" element={<AnneeScolairePage />} />
                <Route path="devoirs" element={<DevoirsPage />} />
                <Route path="quiz" element={<QuizManagementPage />} />

                {/* Bulletins */}
                <Route path="bulletin-templates" element={<BulletinTemplatesPage />} />
                <Route path="bulletins-masse" element={<BulletinsMassePage />} />
                <Route path="stats-reussite" element={<StatsReussitePage />} />
                <Route path="comparatif" element={<ComparatifPerformancesPage />} />

                {/* Vie scolaire */}
                <Route path="discipline" element={<DisciplinePage />} />
                <Route path="bibliotheque" element={<BibliothequePage />} />
                <Route path="transport" element={<TransportPage />} />
                <Route path="cantine" element={<CantinePage />} />

                {/* Documents */}
                <Route path="rapports" element={<Rapports />} />
                <Route path="circulaires" element={<Circulaires />} />
                <Route path="documents" element={<GenerationDocumentsPage />} />

                {/* Communication */}
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="annonces" element={<AnnoncesPage />} />

                {/* Portail Parent */}
                <Route path="portail-parent" element={<ParentPortalPage />} />

                {/* RH & Personnel (Board 19) */}
                <Route path="contrats" element={<ContratsPage />} />
                <Route path="rh/pointage" element={<PointagePage />} />
                <Route path="rh/paie" element={<PaiePage />} />
                <Route path="rh/formations" element={<FormationsPage />} />
                <Route path="teacher-evaluations" element={<TeacherEvaluationsPage />} />

                {/* Analytics (Board 22) */}
                <Route path="analytics" element={<AnalyticsDashboardPage />} />
                <Route path="suivi-eleve" element={<SuiviElevePage />} />

                {/* Intégrations (Board 21) */}
                <Route path="integrations" element={<IntegrationsPage />} />

                {/* SaaS Admin (Board 24) */}
                <Route path="super-admin" element={<SuperAdminDashboardPage />} />

                {/* Vitrine */}
                <Route path="vitrine" element={<VitrineAdminPage />} />

                {/* Administration */}
                <Route path="utilisateurs" element={<UsersPage />} />
                <Route path="configuration" element={<Configuration />} />
                <Route path="tracabilite" element={<Tracabilite />} />
                <Route path="statistique" element={<Statistiques />} />

                <Route path="*" element={<Dashboard />} />
              </Suspense>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
