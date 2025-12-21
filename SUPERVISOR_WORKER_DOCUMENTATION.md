# Documentation Complète: Supervisor & Worker Dashboards

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Supervisor Dashboard](#supervisor-dashboard)
3. [Worker Dashboard](#worker-dashboard)
4. [Services & APIs](#services--apis)
5. [Business Rules](#business-rules)
6. [Workflow Complet](#workflow-complet)

---

## Vue d'ensemble

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SUPERVISOR                                │
│  Gère les assignations, surveille les workers, callbacks        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Assigne / Réassigne
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         WORKERS                                  │
│  Prennent les assignations, complètent les tâches               │
└─────────────────────────────────────────────────────────────────┘
```

### Fichiers Principaux

| Dashboard | Fichier | Lignes |
|-----------|---------|--------|
| Supervisor | `pages/dashboard/supervisor/index.vue` | ~1,679 |
| Worker | `pages/dashboard/worker/index.vue` | ~909 |

### Components Worker

| Component | Fichier | Description |
|-----------|---------|-------------|
| AvailableOrdersPanel | `components/worker/AvailableOrdersPanel.vue` | Self-assignment d'ordres disponibles |
| ConfirmationPanel | `components/worker/ConfirmationPanel.vue` | Gestion des confirmations |
| SuiviPanel | `components/worker/SuiviPanel.vue` | Suivi des livraisons |
| QualityPanel | `components/worker/QualityPanel.vue` | Contrôle qualité |
| CallbacksPanel | `components/worker/CallbacksPanel.vue` | Gestion des rappels |
| CallbackModal | `components/worker/CallbackModal.vue` | Modal pour programmer un rappel |
| CompleteSuiviModal | `components/worker/CompleteSuiviModal.vue` | Modal completion bulk suivi |
| QualityCheckForm | `components/worker/QualityCheckForm.vue` | Formulaire contrôle qualité |
| StatCard | `components/worker/StatCard.vue` | Carte statistiques |

### Components Supervisor

| Component | Fichier | Description |
|-----------|---------|-------------|
| WorkerConfigModal | `components/supervisor/WorkerConfigModal.vue` | Configuration des workers |

---

## Supervisor Dashboard

**URL:** `http://localhost:3000/dashboard/supervisor`

### Tabs Disponibles

```
┌──────────────┬─────────────────┬──────────────┬────────────┬────────────┐
│ Nouvelles    │ Confirmations   │ Qualité*     │ Suivi      │ Rappels    │
│ commandes    │ en cours        │              │            │            │
└──────────────┴─────────────────┴──────────────┴────────────┴────────────┘
* Qualité visible seulement si enableQualityCheck = true
```

### 1. Tab "Nouvelles commandes"

**Endpoint:** `GET /api/v1/orders/new-orders`

**Colonnes affichées:**
- Checkbox (sélection)
- Code commande
- Client (nom + téléphone)
- Ville
- Produits
- Prix total
- Source
- Magasin
- Âge (depuis création)
- Actions

**Fonctionnalités:**
- ✅ Sélection multiple avec "Tout sélectionner"
- ✅ Indicateur client blacklisté (icône rouge)
- ✅ Click-to-call sur numéro
- ✅ Assignation unique via bouton
- ✅ Assignation bulk via bouton en haut
- ✅ Pagination (100 par page)

**Boutons d'action:**
```vue
<!-- Par commande -->
<button @click="openAssignModal(order)">
  <UserGroupIcon /> Assigner
</button>

<!-- Bulk (sélection multiple) -->
<button @click="openBulkAssignModal()">
  Assigner {{ selectedCount }} commande(s)
</button>
```

### 2. Tab "Confirmations"

**Endpoint:** `GET /api/v1/orders/confirmation-orders`

**Filtres disponibles:**
- Tous
- Non assignés (`unassigned`)
- En attente (`pending`)
- Pris (`taken`)

**Colonnes affichées:**
- Checkbox
- Code commande
- Client
- Téléphone
- Ville
- Prix
- Type de service (badge)
- Statut assignation
- Agent assigné
- Durée
- Actions

**Code couleur durée:**
```typescript
const getDurationColor = (minutes: number) => {
  if (minutes < 15) return 'text-green-600'  // < 15 min
  if (minutes < 30) return 'text-orange-500' // 15-30 min
  return 'text-red-600'                       // > 30 min
}
```

### 3. Tab "Qualité" (Conditionnel)

**Visible si:** `autoAssignmentSettings.enableQualityCheck === true`

**Endpoint:** `GET /api/v1/orders/quality-orders`

**Structure:** Identique au tab Confirmations

### 4. Tab "Suivi"

**Endpoint:** `GET /api/v1/orders/suivi-orders`

**Filtres:**
- Tous
- En attente (`pending`)
- Pris (`taken`)

**Actions disponibles:**
- Réassigner à un autre worker
- Bulk réassignation

### 5. Tab "Rappels"

**Endpoint:** `GET /api/v1/orderassignments/all-callbacks`

**Filtres:**
```typescript
const callbackFilters = [
  { value: 'all', label: 'Tous' },
  { value: 'overdue', label: 'En retard' },
  { value: 'today', label: "Aujourd'hui" },
  { value: 'upcoming', label: 'À venir' }
]
```

**Indicateurs visuels:**
- 🔴 Rouge: Callback en retard (overdue)
- Badge "En retard" pour callbacks passés
- Compteur de tentatives (Tentative #1, #2, etc.)

### Modal d'Assignation

**Deux modes:**

#### Mode Chaîne (Chain Mode)
```
┌─────────────────────────────────────────┐
│ Mode: ○ Chaîne  ○ Individuel            │
├─────────────────────────────────────────┤
│ Agent: [Dropdown Worker]                │
├─────────────────────────────────────────┤
│ Services:                               │
│ ☑ Confirmation                          │
│ ☑ Qualité (si activé)                   │
│ ☑ Suivi                                 │
├─────────────────────────────────────────┤
│ Notes: [________________]               │
├─────────────────────────────────────────┤
│ [Annuler]              [Assigner]       │
└─────────────────────────────────────────┘
```
- Un seul worker pour tous les services
- Workflow rapide pour bulk assignment

#### Mode Individuel (Individual Mode)
```
┌─────────────────────────────────────────┐
│ Mode: ○ Chaîne  ● Individuel            │
├─────────────────────────────────────────┤
│ Confirmation: [Worker A ▼]              │
│ Qualité:      [Worker B ▼]              │
│ Suivi:        [Worker C ▼]              │
├─────────────────────────────────────────┤
│ [Annuler]              [Assigner]       │
└─────────────────────────────────────────┘
```
- Différents workers par service
- Contrôle granulaire

### Gestion de l'équipe

**Sidebar droite** (si implémenté):
- Liste des workers configurés
- Statut en ligne/hors ligne
- Charge actuelle vs capacité max
- Bouton "Configurer" pour chaque worker

---

## Worker Dashboard

**URL:** `http://localhost:3000/dashboard/worker`

### Header

```
┌─────────────────────────────────────────────────────────────────┐
│ Dashboard Worker                                                │
│                                                                 │
│ [● En ligne]  [🔄 Actualiser]   Ma charge: 3/5                  │
└─────────────────────────────────────────────────────────────────┘
```

**Bouton Online/Offline:**
```typescript
const toggleOnline = async () => {
  await workerConfigService.setOnline(myConfig.id, {
    isOnline: !myConfig.isOnline
  })
}
```

### Tabs Dynamiques

Les tabs sont générés selon la configuration du worker:

```typescript
const visibleTabs = computed(() => {
  const tabs = []

  // Self-assign permission
  if (hasPermission('Permissions.OrderAssignments.SelfAssign')) {
    tabs.push({ id: 'available', label: 'Disponibles' })
  }

  // Confirmation
  if (myConfig.canDoConfirmation) {
    tabs.push({ id: 'confirmation', label: 'Confirmation' })
  }

  // Quality (si activé globalement ET worker peut faire)
  if (settings.enableQualityCheck && myConfig.canDoQuality) {
    tabs.push({ id: 'quality', label: 'Qualité' })
  }

  // Suivi
  if (myConfig.canDoSuivi) {
    tabs.push({ id: 'suivi', label: 'Suivi' })
  }

  // Callbacks
  if (myConfig.canDoCallback) {
    tabs.push({ id: 'callbacks', label: 'Rappels' })
  }

  return tabs
})
```

### 1. Panel "Commandes Disponibles"

**Permission requise:** `Permissions.OrderAssignments.SelfAssign`

**Endpoint:** `GET /api/v1/orders/available-for-grabbing`

```
┌─────────────────────────────────────────┐
│ 📦 Commandes Disponibles (12)           │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ CMD-ABC123                          │ │
│ │ Ahmed Bouzid • 0612345678           │ │
│ │ Casablanca • 250 MAD                │ │
│ │ T-shirt noir x2                     │ │
│ │ Il y a 5 minutes                    │ │
│ │ [📞 Appeler]  [✋ Prendre]          │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ...                                 │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Workflow "Prendre":**
1. Click "Prendre"
2. `POST /api/v1/orderassignments/self-assign` avec serviceType: 'confirmation'
3. Assignation créée + prise automatiquement
4. Commande apparaît dans "Confirmation > Active"

**Gestion erreurs:**
- 409: "Cette commande a déjà été prise par un autre agent"
- 400: "Vous avez atteint votre capacité maximale"

### 2. Panel "Confirmation"

**Layout deux colonnes:**

```
┌─────────────────────────┬─────────────────────────┐
│ 📋 En attente (3)       │ 🔵 En cours (2)         │
├─────────────────────────┼─────────────────────────┤
│ ┌───────────────────┐   │ ┌───────────────────┐   │
│ │ CMD-XYZ789        │   │ │ CMD-DEF456        │   │
│ │ Fatima Alami      │   │ │ Omar Hassan       │   │
│ │ 0698765432        │   │ │ 0654321098        │   │
│ │ Rabat • 180 MAD   │   │ │ Fès • 320 MAD     │   │
│ │ [Prendre]         │   │ │ [📞][💬][📅][↩️] │   │
│ └───────────────────┘   │ │ [✓ Confirmer]     │   │
│                         │ │ [✗ Annuler]       │   │
│                         │ └───────────────────┘   │
└─────────────────────────┴─────────────────────────┘
```

**Colonne gauche - En attente:**
- Assignations avec `status: 'pending'`
- Bouton "Prendre" → `POST /api/v1/orderassignments/{id}/take`

**Colonne droite - En cours:**
- Assignations avec `status: 'taken'`
- Actions de communication:
  - 📞 Appeler (tel:)
  - 💬 WhatsApp
  - 📅 Programmer rappel
  - ↩️ Libérer (release)
- Actions principales:
  - ✅ Confirmer → Modal confirmation
  - ❌ Annuler → Modal annulation

### 3. Panel "Suivi"

**Layout deux colonnes avec bulk actions:**

```
┌─────────────────────────┬─────────────────────────┐
│ 📋 À suivre (5)         │ 🔵 Suivi actif (3)      │
├─────────────────────────┼─────────────────────────┤
│ Badge: "Nouvelle" ou    │ ☑ Tout sélectionner     │
│ "Tentative #2"          │                         │
│                         │ [✓ Livrées] [↩ Retours] │
│                         │ [🚚 Assigner livraison] │
│ [Prendre]               │                         │
│                         │ ☐ CMD-001 • 200 MAD     │
│                         │ ☑ CMD-002 • 350 MAD     │
│                         │ ☑ CMD-003 • 150 MAD     │
└─────────────────────────┴─────────────────────────┘
```

**Bulk Actions:**
```typescript
// Marquer comme livrées
const handleBulkDelivered = async () => {
  const result = await bulkCompleteSuivi({
    assignmentIds: selectedIds,
    result: 'delivered',
    trackingStateId: deliveredStateId
  })
  // Affiche: "5 commandes livrées - COD collecté: 1,250 MAD"
}

// Marquer comme retournées
const handleBulkReturned = async () => {
  const result = await bulkCompleteSuivi({
    assignmentIds: selectedIds,
    result: 'returned',
    trackingStateId: returnedStateId
  })
}

// Assigner société de livraison
const handleBulkAssignDelivery = () => {
  showDeliveryModal.value = true
}
```

### 4. Panel "Qualité"

**Layout:**

```
┌─────────────────────────┬─────────────────────────┐
│ 📋 À vérifier (2)       │ 🔍 Vérification         │
├─────────────────────────┼─────────────────────────┤
│ ┌───────────────────┐   │ CMD-QUA123              │
│ │ CMD-QUA456        │   │ Client: Ahmed           │
│ │ Salma Idrissi     │   │                         │
│ │ [Prendre]         │   │ ☑ Emballage OK (10pts) │
│ └───────────────────┘   │ ☑ Produit OK (10pts)   │
│                         │ ☐ Étiquette OK (5pts)  │
│                         │                         │
│                         │ Score: 20/25 (80%)      │
│                         │                         │
│                         │ [✓ Approuver]           │
│                         │ [✗ Rejeter]             │
└─────────────────────────┴─────────────────────────┘
```

**Logique d'approbation:**
```typescript
const canApprove = computed(() => {
  const score = calculateScore()
  const threshold = settings.qualityThreshold || 80
  return (score / maxScore * 100) >= threshold
})
```

### 5. Panel "Rappels"

**Layout avec filtres:**

```
┌─────────────────────────────────────────────────────┐
│ [Tous] [En retard] [Aujourd'hui] [À venir]          │
├─────────────────────────────────────────────────────┤
│ CONFIRMATION                │ SUIVI                 │
├─────────────────────────────┼───────────────────────┤
│ 🔴 CMD-CB001               │ ☐ CMD-SV001           │
│ En retard - 14:30          │ 16:00                 │
│ Tentative #2               │ Tentative #1          │
│ [📞][✓][✗][📅]            │ [📞][✓]               │
│                            │                       │
│                            │ ☑ Tout sélectionner   │
│                            │ [🚚 Livraison] [✓]    │
└─────────────────────────────┴───────────────────────┘
```

**Filtrage:**
```typescript
const filteredCallbacks = computed(() => {
  const now = new Date()
  return callbacks.filter(cb => {
    const scheduled = new Date(cb.callbackScheduledAt)
    switch (filter.value) {
      case 'overdue': return scheduled < now
      case 'today': return isToday(scheduled)
      case 'upcoming': return scheduled > now && !isToday(scheduled)
      default: return true
    }
  })
})
```

---

## Services & APIs

### Services Utilisés

```typescript
// Services principaux
import { useOrderAssignmentsService } from '~/services'
import { useWorkerServiceConfigsService } from '~/services'
import { useAutoAssignmentSettingsService } from '~/services'
import { useOrdersWorkflowService } from '~/services'
import { useUsersService } from '~/services'
import { useDeliveryCompaniesService } from '~/services'
import { useReasonsService } from '~/services'
```

### API Endpoints - Order Assignments

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/orderassignments/assign` | Assigner une commande |
| POST | `/orderassignments/bulk-assign` | Assigner plusieurs commandes |
| POST | `/orderassignments/bulk-reassign` | Réassigner plusieurs commandes |
| POST | `/orderassignments/self-assign` | Auto-assignation worker |
| POST | `/orderassignments/{id}/take` | Prendre une assignation |
| POST | `/orderassignments/{id}/complete` | Compléter (confirmation) |
| POST | `/orderassignments/{id}/complete-suivi` | Compléter (suivi) |
| POST | `/orderassignments/{id}/complete-quality` | Compléter (qualité) |
| POST | `/orderassignments/{id}/release` | Libérer une assignation |
| POST | `/orderassignments/{id}/schedule-callback` | Programmer un rappel |
| POST | `/orderassignments/bulk-complete-suivi` | Bulk completion suivi |
| GET | `/orderassignments/my-pending` | Mes assignations en attente |
| GET | `/orderassignments/my-active` | Mes assignations actives |
| GET | `/orderassignments/my-callbacks` | Mes rappels |
| GET | `/orderassignments/all-callbacks` | Tous les rappels (supervisor) |
| GET | `/orderassignments/workers-stats` | Stats workers |

### API Endpoints - Orders Workflow

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/orders/new-orders` | Nouvelles commandes |
| GET | `/orders/confirmation-orders` | Commandes en confirmation |
| GET | `/orders/quality-orders` | Commandes en qualité |
| GET | `/orders/suivi-orders` | Commandes en suivi |
| GET | `/orders/available-for-grabbing` | Commandes disponibles |
| POST | `/orders/{id}/confirm` | Confirmer commande |
| POST | `/orders/{id}/cancel` | Annuler commande |
| POST | `/orders/{id}/assign-delivery` | Assigner société livraison |

### API Endpoints - Worker Config

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/workerserviceconfigs` | Toutes les configs |
| GET | `/workerserviceconfigs/my-config` | Ma config |
| POST | `/workerserviceconfigs` | Créer config |
| PUT | `/workerserviceconfigs/{id}` | Modifier config |
| POST | `/workerserviceconfigs/{id}/set-online` | Toggle online |

---

## Business Rules

### Règles d'Assignation

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CHAÎNE DE SERVICES                                       │
│    Confirmation → (Qualité) → Suivi                         │
│                                                             │
│ 2. CAPACITÉ MAXIMALE                                        │
│    Worker ne peut pas dépasser maxConcurrentAssignments     │
│                                                             │
│ 3. RÉASSIGNATION                                            │
│    Actions bloquées sur assignations réassignées (409)      │
│                                                             │
│ 4. QUALITÉ OPTIONNELLE                                      │
│    Tab visible seulement si enableQualityCheck = true       │
│                                                             │
│ 5. CALLBACKS                                                │
│    Peuvent être programmés sur confirmation ou suivi        │
│    Compteur de tentatives incrémenté à chaque rappel        │
└─────────────────────────────────────────────────────────────┘
```

### Cycle de vie d'une Assignation

```
                    ┌─────────────┐
                    │   CREATED   │
                    │ (Supervisor │
                    │  assigne)   │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   PENDING   │
                    │ (En attente │
                    │  du worker) │
                    └──────┬──────┘
                           │ Worker clique "Prendre"
                           ▼
                    ┌─────────────┐
                    │    TAKEN    │
                    │ (Worker     │
                    │  travaille) │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │COMPLETED │ │CALLBACK  │ │ RELEASED │
       │(Terminé) │ │(Rappel   │ │(Libéré)  │
       │          │ │programmé)│ │          │
       └──────────┘ └──────────┘ └──────────┘
```

### Règles de Modification des Commandes

| Action | Phase New | Phase Confirmation | Phase Shipping |
|--------|-----------|-------------------|----------------|
| Modifier commande | ✅ | ✅ (si pas confirmé) | ❌ |
| Modifier articles | ✅ | ❌ | ❌ |
| Ajouter articles | ✅ | ❌ | ❌ |
| Supprimer articles | ✅ | ❌ | ❌ |

### Configuration Worker

```typescript
interface WorkerServiceConfig {
  id: string
  userId: string
  userName: string

  // Capacités
  canDoConfirmation: boolean
  canDoSuivi: boolean
  canDoQuality: boolean
  canDoCallback: boolean

  // Limites
  maxConcurrentAssignments: number
  currentAssignmentCount: number

  // Auto-assignation
  autoAssignPriority: number  // 1 = haute, 1000 = basse
  isOnline: boolean
}
```

---

## Workflow Complet

### Scénario: Nouvelle commande jusqu'à livraison

```
1. CLIENT passe commande sur le site
   │
   ▼
2. Commande apparaît dans "Nouvelles commandes" (Supervisor)
   │
   ▼
3. SUPERVISOR assigne à Worker A (Confirmation + Suivi)
   │
   ▼
4. WORKER A voit l'assignation dans "En attente"
   │
   ▼
5. WORKER A clique "Prendre" → Assignation passe en "En cours"
   │
   ▼
6. WORKER A appelle le client
   │
   ├─── Client répond OUI ──────────────────────────┐
   │                                                 │
   │    WORKER A clique "Confirmer"                  │
   │    │                                            │
   │    ▼                                            │
   │    Commande passe en phase "shipping"           │
   │    │                                            │
   │    ▼                                            │
   │    Assignation Suivi créée automatiquement      │
   │    │                                            │
   │    ▼                                            │
   │    WORKER A voit la commande dans "Suivi"       │
   │    │                                            │
   │    ▼                                            │
   │    WORKER A assigne société de livraison        │
   │    │                                            │
   │    ▼                                            │
   │    Livraison effectuée                          │
   │    │                                            │
   │    ▼                                            │
   │    WORKER A clique "Livré" ─────────────────────┤
   │                                                 │
   │                                                 ▼
   │                                          FIN ✓ (Commande livrée)
   │
   ├─── Client ne répond pas ──────────────────────┐
   │                                                │
   │    WORKER A programme un rappel                │
   │    │                                           │
   │    ▼                                           │
   │    Rappel apparaît dans "Rappels"              │
   │    │                                           │
   │    ▼                                           │
   │    À l'heure du rappel, WORKER A rappelle      │
   │    │                                           │
   │    └─── Retour au choix (répond/ne répond pas) │
   │
   └─── Client annule ─────────────────────────────┐
                                                    │
        WORKER A clique "Annuler" + raison          │
        │                                           │
        ▼                                           │
        FIN ✗ (Commande annulée)                    │
```

### Scénario avec Qualité

```
Si enableQualityCheck = true:

Confirmation terminée
   │
   ▼
Commande passe en phase "quality"
   │
   ▼
WORKER QUALITÉ prend l'assignation
   │
   ▼
Remplit le formulaire qualité
   │
   ├─── Score >= seuil → Approuvé → Passe en Suivi
   │
   └─── Score < seuil → Rejeté → Traitement spécial
```

---

## Traductions i18n

### Clés principales (fr.json)

```json
{
  "supervisor": {
    "title": "Tableau de bord Superviseur",
    "subtitle": "Gérer les agents et les assignations de commandes",
    "newOrders": "Nouvelles commandes",
    "pendingConfirmations": "Confirmations en attente",
    "qualityOrders": "Contrôle Qualité",
    "suiviOrders": "Suivi en cours",
    "callbacks": "Rappels",
    "assign": "Assigner",
    "reassign": "Réassigner",
    "chainMode": "Chaîne",
    "individualMode": "Individuel",
    "confirmation": "Confirmation",
    "quality": "Qualité",
    "suivi": "Suivi"
  },
  "worker": {
    "title": "Tableau de bord Agent",
    "online": "En ligne",
    "offline": "Hors ligne",
    "availableOrders": "Commandes disponibles",
    "grabOrder": "Prendre cette commande",
    "myCapacity": "Ma charge",
    "pending": "En attente",
    "active": "En cours",
    "inProgress": "En cours"
  }
}
```

---

## Notes de Performance

### Caching Vue Query

```typescript
// Configuration recommandée
{
  staleTime: 10 * 1000,      // 10 secondes
  gcTime: 5 * 60 * 1000,     // 5 minutes
  refetchInterval: 30 * 1000, // Auto-refresh 30s
  refetchOnWindowFocus: true
}
```

### Invalidation automatique

Les mutations invalident automatiquement les queries associées:
- `assign()` → invalide toutes les queries d'assignation
- `take()` → invalide pending/active
- `complete()` → invalide assignments + stats
- `scheduleCallback()` → invalide callbacks

---

## Permissions Requises

| Action | Permission |
|--------|------------|
| Voir Supervisor | `Permissions.OrderAssignments.View` |
| Assigner | `Permissions.OrderAssignments.Create` |
| Réassigner | `Permissions.OrderAssignments.Update` |
| Self-assign | `Permissions.OrderAssignments.SelfAssign` |
| Modifier commande | `Permissions.Orders.Update` |
| Confirmer | `Permissions.Orders.Confirm` |
| Annuler | `Permissions.Orders.Cancel` |

---

*Documentation générée le 20/12/2024*
