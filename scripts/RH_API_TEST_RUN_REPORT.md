# Rapport d'exécution — Tests API Enseignants & RH

> Capture exhaustive de la run de tests : statuts HTTP, durées, logs serveur, traces d'erreur, code source incriminé.

| Champ | Valeur |
|---|---|
| **Date d'exécution** | 2026-05-09 19:12:23 → 19:12:33 UTC |
| **Durée totale** | ~10.2 s pour 53 appels |
| **Backend** | Spring Boot 4.0.3, Java 17, profile `dev`, port `8083` |
| **Base URL** | `http://localhost:8083/api` |
| **Auth** | JWT Bearer (login admin@school.dev / admin123) — token len = 210 |
| **Tenant** | `demo_school` |
| **Script** | `scripts/test-rh-api.sh` |

---

## 1. Score global

| Total | ✓ Pass | ✗ Fail | Taux |
|------:|------:|------:|----:|
| **53** | **48** | **5** | **90,6 %** |

> Amélioration vs run précédent : 50/44 → 53/48 (le list `/rh/contrats` est passé cette fois car la table était vide au moment de l'appel ; il **failera** dès qu'il y aura au moins un contrat à mapper, comme l'a confirmé la run précédente).

---

## 2. Résultats détaillés par endpoint

### 2.1 — Authentification (login)

| Heure | Méthode | URL | Status | Note |
|---|---|---|:---:|---|
| 19:12:23.546 | POST | `/api/auth/login` | **200** | Token JWT obtenu, `accessToken` len=210 |

### 2.2 — Module Enseignants `/api/teachers` ✓ 4/4

| # | Heure | Méthode | URL | HTTP | État |
|---:|---|---|---|:---:|:---:|
| 1 | 19:12:23.953 | GET    | `/api/teachers` | **200** | ✓ |
| 2 | 19:12:24.208 | POST   | `/api/teachers` | **201** | ✓ ID=22 |
| 3 | 19:12:24.558 | GET    | `/api/teachers/22` | **200** | ✓ |
| 4 | 19:12:24.720 | PUT    | `/api/teachers/22` | **200** | ✓ |

### 2.3 — Module Affectations `/api/affectations` ✓ 4/4

| # | Heure | Méthode | URL | HTTP | État |
|---:|---|---|---|:---:|:---:|
| 5 | 19:12:24.998 | GET    | `/api/affectations` | **200** | ✓ |
| 6 | 19:12:25.239 | GET    | `/api/affectations?anneeScolaire=2025-2026` | **200** | ✓ |
| 7 | 19:12:25.411 | GET    | `/api/affectations?teacherId=1` | **200** | ✓ |
| 8 | 19:12:25.559 | GET    | `/api/affectations/1` | **200** | ✓ |

### 2.4 — Module Contrats `/api/rh/contrats` 🔴 3/5

| # | Heure | Méthode | URL | HTTP | État |
|---:|---|---|---|:---:|:---:|
| 9 | 19:12:25.742 | GET    | `/api/rh/contrats` | **200** | ✓ (table vide) |
| 10 | 19:12:25.949 | POST   | `/api/rh/contrats` | **201** | ✓ ID=1 |
| 11 | 19:12:26.263 | GET    | `/api/rh/contrats/enseignant/1` | **500** | ✗ |
| 12 | 19:12:26.411 | GET    | `/api/rh/contrats/1` | **500** | ✗ |
| 13 | 19:12:26.564 | PUT    | `/api/rh/contrats/1` | **200** | ✓ |

### 2.5 — Module Congés `/api/rh/conges` 🟡 6/8

| # | Heure | Méthode | URL | HTTP | État |
|---:|---|---|---|:---:|:---:|
| 14 | 19:12:26.827 | GET    | `/api/rh/conges` | **200** | ✓ |
| 15 | 19:12:26.979 | GET    | `/api/rh/conges?statut=EN_ATTENTE` | **200** | ✓ |
| 16 | 19:12:27.131 | POST   | `/api/rh/conges` | **201** | ✓ ID=2 |
| 17 | 19:12:27.464 | GET    | `/api/rh/conges/enseignant/1` | **500** | ✗ |
| 18 | 19:12:27.610 | GET    | `/api/rh/conges/2` | **500** | ✗ |
| 19 | 19:12:27.764 | PUT    | `/api/rh/conges/2` | **200** | ✓ |
| 20 | 19:12:28.046 | PUT    | `/api/rh/conges/2/approuver` | **200** | ✓ |
| 21 | 19:12:28.202 | PUT    | `/api/rh/conges/2/refuser` | **200** | ✓ |

### 2.6 — Module Pointage `/api/rh/pointage` ✓ 6/6

| # | Heure | Méthode | URL | HTTP | État |
|---:|---|---|---|:---:|:---:|
| 22 | 19:12:28.372 | GET    | `/api/rh/pointage` | **200** | ✓ |
| 23 | 19:12:28.525 | GET    | `/api/rh/pointage/date/2026-05-09` | **200** | ✓ |
| 24 | 19:12:28.671 | POST   | `/api/rh/pointage` | **201** | ✓ ID=2 |
| 25 | 19:12:28.997 | GET    | `/api/rh/pointage/employe/1?employeType=ENSEIGNANT` | **200** | ✓ |
| 26 | 19:12:29.162 | GET    | `/api/rh/pointage/2` | **200** | ✓ |
| 27 | 19:12:29.331 | PUT    | `/api/rh/pointage/2` | **200** | ✓ |

### 2.7 — Module Paie `/api/rh/paie` ✓ 6/6

| # | Heure | Méthode | URL | HTTP | État |
|---:|---|---|---|:---:|:---:|
| 28 | 19:12:29.596 | GET    | `/api/rh/paie` | **200** | ✓ |
| 29 | 19:12:29.730 | GET    | `/api/rh/paie/mois?mois=5&annee=2026` | **200** | ✓ |
| 30 | 19:12:29.873 | POST   | `/api/rh/paie` | **201** | ✓ ID=2 |
| 31 | 19:12:30.167 | GET    | `/api/rh/paie/employe/1?employeType=ENSEIGNANT` | **200** | ✓ |
| 32 | 19:12:30.322 | GET    | `/api/rh/paie/2` | **200** | ✓ |
| 33 | 19:12:30.468 | PUT    | `/api/rh/paie/2` | **200** | ✓ |

### 2.8 — Module Formations `/api/rh/formations` 🟡 6/7

| # | Heure | Méthode | URL | HTTP | État |
|---:|---|---|---|:---:|:---:|
| 34 | 19:12:30.703 | GET    | `/api/rh/formations` | **200** | ✓ |
| 35 | 19:12:30.845 | GET    | `/api/rh/formations/stats` | **200** | ✓ |
| 36 | 19:12:31.049 | POST   | `/api/rh/formations` | **201** | ✓ ID=2 |
| 37 | 19:12:31.381 | GET    | `/api/rh/formations/2` | **500** | ✗ |
| 38 | 19:12:31.530 | PUT    | `/api/rh/formations/2` | **200** | ✓ |
| 39 | 19:12:31.774 | POST   | `/api/rh/formations/2/participants` | **201** | ✓ ID=2 |
| 40 | 19:12:32.099 | DELETE | `/api/rh/formations/participants/2` | **204** | ✓ |

### 2.9 — Module Évaluations `/api/teacher-evaluations` ✓ 6/6

| # | Heure | Méthode | URL | HTTP | État |
|---:|---|---|---|:---:|:---:|
| 41 | 19:12:32.163 | GET    | `/api/teacher-evaluations` | **200** | ✓ |
| 42 | 19:12:32.307 | GET    | `/api/teacher-evaluations?teacherId=1` | **200** | ✓ |
| 43 | 19:12:32.453 | POST   | `/api/teacher-evaluations` | **201** | ✓ ID=2 |
| 44 | 19:12:32.809 | GET    | `/api/teacher-evaluations/stats/1` | **200** | ✓ |
| 45 | 19:12:32.964 | GET    | `/api/teacher-evaluations/2` | **200** | ✓ |
| 46 | 19:12:33.116 | PUT    | `/api/teacher-evaluations/2` | **200** | ✓ |

### 2.10 — Nettoyage (DELETE) ✓ 7/7

| # | Heure | Méthode | URL | HTTP | État |
|---:|---|---|---|:---:|:---:|
| 47 | 19:12:33.409 | DELETE | `/api/teacher-evaluations/2` | **204** | ✓ |
| 48 | 19:12:33.455 | DELETE | `/api/rh/formations/2` | **204** | ✓ |
| 49 | 19:12:33.511 | DELETE | `/api/rh/paie/2` | **204** | ✓ |
| 50 | 19:12:33.565 | DELETE | `/api/rh/pointage/2` | **204** | ✓ |
| 51 | 19:12:33.624 | DELETE | `/api/rh/conges/2` | **204** | ✓ |
| 52 | 19:12:33.676 | DELETE | `/api/rh/contrats/1` | **204** | ✓ |
| 53 | 19:12:33.727 | DELETE | `/api/teachers/22` | **204** | ✓ |

---

## 3. Synthèse par module

| Module | Endpoints testés | ✓ | ✗ | État | Cause d'échec |
|---|---:|---:|---:|---|---|
| Authentification         | 1 | 1 | 0 | 🟢 | — |
| Enseignants              | 4 | 4 | 0 | 🟢 | — |
| Affectations             | 4 | 4 | 0 | 🟢 | — |
| Contrats                 | 5 | 3 | 2 | 🔴 | LazyInit `Teacher` (RhService.toContratDto:187) |
| Congés                   | 8 | 6 | 2 | 🟡 | LazyInit `Teacher` (RhService.toCongeDto:204) |
| Pointage                 | 6 | 6 | 0 | 🟢 | — |
| Paie                     | 6 | 6 | 0 | 🟢 | — |
| Formations               | 7 | 6 | 1 | 🟡 | LazyInit `Formation.participants` (FormationService.toDto:129) |
| Évaluations              | 6 | 6 | 0 | 🟢 | — |
| Cleanup (DELETE)         | 7 | 7 | 0 | 🟢 | — |

---

## 4. Logs serveur — extraits sur les 5 échecs

> Source : `school-system-back/logs/backend.log`. Le `GlobalExceptionHandler` capte toutes les exceptions et renvoie HTTP 500 avec `{ "success": false, "message": "An unexpected error occurred", "data": null }`.

### 4.1 Erreur #11 — `GET /api/rh/contrats/enseignant/1` → 500

```
2026-05-09 19:12:26.283 ERROR c.s.s.c.e.GlobalExceptionHandler - Unexpected error
org.hibernate.LazyInitializationException: Could not initialize proxy
        [com.schoolSys.schooolSys.teacher.Teacher#1] - no session
    at com.schoolSys.schooolSys.teacher.Teacher$HibernateProxy.getLastName(Unknown Source)
    at com.schoolSys.schooolSys.rh.RhService.toContratDto(RhService.java:187)
    at com.schoolSys.schooolSys.rh.RhService.getContratsByEnseignant(RhService.java:39)
    at com.schoolSys.schooolSys.rh.RhController.getContratsByEnseignant(RhController.java:37)
```

### 4.2 Erreur #12 — `GET /api/rh/contrats/1` → 500

```
2026-05-09 19:12:26.426 ERROR c.s.s.c.e.GlobalExceptionHandler - Unexpected error
org.hibernate.LazyInitializationException: Could not initialize proxy
        [com.schoolSys.schooolSys.teacher.Teacher#1] - no session
    at com.schoolSys.schooolSys.rh.RhService.toContratDto(RhService.java:187)
    at com.schoolSys.schooolSys.rh.RhService.getContratById(RhService.java:33)
    at com.schoolSys.schooolSys.rh.RhController.getContratById(RhController.java:31)
```

### 4.3 Erreur #17 — `GET /api/rh/conges/enseignant/1` → 500

```
2026-05-09 19:12:27.483 ERROR c.s.s.c.e.GlobalExceptionHandler - Unexpected error
org.hibernate.LazyInitializationException: Could not initialize proxy
        [com.schoolSys.schooolSys.teacher.Teacher#1] - no session
    at com.schoolSys.schooolSys.rh.RhService.toCongeDto(RhService.java:204)
    at com.schoolSys.schooolSys.rh.RhService.getCongesByEnseignant(RhService.java:108)
```

### 4.4 Erreur #18 — `GET /api/rh/conges/2` → 500

```
2026-05-09 19:12:27.630 ERROR c.s.s.c.e.GlobalExceptionHandler - Unexpected error
org.hibernate.LazyInitializationException: Could not initialize proxy
        [com.schoolSys.schooolSys.teacher.Teacher#1] - no session
    at com.schoolSys.schooolSys.rh.RhService.toCongeDto(RhService.java:204)
    at com.schoolSys.schooolSys.rh.RhService.getCongeById(RhService.java:102)
    at com.schoolSys.schooolSys.rh.RhController.getCongeById(RhController.java:72)
```

### 4.5 Erreur #37 — `GET /api/rh/formations/2` → 500

```
2026-05-09 19:12:31.398 ERROR c.s.s.c.e.GlobalExceptionHandler - Unexpected error
org.hibernate.LazyInitializationException: Cannot lazily initialize collection of role
        'com.schoolSys.schooolSys.rh.Formation.participants' with key '2' (no session)
    at com.schoolSys.schooolSys.rh.FormationService.toDto(FormationService.java:129)
    at com.schoolSys.schooolSys.rh.FormationService.getById(FormationService.java:34)
    at com.schoolSys.schooolSys.rh.FormationController.getById(FormationController.java:29)
```

---

## 5. Diagnostic & correctifs concrets

### 5.1 Cause racine commune

Les méthodes de **lecture** dans `RhService` et `FormationService.getById` ne sont **pas annotées `@Transactional`**.
- Hibernate retourne une entité avec un proxy lazy pour `enseignant: Teacher` (et `participants: List<Participant>`).
- À la sortie de `findById()`, la session est fermée.
- Le mapper (`toContratDto`, `toCongeDto`, `toDto`) accède ensuite à `enseignant.getLastName()` ou `formation.getParticipants()` → `LazyInitializationException`.
- Les méthodes `create*` / `update*` ne souffrent pas du problème car elles sont déjà annotées `@Transactional`.

### 5.2 Fix recommandé (3 lignes)

`school-system-back/src/main/java/com/schoolSys/schooolSys/rh/RhService.java` (ligne 30, 36, 100, 107) :

```java
@Transactional(readOnly = true)        // ← AJOUTER
public ContratResponseDTO getContratById(Long id) { … }

@Transactional(readOnly = true)        // ← AJOUTER
public List<ContratResponseDTO> getContratsByEnseignant(Long enseignantId) { … }

@Transactional(readOnly = true)        // ← AJOUTER
public CongeResponseDTO getCongeById(Long id) { … }

@Transactional(readOnly = true)        // ← AJOUTER
public List<CongeResponseDTO> getCongesByEnseignant(Long enseignantId) { … }
```

`school-system-back/src/main/java/com/schoolSys/schooolSys/rh/FormationService.java` (ligne 31) :

```java
@Transactional(readOnly = true)        // ← AJOUTER
public FormationDTO getById(Long id) { … }

@Transactional(readOnly = true)        // ← AJOUTER (préventif sur le list)
public List<FormationDTO> getAll() { … }
```

Variante plus propre : annoter la **classe** entière `@Transactional(readOnly = true)` et ne laisser que les méthodes d'écriture en `@Transactional` simple.

### 5.3 Alternative — `JOIN FETCH` au repository

Si l'on préfère ne pas étaler la session :

```java
// ContratEnseignantRepository
@Query("select c from ContratEnseignant c left join fetch c.enseignant where c.id = :id")
Optional<ContratEnseignant> findByIdWithEnseignant(@Param("id") Long id);

// FormationRepository
@EntityGraph(attributePaths = { "participants", "participants.employe" })
Optional<Formation> findById(Long id);
```

---

## 6. Observations complémentaires

- ⚠️ **Le list `/api/rh/contrats` n'est passé que par chance** : la table était vide au moment de l'appel. Dès qu'un enseignant est associé à au moins un contrat, le list `findAll().stream().map(toContratDto)` lèvera la même `LazyInitializationException`. La run précédente avait montré 500 sur cet endpoint.
- ✅ **Les filtres GET fonctionnent bien** sur tous les modules (`?statut=`, `?anneeScolaire=`, `?teacherId=`, `?employeType=`, `?mois=&annee=`).
- ✅ **Soft-delete OK** : tous les DELETE renvoient `204 No Content` (les ressources créées par les tests sont bien marquées supprimées en base).
- ✅ **Sécurité opérationnelle** : la chaîne de filtres `TenantFilter → RateLimitFilter → XssFilter → JwtAuthenticationFilter → SecurityHeadersFilter` est traversée pour chaque requête (visible dans les stack traces).
- ✅ **Swagger UI** disponible : <http://localhost:8083/swagger-ui/index.html> — fichier `scripts/openapi-rh.json` contient les 38 chemins RH/Enseignants extraits.

---

## 7. Livrables

| Fichier | Rôle |
|---|---|
| `scripts/test-rh-api.sh` | Script bash exécutable (53 cas) |
| `scripts/openapi-rh.json` | Spec OpenAPI 3 filtrée (38 chemins) |
| `scripts/RH_API_REPORT.md` | Documentation des endpoints + payloads |
| `scripts/RH_API_TEST_RUN_REPORT.md` | **Ce rapport** (résultats live + traces) |
| `/tmp/rh-api-test/rapport.md` | Rapport machine généré par chaque run |
| `/tmp/rh-api-test/NNN_*.json` | 53 réponses HTTP brutes pour debug |

## 8. Action proposée

Voulez-vous que je **corrige les 5 bugs** (`@Transactional(readOnly = true)` sur les 6 méthodes de lecture identifiées) et relance le script pour vérifier 53/53 ✓ ?
