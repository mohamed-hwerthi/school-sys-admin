#!/usr/bin/env bash
# ============================================================================
#  test-rh-api.sh — Test exhaustif des APIs du module "Enseignants & RH"
#
#  Couvre :
#    • /api/teachers              (Enseignants)
#    • /api/teacher-evaluations   (Évaluations)
#    • /api/affectations          (Affectations)
#    • /api/rh/contrats           (Contrats)
#    • /api/rh/conges             (Congés)
#    • /api/rh/pointage           (Pointage)
#    • /api/rh/paie               (Fiches de paie)
#    • /api/rh/formations         (Formations + participants)
#
#  Usage :
#    ./scripts/test-rh-api.sh                                 # défauts
#    ./scripts/test-rh-api.sh http://localhost:8083/api admin@school.dev admin123 demo_school
#    REPORT=/tmp/report.md ./scripts/test-rh-api.sh
# ============================================================================
set -uo pipefail

BASE="${1:-http://localhost:8083/api}"
EMAIL="${2:-admin@school.dev}"
PASSWORD="${3:-admin123}"
TENANT="${4:-demo_school}"
OUT_DIR="${OUT_DIR:-/tmp/rh-api-test}"
REPORT="${REPORT:-${OUT_DIR}/rapport.md}"

mkdir -p "$OUT_DIR"
: > "$REPORT"

GREEN=$'\e[32m'; RED=$'\e[31m'; YELLOW=$'\e[33m'; CYAN=$'\e[36m'; DIM=$'\e[2m'; RESET=$'\e[0m'
PASS=0; FAIL=0; TOTAL=0
declare -a FAILED_CASES=()

# ─── Helpers ─────────────────────────────────────────────────────────────────

# call METHOD PATH JSON_BODY EXPECTED_CODE LABEL [extra_curl_args...]
call() {
  local method="$1" path="$2" body="$3" expected="$4" label="$5"; shift 5
  TOTAL=$((TOTAL+1))
  local out_file="${OUT_DIR}/$(printf '%03d' $TOTAL)_${method}_$(echo "$path" | tr '/?&=' '_').json"

  local args=(-sS -o "$out_file" -w "%{http_code}" -X "$method" "${BASE}${path}" \
    -H "Content-Type: application/json" \
    -H "X-Tenant-ID: ${TENANT}" \
    -H "Authorization: Bearer ${TOKEN}")
  if [ -n "$body" ]; then args+=(-d "$body"); fi
  args+=("$@")

  local code; code=$(curl "${args[@]}" 2>/dev/null)
  local ok="✗" color="$RED" status="FAIL"
  if [[ "$code" =~ ^(200|201|204)$ ]] || [[ "$expected" == "$code" ]]; then
    ok="✓"; color="$GREEN"; status="PASS"; PASS=$((PASS+1))
  else
    FAIL=$((FAIL+1))
    FAILED_CASES+=("${method} ${path} → HTTP ${code} (attendu ${expected}) — voir ${out_file}")
  fi
  printf "%b%s%b  %-6s %-55s → %s  (attendu %s)\n" \
    "$color" "$ok" "$RESET" "$method" "$path" "$code" "$expected"

  {
    echo "### ${TOTAL}. \`${method} ${path}\`"
    echo
    echo "- **Statut:** ${status} — HTTP **${code}** (attendu ${expected})"
    echo "- **Description:** ${label}"
    if [ -n "$body" ]; then
      echo "- **Payload:**"
      echo '```json'
      echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
      echo '```'
    fi
    echo "- **Réponse:**"
    echo '```json'
    if [ -s "$out_file" ]; then
      head -c 2000 "$out_file" | python3 -m json.tool 2>/dev/null || head -c 2000 "$out_file"
    else
      echo "(corps vide)"
    fi
    echo
    echo '```'
    echo
  } >> "$REPORT"

  # exporter la réponse pour le caller
  RESP_BODY=$(cat "$out_file")
  RESP_CODE="$code"
}

extract_id() {
  echo "$1" | python3 -c 'import sys,json
try:
    d=json.load(sys.stdin)
    v=d.get("data",d)
    if isinstance(v,list) and v: print(v[0].get("id",""))
    elif isinstance(v,dict): print(v.get("id",""))
except: pass' 2>/dev/null
}

# ─── 0. Auth ─────────────────────────────────────────────────────────────────
echo "${CYAN}▶ Login : ${EMAIL} @ ${BASE} (tenant=${TENANT})${RESET}"
LOGIN_RES=$(curl -sS -X POST "${BASE}/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: ${TENANT}" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")
TOKEN=$(echo "$LOGIN_RES" | python3 -c 'import sys,json
try:
    d=json.load(sys.stdin); print(d.get("data",{}).get("accessToken",""))
except: pass' 2>/dev/null)
if [ -z "${TOKEN:-}" ]; then
  echo "${RED}✗ Login échoué :${RESET}"
  echo "$LOGIN_RES"
  exit 1
fi
echo "${GREEN}✓ Connecté. Token len=${#TOKEN}${RESET}"
echo
{
  echo "# Rapport de test — Module Enseignants & RH"
  echo
  echo "- **Date :** $(date -Iseconds)"
  echo "- **Base URL :** \`${BASE}\`"
  echo "- **Utilisateur :** \`${EMAIL}\`"
  echo "- **Tenant :** \`${TENANT}\`"
  echo
  echo "## Résultats détaillés"
  echo
} >> "$REPORT"

# ─── 1. ENSEIGNANTS — /api/teachers ──────────────────────────────────────────
echo "${YELLOW}━━━ 1. Enseignants ━━━${RESET}"
call GET    "/teachers" "" 200 "Liste des enseignants"
LIST_TEACHERS="$RESP_BODY"
EXISTING_TEACHER_ID=$(extract_id "$LIST_TEACHERS")

call POST   "/teachers" \
  '{"firstName":"Test","lastName":"Enseignant","email":"test.enseignant.'"$$"'@school.test","specialization":"Mathématiques","sexe":"M","telephone":"+216 99 000 000","statut":"Actif"}' \
  201 "Créer un enseignant"
NEW_TEACHER_ID=$(extract_id "$RESP_BODY")
[ -n "$NEW_TEACHER_ID" ] && echo "${DIM}  → ID créé : ${NEW_TEACHER_ID}${RESET}"

if [ -n "${NEW_TEACHER_ID:-}" ]; then
  call GET  "/teachers/${NEW_TEACHER_ID}" "" 200 "Détail d'un enseignant"
  call PUT  "/teachers/${NEW_TEACHER_ID}" \
    '{"firstName":"Test","lastName":"Enseignant-Modifié","email":"test.enseignant.'"$$"'@school.test","specialization":"Physique","sexe":"M","telephone":"+216 99 111 111","statut":"Actif"}' \
    200 "Mettre à jour un enseignant"
fi

# ─── 2. AFFECTATIONS — /api/affectations ────────────────────────────────────
echo
echo "${YELLOW}━━━ 2. Affectations ━━━${RESET}"
call GET "/affectations" "" 200 "Liste des affectations"
EXISTING_AFFECT_ID=$(extract_id "$RESP_BODY")
call GET "/affectations?anneeScolaire=2025-2026" "" 200 "Filtrer par année scolaire"
[ -n "${EXISTING_TEACHER_ID:-}" ] && \
  call GET "/affectations?teacherId=${EXISTING_TEACHER_ID}" "" 200 "Filtrer par enseignant"
if [ -n "${EXISTING_AFFECT_ID:-}" ]; then
  call GET "/affectations/${EXISTING_AFFECT_ID}" "" 200 "Détail d'une affectation"
fi

# ─── 3. CONTRATS — /api/rh/contrats ──────────────────────────────────────────
echo
echo "${YELLOW}━━━ 3. Contrats ━━━${RESET}"
call GET "/rh/contrats" "" 200 "Liste des contrats"
EXISTING_CONTRAT_ID=$(extract_id "$RESP_BODY")

if [ -n "${EXISTING_TEACHER_ID:-}" ]; then
  call POST "/rh/contrats" \
    "{\"enseignantId\":${EXISTING_TEACHER_ID},\"typeContrat\":\"CDI\",\"dateDebut\":\"2025-09-01\",\"dateFin\":\"2026-08-31\",\"salaire\":1800,\"statut\":\"ACTIF\",\"observations\":\"Contrat de test\"}" \
    201 "Créer un contrat"
  NEW_CONTRAT_ID=$(extract_id "$RESP_BODY")
  call GET "/rh/contrats/enseignant/${EXISTING_TEACHER_ID}" "" 200 "Contrats d'un enseignant"
fi

if [ -n "${NEW_CONTRAT_ID:-}" ]; then
  call GET "/rh/contrats/${NEW_CONTRAT_ID}" "" 200 "Détail d'un contrat"
  call PUT "/rh/contrats/${NEW_CONTRAT_ID}" \
    "{\"enseignantId\":${EXISTING_TEACHER_ID},\"typeContrat\":\"CDD\",\"dateDebut\":\"2025-09-01\",\"dateFin\":\"2026-06-30\",\"salaire\":1900,\"statut\":\"ACTIF\",\"observations\":\"Contrat modifié\"}" \
    200 "Mettre à jour un contrat"
fi

# ─── 4. CONGÉS — /api/rh/conges ──────────────────────────────────────────────
echo
echo "${YELLOW}━━━ 4. Congés ━━━${RESET}"
call GET "/rh/conges" "" 200 "Liste des congés"
call GET "/rh/conges?statut=EN_ATTENTE" "" 200 "Filtrer congés par statut"

if [ -n "${EXISTING_TEACHER_ID:-}" ]; then
  call POST "/rh/conges" \
    "{\"enseignantId\":${EXISTING_TEACHER_ID},\"typeConge\":\"ANNUEL\",\"dateDebut\":\"2026-07-01\",\"dateFin\":\"2026-07-15\",\"motif\":\"Vacances été\",\"statut\":\"EN_ATTENTE\"}" \
    201 "Créer une demande de congé"
  NEW_CONGE_ID=$(extract_id "$RESP_BODY")
  call GET "/rh/conges/enseignant/${EXISTING_TEACHER_ID}" "" 200 "Congés d'un enseignant"
fi

if [ -n "${NEW_CONGE_ID:-}" ]; then
  call GET "/rh/conges/${NEW_CONGE_ID}" "" 200 "Détail d'un congé"
  call PUT "/rh/conges/${NEW_CONGE_ID}" \
    "{\"enseignantId\":${EXISTING_TEACHER_ID},\"typeConge\":\"ANNUEL\",\"dateDebut\":\"2026-07-05\",\"dateFin\":\"2026-07-20\",\"motif\":\"Vacances été (modifié)\",\"statut\":\"EN_ATTENTE\"}" \
    200 "Mettre à jour un congé"
  call PUT "/rh/conges/${NEW_CONGE_ID}/approuver" "" 200 "Approuver un congé"
  call PUT "/rh/conges/${NEW_CONGE_ID}/refuser"   "" 200 "Refuser un congé"
fi

# ─── 5. POINTAGE — /api/rh/pointage ──────────────────────────────────────────
echo
echo "${YELLOW}━━━ 5. Pointage ━━━${RESET}"
call GET "/rh/pointage" "" 200 "Liste des pointages"
TODAY=$(date -I)
call GET "/rh/pointage/date/${TODAY}" "" 200 "Pointages du jour"

if [ -n "${EXISTING_TEACHER_ID:-}" ]; then
  call POST "/rh/pointage" \
    "{\"employeId\":${EXISTING_TEACHER_ID},\"employeType\":\"ENSEIGNANT\",\"datePointage\":\"${TODAY}\",\"heureArrivee\":\"08:00:00\",\"heureDepart\":\"16:30:00\",\"heuresTravaillees\":8.5,\"statut\":\"PRESENT\",\"notes\":\"Test pointage\"}" \
    201 "Créer un pointage"
  NEW_POINTAGE_ID=$(extract_id "$RESP_BODY")
  call GET "/rh/pointage/employe/${EXISTING_TEACHER_ID}?employeType=ENSEIGNANT" "" 200 "Pointages d'un employé"
fi

if [ -n "${NEW_POINTAGE_ID:-}" ]; then
  call GET "/rh/pointage/${NEW_POINTAGE_ID}" "" 200 "Détail d'un pointage"
  call PUT "/rh/pointage/${NEW_POINTAGE_ID}" \
    "{\"employeId\":${EXISTING_TEACHER_ID},\"employeType\":\"ENSEIGNANT\",\"datePointage\":\"${TODAY}\",\"heureArrivee\":\"08:15:00\",\"heureDepart\":\"16:30:00\",\"heuresTravaillees\":8.25,\"statut\":\"PRESENT\",\"notes\":\"Pointage corrigé\"}" \
    200 "Mettre à jour un pointage"
fi

# ─── 6. PAIE — /api/rh/paie ──────────────────────────────────────────────────
echo
echo "${YELLOW}━━━ 6. Paie ━━━${RESET}"
call GET "/rh/paie" "" 200 "Liste des fiches de paie"
call GET "/rh/paie/mois?mois=5&annee=2026" "" 200 "Fiches de paie d'un mois"

if [ -n "${EXISTING_TEACHER_ID:-}" ]; then
  call POST "/rh/paie" \
    "{\"employeId\":${EXISTING_TEACHER_ID},\"employeType\":\"ENSEIGNANT\",\"mois\":5,\"annee\":2026,\"salaireBase\":1800,\"primes\":150,\"retenues\":50,\"salaireNet\":1900,\"datePaiement\":\"2026-05-30\",\"paye\":false,\"commentaire\":\"Mai 2026 - test\"}" \
    201 "Créer une fiche de paie"
  NEW_PAIE_ID=$(extract_id "$RESP_BODY")
  call GET "/rh/paie/employe/${EXISTING_TEACHER_ID}?employeType=ENSEIGNANT" "" 200 "Paie d'un employé"
fi

if [ -n "${NEW_PAIE_ID:-}" ]; then
  call GET "/rh/paie/${NEW_PAIE_ID}" "" 200 "Détail d'une fiche de paie"
  call PUT "/rh/paie/${NEW_PAIE_ID}" \
    "{\"employeId\":${EXISTING_TEACHER_ID},\"employeType\":\"ENSEIGNANT\",\"mois\":5,\"annee\":2026,\"salaireBase\":1800,\"primes\":200,\"retenues\":50,\"salaireNet\":1950,\"datePaiement\":\"2026-05-30\",\"paye\":true,\"commentaire\":\"Mai 2026 - payé\"}" \
    200 "Mettre à jour une fiche de paie"
fi

# ─── 7. FORMATIONS — /api/rh/formations ──────────────────────────────────────
echo
echo "${YELLOW}━━━ 7. Formations ━━━${RESET}"
call GET "/rh/formations" "" 200 "Liste des formations"
call GET "/rh/formations/stats" "" 200 "Statistiques RH (formations)"

call POST "/rh/formations" \
  '{"titre":"Formation Pédagogie active","description":"Méthodes actives en classe","formateur":"Dr. Ben Salah","dateDebut":"2026-06-15","dateFin":"2026-06-17","lieu":"Salle 101","nombreHeures":18,"cout":350,"statut":"PLANIFIEE"}' \
  201 "Créer une formation"
NEW_FORMATION_ID=$(extract_id "$RESP_BODY")

if [ -n "${NEW_FORMATION_ID:-}" ]; then
  call GET "/rh/formations/${NEW_FORMATION_ID}" "" 200 "Détail d'une formation"
  call PUT "/rh/formations/${NEW_FORMATION_ID}" \
    '{"titre":"Formation Pédagogie active V2","description":"Mise à jour","formateur":"Dr. Ben Salah","dateDebut":"2026-06-15","dateFin":"2026-06-18","lieu":"Salle 102","nombreHeures":24,"cout":400,"statut":"PLANIFIEE"}' \
    200 "Mettre à jour une formation"

  if [ -n "${EXISTING_TEACHER_ID:-}" ]; then
    call POST "/rh/formations/${NEW_FORMATION_ID}/participants" \
      "{\"employeId\":${EXISTING_TEACHER_ID},\"employeType\":\"ENSEIGNANT\",\"present\":true,\"certificatObtenu\":false}" \
      200 "Ajouter un participant"
    NEW_PARTICIPANT_ID=$(extract_id "$RESP_BODY")
  fi

  [ -n "${NEW_PARTICIPANT_ID:-}" ] && \
    call DELETE "/rh/formations/participants/${NEW_PARTICIPANT_ID}" "" 200 "Supprimer un participant"
fi

# ─── 8. ÉVALUATIONS — /api/teacher-evaluations ───────────────────────────────
echo
echo "${YELLOW}━━━ 8. Évaluations enseignants ━━━${RESET}"
call GET "/teacher-evaluations" "" 200 "Liste des évaluations"
[ -n "${EXISTING_TEACHER_ID:-}" ] && \
  call GET "/teacher-evaluations?teacherId=${EXISTING_TEACHER_ID}" "" 200 "Évaluations d'un enseignant"

if [ -n "${EXISTING_TEACHER_ID:-}" ]; then
  call POST "/teacher-evaluations" \
    "{\"teacherId\":${EXISTING_TEACHER_ID},\"anneeScolaire\":\"2025-2026\",\"trimestre\":2,\"ponctualite\":4,\"pedagogie\":5,\"discipline\":4,\"communication\":5,\"implication\":5,\"commentaire\":\"Très bonne évaluation - test\"}" \
    201 "Créer une évaluation"
  NEW_EVAL_ID=$(extract_id "$RESP_BODY")
  call GET "/teacher-evaluations/stats/${EXISTING_TEACHER_ID}" "" 200 "Stats évaluation par enseignant"
fi

if [ -n "${NEW_EVAL_ID:-}" ]; then
  call GET "/teacher-evaluations/${NEW_EVAL_ID}" "" 200 "Détail d'une évaluation"
  call PUT "/teacher-evaluations/${NEW_EVAL_ID}" \
    "{\"teacherId\":${EXISTING_TEACHER_ID},\"anneeScolaire\":\"2025-2026\",\"trimestre\":2,\"ponctualite\":5,\"pedagogie\":5,\"discipline\":5,\"communication\":5,\"implication\":5,\"commentaire\":\"Évaluation revue\"}" \
    200 "Mettre à jour une évaluation"
fi

# ─── 9. CLEANUP (DELETE) — fait en dernier ───────────────────────────────────
echo
echo "${YELLOW}━━━ 9. Nettoyage (DELETE) ━━━${RESET}"
[ -n "${NEW_EVAL_ID:-}" ]        && call DELETE "/teacher-evaluations/${NEW_EVAL_ID}"     "" 200 "Supprimer évaluation"
[ -n "${NEW_FORMATION_ID:-}" ]   && call DELETE "/rh/formations/${NEW_FORMATION_ID}"      "" 200 "Supprimer formation"
[ -n "${NEW_PAIE_ID:-}" ]        && call DELETE "/rh/paie/${NEW_PAIE_ID}"                 "" 200 "Supprimer fiche de paie"
[ -n "${NEW_POINTAGE_ID:-}" ]    && call DELETE "/rh/pointage/${NEW_POINTAGE_ID}"         "" 200 "Supprimer pointage"
[ -n "${NEW_CONGE_ID:-}" ]       && call DELETE "/rh/conges/${NEW_CONGE_ID}"              "" 200 "Supprimer congé"
[ -n "${NEW_CONTRAT_ID:-}" ]     && call DELETE "/rh/contrats/${NEW_CONTRAT_ID}"          "" 200 "Supprimer contrat"
[ -n "${NEW_TEACHER_ID:-}" ]     && call DELETE "/teachers/${NEW_TEACHER_ID}"             "" 200 "Supprimer enseignant"

# ─── Résumé ──────────────────────────────────────────────────────────────────
echo
echo "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
printf "Tests: %d  ${GREEN}✓ %d${RESET}  ${RED}✗ %d${RESET}\n" "$TOTAL" "$PASS" "$FAIL"
echo "Rapport : ${REPORT}"
echo "Réponses : ${OUT_DIR}/"
echo "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

{
  echo "## Synthèse"
  echo
  echo "| Total | ✓ Pass | ✗ Fail |"
  echo "|------:|------:|------:|"
  echo "| ${TOTAL} | ${PASS} | ${FAIL} |"
  echo
  if [ "${#FAILED_CASES[@]}" -gt 0 ]; then
    echo "### Cas en échec"
    for c in "${FAILED_CASES[@]}"; do echo "- ${c}"; done
  fi
} >> "$REPORT"

[ "$FAIL" -gt 0 ] && exit 1 || exit 0
