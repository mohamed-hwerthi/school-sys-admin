# Rapport de test — Module **Enseignants & RH**

> Test exhaustif de l'ensemble des APIs du sidebar **Enseignants & RH** (Enseignants, Affectations, Contrats & Congés, Pointage, Paie, Formations, Évaluations).

## 1. Contexte

| Champ | Valeur |
|---|---|
| **Date du test** | 2026-05-09 |
| **Base URL** | `http://localhost:8083/api` |
| **Tenant** | `demo_school` |
| **Utilisateur** | `admin@school.dev` (SUPER_ADMIN) |
| **Authentification** | JWT Bearer (`/api/auth/login`) |
| **Header tenant** | `X-Tenant-ID: demo_school` |

### Documentation Swagger / OpenAPI

L'application **expose déjà** une documentation OpenAPI complète :

| Ressource | URL |
|---|---|
| Swagger UI interactif | <http://localhost:8083/swagger-ui/index.html> |
| Spec OpenAPI 3 brute (JSON) | <http://localhost:8083/v3/api-docs> |
| Sous-ensemble RH (extrait) | `scripts/openapi-rh.json` |

Configuration : `school-system-back/src/main/java/com/schoolSys/schooolSys/common/config/OpenApiConfig.java` — sécurité `bearer-jwt` + paramètre obligatoire `X-Tenant-ID` ajouté automatiquement à toutes les opérations sauf `/api/tenants`.

> Pour tester directement dans Swagger UI : cliquez sur **Authorize** → collez le `accessToken` retourné par `POST /api/auth/login`, puis renseignez le header `X-Tenant-ID = demo_school`.

## 2. Comment exécuter le script de test

```bash
# Backend doit tourner sur :8083 (déjà le cas pour ce rapport)
cd school-system-back && mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Lancer la suite de tests (44/50 ont passé sur l'environnement courant)
./scripts/test-rh-api.sh

# Avec paramètres personnalisés
./scripts/test-rh-api.sh http://localhost:8083/api admin@school.dev admin123 demo_school
```

Sortie : `/tmp/rh-api-test/rapport.md` + un fichier `.json` par appel (`001_GET__teachers.json`, …).

## 3. Inventaire complet des endpoints

### 3.1 — `Enseignants` · `/api/teachers` (TeacherController)

| # | Méthode | Endpoint | Description | PreAuth |
|---|---|---|---|---|
| 1 | GET | `/api/teachers` | Liste tous les enseignants | — |
| 2 | GET | `/api/teachers/{id}` | Détail d'un enseignant | — |
| 3 | POST | `/api/teachers` | Créer un enseignant | — |
| 4 | PUT | `/api/teachers/{id}` | Mettre à jour | — |
| 5 | DELETE | `/api/teachers/{id}` | Supprimer (soft delete) | — |
| 6 | POST | `/api/teachers/import` | Import Excel/CSV (multipart) | — |

**Payload `TeacherRequestDTO`** :
```json
{
  "firstName": "Test",          // requis
  "lastName": "Enseignant",     // requis
  "email": "test@school.tn",
  "specialization": "Maths",    // requis
  "sexe": "M",                  // M ou F
  "telephone": "+216 99 000 000",
  "dateNaissance": "1985-04-12",
  "statut": "Actif"             // Actif | Inactif | En attente
}
```

### 3.2 — `Affectations` · `/api/affectations` (AffectationController)

| # | Méthode | Endpoint | Description | PreAuth |
|---|---|---|---|---|
| 1 | GET | `/api/affectations` | Liste / recherche `?teacherId=&classeId=&moduleId=&anneeScolaire=` | `MANAGE_TEACHERS` |
| 2 | GET | `/api/affectations/{id}` | Détail | `MANAGE_TEACHERS` |
| 3 | POST | `/api/affectations` | Créer | `MANAGE_TEACHERS` |
| 4 | PUT | `/api/affectations/{id}` | Mettre à jour | `MANAGE_TEACHERS` |
| 5 | DELETE | `/api/affectations/{id}` | Supprimer | `MANAGE_TEACHERS` |

**Payload `AffectationRequestDTO`** :
```json
{
  "teacherId": 1,           // requis
  "classeId":  3,           // requis
  "moduleId":  2,           // null = prof principal sans matière
  "anneeScolaire": "2025-2026", // requis
  "dateDebut": "2025-09-15",
  "dateFin":   "2026-06-30",
  "notes": "Prof principal"
}
```

### 3.3 — `Contrats` · `/api/rh/contrats` (RhController)

| # | Méthode | Endpoint | Description |
|---|---|---|---|
| 1 | GET | `/api/rh/contrats` | Liste |
| 2 | GET | `/api/rh/contrats/{id}` | Détail |
| 3 | GET | `/api/rh/contrats/enseignant/{enseignantId}` | Tous les contrats d'un enseignant |
| 4 | POST | `/api/rh/contrats` | Créer |
| 5 | PUT | `/api/rh/contrats/{id}` | Mettre à jour |
| 6 | DELETE | `/api/rh/contrats/{id}` | Supprimer |

**Payload `ContratRequestDTO`** :
```json
{
  "enseignantId": 1,        // requis
  "typeContrat": "CDI",     // requis (CDI / CDD / VAC / STAGE)
  "dateDebut": "2025-09-01",// requis
  "dateFin":   "2026-08-31",
  "salaire":   1800,        // requis (BigDecimal)
  "statut":    "ACTIF",
  "observations": "…"
}
```

### 3.4 — `Congés` · `/api/rh/conges` (RhController)

| # | Méthode | Endpoint | Description |
|---|---|---|---|
| 1 | GET | `/api/rh/conges?statut=&typeConge=` | Liste filtrable |
| 2 | GET | `/api/rh/conges/{id}` | Détail |
| 3 | GET | `/api/rh/conges/enseignant/{enseignantId}` | Congés d'un enseignant |
| 4 | POST | `/api/rh/conges` | Créer une demande |
| 5 | PUT | `/api/rh/conges/{id}` | Mettre à jour |
| 6 | PUT | `/api/rh/conges/{id}/approuver` | Approuver |
| 7 | PUT | `/api/rh/conges/{id}/refuser` | Refuser |
| 8 | DELETE | `/api/rh/conges/{id}` | Supprimer |

**Payload `CongeRequestDTO`** :
```json
{
  "enseignantId": 1,
  "typeConge": "ANNUEL",       // ANNUEL / MALADIE / MATERNITE / SANS_SOLDE
  "dateDebut": "2026-07-01",
  "dateFin":   "2026-07-15",
  "motif": "Vacances",
  "statut": "EN_ATTENTE"       // EN_ATTENTE / APPROUVE / REFUSE
}
```

### 3.5 — `Pointage` · `/api/rh/pointage` (PointagePersonnelController)

| # | Méthode | Endpoint | Description |
|---|---|---|---|
| 1 | GET | `/api/rh/pointage` | Liste tous |
| 2 | GET | `/api/rh/pointage/{id}` | Détail |
| 3 | GET | `/api/rh/pointage/date/{date}` | Pointages d'une date `YYYY-MM-DD` |
| 4 | GET | `/api/rh/pointage/employe/{employeId}?employeType=ENSEIGNANT` | Historique d'un employé |
| 5 | POST | `/api/rh/pointage` | Créer |
| 6 | PUT | `/api/rh/pointage/{id}` | Mettre à jour |
| 7 | DELETE | `/api/rh/pointage/{id}` | Supprimer |

**Payload `CreatePointageRequest`** :
```json
{
  "employeId": 1,
  "employeType": "ENSEIGNANT",     // ENSEIGNANT / ADMIN / AUTRE
  "datePointage": "2026-05-09",
  "heureArrivee": "08:00:00",
  "heureDepart":  "16:30:00",
  "heuresTravaillees": 8.5,
  "statut": "PRESENT",             // PRESENT / RETARD / ABSENT / CONGE
  "notes": "…"
}
```

### 3.6 — `Paie` · `/api/rh/paie` (FichePaieController)

| # | Méthode | Endpoint | Description |
|---|---|---|---|
| 1 | GET | `/api/rh/paie` | Liste |
| 2 | GET | `/api/rh/paie/{id}` | Détail |
| 3 | GET | `/api/rh/paie/employe/{employeId}?employeType=ENSEIGNANT` | Fiches d'un employé |
| 4 | GET | `/api/rh/paie/mois?mois=5&annee=2026` | Fiches d'un mois |
| 5 | POST | `/api/rh/paie` | Créer |
| 6 | PUT | `/api/rh/paie/{id}` | Mettre à jour |
| 7 | DELETE | `/api/rh/paie/{id}` | Supprimer |

**Payload `CreateFichePaieRequest`** :
```json
{
  "employeId": 1,
  "employeType": "ENSEIGNANT",
  "mois": 5,
  "annee": 2026,
  "salaireBase": 1800,
  "primes":      150,
  "retenues":    50,
  "salaireNet":  1900,         // requis (calcul côté front recommandé)
  "datePaiement": "2026-05-30",
  "paye": false,
  "commentaire": "…"
}
```

### 3.7 — `Formations` · `/api/rh/formations` (FormationController)

| # | Méthode | Endpoint | Description |
|---|---|---|---|
| 1 | GET | `/api/rh/formations` | Liste |
| 2 | GET | `/api/rh/formations/{id}` | Détail |
| 3 | GET | `/api/rh/formations/stats` | Stats agrégées (RhStatsDTO) |
| 4 | POST | `/api/rh/formations` | Créer |
| 5 | PUT | `/api/rh/formations/{id}` | Mettre à jour |
| 6 | DELETE | `/api/rh/formations/{id}` | Supprimer |
| 7 | POST | `/api/rh/formations/{id}/participants` | Ajouter participant |
| 8 | DELETE | `/api/rh/formations/participants/{participantId}` | Retirer participant |

**Payload `CreateFormationRequest`** :
```json
{
  "titre": "Pédagogie active",       // requis
  "description": "…",
  "formateur": "Dr. Ben Salah",
  "dateDebut": "2026-06-15",         // requis
  "dateFin":   "2026-06-17",
  "lieu": "Salle 101",
  "nombreHeures": 18,
  "cout": 350,
  "statut": "PLANIFIEE"              // PLANIFIEE / EN_COURS / TERMINEE / ANNULEE
}
```

**Payload `AddParticipantRequest`** :
```json
{ "employeId": 1, "employeType": "ENSEIGNANT", "present": true, "certificatObtenu": false }
```

### 3.8 — `Évaluations` · `/api/teacher-evaluations` (TeacherEvaluationController)

| # | Méthode | Endpoint | Description |
|---|---|---|---|
| 1 | GET | `/api/teacher-evaluations?teacherId=&anneeScolaire=&trimestre=` | Liste filtrable |
| 2 | GET | `/api/teacher-evaluations/{id}` | Détail |
| 3 | GET | `/api/teacher-evaluations/stats/{teacherId}` | Statistiques d'un enseignant |
| 4 | POST | `/api/teacher-evaluations` | Créer |
| 5 | PUT | `/api/teacher-evaluations/{id}` | Mettre à jour |
| 6 | DELETE | `/api/teacher-evaluations/{id}` | Supprimer |

**Payload `TeacherEvaluationDTO`** (PUT/POST) :
```json
{
  "teacherId": 1,
  "anneeScolaire": "2025-2026",
  "trimestre": 2,                    // 1 / 2 / 3
  "ponctualite":   4,                // /5
  "pedagogie":     5,
  "discipline":    4,
  "communication": 5,
  "implication":   5,
  "commentaire": "…"
}
```

## 4. Synthèse des résultats

### 4.1 Score global

| Total | ✓ Pass | ✗ Fail | Taux de réussite |
|------:|------:|------:|----:|
| **50** | **44** | **6** | **88 %** |

### 4.2 Détail par module

| Module | Tests | ✓ | ✗ | État |
|---|---:|---:|---:|---|
| Enseignants            | 4  | 4  | 0 | 🟢 OK |
| Affectations           | 4  | 4  | 0 | 🟢 OK |
| Contrats               | 3  | 0  | 3 | 🔴 **Bloqué** |
| Congés                 | 8  | 6  | 2 | 🟡 Partiel |
| Pointage               | 6  | 6  | 0 | 🟢 OK |
| Paie                   | 6  | 6  | 0 | 🟢 OK |
| Formations             | 7  | 6  | 1 | 🟡 Partiel |
| Évaluations            | 6  | 6  | 0 | 🟢 OK |
| Suppression (cleanup)  | 6  | 6  | 0 | 🟢 OK |

### 4.3 Cas en échec — analyse

Tous les `500` sont causés par des **`org.hibernate.LazyInitializationException`** côté backend.
Cela se produit lorsque les services chargent des entités liées (`Teacher`, `AnneeScolaire`, `Formation.participants`) en dehors d'une session JPA active, sans `JOIN FETCH` ni `@Transactional` sur la lecture.

| # | Endpoint | HTTP | Cause racine (extrait du log) |
|---|---|---|---|
| 1 | `GET /api/rh/contrats` | 500 | `LazyInitializationException: AnneeScolaire.trimestres` |
| 2 | `POST /api/rh/contrats` | 500 | idem (chargement Teacher associé) |
| 3 | `GET /api/rh/contrats/enseignant/{id}` | 500 | idem |
| 4 | `GET /api/rh/conges/{id}` | 500 | idem (Teacher → AnneeScolaire.trimestres) |
| 5 | `GET /api/rh/conges/enseignant/{id}` | 500 | idem |
| 6 | `GET /api/rh/formations/{id}` | 500 | `Formation.participants` lazy non initialisé |

#### Correctifs recommandés

```java
// Option 1 — JOIN FETCH dans la query du repository
@Query("select c from ContratEnseignant c left join fetch c.enseignant where c.id = :id")
Optional<ContratEnseignant> findByIdWithEnseignant(@Param("id") Long id);

// Option 2 — Marquer le service @Transactional(readOnly = true) (Open-Session-In-View off)
@Service @Transactional(readOnly = true)
public class RhService { … }

// Option 3 — Utiliser des EntityGraph / fetch=EAGER ciblés
@EntityGraph(attributePaths = { "participants" })
Optional<Formation> findById(Long id);
```

> Le mapper DTO doit être appelé **avant** la fin de la transaction pour matérialiser les collections.

### 4.4 Cas en succès notables

- L'**authentification JWT** fonctionne (token len = 210, login admin@school.dev / admin123 OK).
- Le **header `X-Tenant-ID: demo_school`** est correctement résolu et l'isolation par schéma est active.
- Les opérations **CRUD complètes** sont opérationnelles sur Enseignants, Pointage, Paie, Évaluations, et le nettoyage final supprime correctement toutes les ressources créées.
- L'**autorisation `MANAGE_TEACHERS`** sur `/api/affectations` répond correctement aux appels d'un SUPER_ADMIN.

## 5. Livrables

| Fichier | Rôle |
|---|---|
| `scripts/test-rh-api.sh` | Script bash exécutable (50 cas de test, login + CRUD + cleanup) |
| `scripts/openapi-rh.json` | Spec OpenAPI 3 filtrée sur les chemins RH/Enseignants (38 chemins) |
| `scripts/RH_API_REPORT.md` | Ce rapport |
| `/tmp/rh-api-test/rapport.md` | Rapport généré automatiquement à chaque exécution (avec corps JSON) |
| `/tmp/rh-api-test/NNN_*.json` | Réponse brute de chaque appel pour debug |

## 6. Prochaines étapes suggérées

1. **Corriger les 6 `LazyInitializationException`** (voir §4.3) — bloquant pour l'usage en prod.
2. Ajouter `@Tag` et `@Operation` sur les contrôleurs RH pour enrichir la doc Swagger UI.
3. Étendre le script avec des tests négatifs (401 sans token, 403 sans permission, 400 payload invalide).
4. Brancher le script dans la CI (GitHub Actions) pour smoke-test après chaque déploiement.
