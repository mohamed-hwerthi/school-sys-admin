import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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

const S = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>{children}</Suspense>
  </ErrorBoundary>
);

const App = () => (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
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
              <Route index element={<S><Dashboard /></S>} />

              {/* Élèves */}
              <Route path="eleves" element={<S><Students /></S>} />
              <Route path="eleves/ajouter" element={<S><AddStudent /></S>} />
              <Route path="eleves/modifier/:id" element={<S><EditStudent /></S>} />
              <Route path="eleves/:id" element={<S><StudentProfile /></S>} />
              <Route path="eleves/:id/messages" element={<S><StudentMessages /></S>} />

              {/* Enseignants */}
              <Route path="enseignants" element={<S><Teachers /></S>} />
              <Route path="enseignants/ajouter" element={<S><AddTeacher /></S>} />
              <Route path="enseignants/modifier/:id" element={<S><EditTeacher /></S>} />

              {/* Absences */}
              <Route path="absences" element={<S><AbsencesPage /></S>} />

              {/* Inscriptions (Board 13) */}
              <Route path="inscriptions" element={<S><InscriptionsPage /></S>} />

              {/* Emploi du temps */}
              <Route path="emploi-du-temps" element={<S><EmploiDuTempsPage /></S>} />
              <Route path="emploi-salles" element={<S><EmploiSalles /></S>} />
              <Route path="emploi-salles/ajouter" element={<S><AddRoom /></S>} />
              <Route path="emploi-salles/modifier/:id" element={<S><EditRoom /></S>} />

              {/* Configuration */}
              <Route path="config/niveaux" element={<S><Niveaux /></S>} />
              <Route path="ecole" element={<S><SchoolInfo /></S>} />

              {/* Finance */}
              <Route path="finance" element={<S><FinancePaiement /></S>} />
              <Route path="finance/paiement" element={<S><FinancePaiement /></S>} />
              <Route path="finance/depenses" element={<S><Depenses /></S>} />
              <Route path="finance/tresorerie" element={<S><Tresorerie /></S>} />
              <Route path="finance/remises-penalites" element={<S><RemisesPenalites /></S>} />
              <Route path="finance/relances" element={<S><Relances /></S>} />
              <Route path="finance/rapports" element={<S><RapportsFinanciers /></S>} />
              <Route path="finance/caisse" element={<S><GestionCaisse /></S>} />
              <Route path="factures" element={<S><FacturesPage /></S>} />

              {/* Pédagogie */}
              <Route path="evaluations" element={<S><Evaluations /></S>} />
              <Route path="carnets" element={<S><CarnetNotes /></S>} />
              <Route path="annee-scolaire" element={<S><AnneeScolairePage /></S>} />
              <Route path="devoirs" element={<S><DevoirsPage /></S>} />
              <Route path="quiz" element={<S><QuizManagementPage /></S>} />

              {/* Bulletins */}
              <Route path="bulletin-templates" element={<S><BulletinTemplatesPage /></S>} />
              <Route path="bulletins-masse" element={<S><BulletinsMassePage /></S>} />
              <Route path="stats-reussite" element={<S><StatsReussitePage /></S>} />
              <Route path="comparatif" element={<S><ComparatifPerformancesPage /></S>} />

              {/* Vie scolaire */}
              <Route path="discipline" element={<S><DisciplinePage /></S>} />
              <Route path="bibliotheque" element={<S><BibliothequePage /></S>} />
              <Route path="transport" element={<S><TransportPage /></S>} />
              <Route path="cantine" element={<S><CantinePage /></S>} />

              {/* Documents */}
              <Route path="rapports" element={<S><Rapports /></S>} />
              <Route path="circulaires" element={<S><Circulaires /></S>} />
              <Route path="documents" element={<S><GenerationDocumentsPage /></S>} />

              {/* Communication */}
              <Route path="notifications" element={<S><NotificationsPage /></S>} />
              <Route path="annonces" element={<S><AnnoncesPage /></S>} />

              {/* Portail Parent */}
              <Route path="portail-parent" element={<S><ParentPortalPage /></S>} />

              {/* RH & Personnel (Board 19) */}
              <Route path="contrats" element={<S><ContratsPage /></S>} />
              <Route path="rh/pointage" element={<S><PointagePage /></S>} />
              <Route path="rh/paie" element={<S><PaiePage /></S>} />
              <Route path="rh/formations" element={<S><FormationsPage /></S>} />
              <Route path="teacher-evaluations" element={<S><TeacherEvaluationsPage /></S>} />

              {/* Analytics (Board 22) */}
              <Route path="analytics" element={<S><AnalyticsDashboardPage /></S>} />
              <Route path="suivi-eleve" element={<S><SuiviElevePage /></S>} />

              {/* Intégrations (Board 21) */}
              <Route path="integrations" element={<S><IntegrationsPage /></S>} />

              {/* SaaS Admin (Board 24) */}
              <Route path="super-admin" element={<S><SuperAdminDashboardPage /></S>} />

              {/* Vitrine */}
              <Route path="vitrine" element={<S><VitrineAdminPage /></S>} />

              {/* Administration */}
              <Route path="utilisateurs" element={<S><UsersPage /></S>} />
              <Route path="configuration" element={<S><Configuration /></S>} />
              <Route path="tracabilite" element={<S><Tracabilite /></S>} />
              <Route path="statistique" element={<S><Statistiques /></S>} />

              <Route path="*" element={<S><Dashboard /></S>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
