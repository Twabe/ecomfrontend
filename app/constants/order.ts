/**
 * Order workflow constants - matching backend Domain constants.
 * These mirror the C# static classes in src/Core/Domain/Catalog/
 */

/**
 * Order Phase - WHERE the order is in the workflow.
 * Phase transitions: new → confirmation → shipping
 */
export const OrderPhase = {
  /** Order just created, awaiting assignment */
  New: 'new',
  /** Order being confirmed by agent */
  Confirmation: 'confirmation',
  /** Order confirmed, in delivery process */
  Shipping: 'shipping',
} as const

export type OrderPhaseType = (typeof OrderPhase)[keyof typeof OrderPhase]

export const OrderPhaseLabels: Record<OrderPhaseType, string> = {
  [OrderPhase.New]: 'Nouvelle',
  [OrderPhase.Confirmation]: 'Confirmation',
  [OrderPhase.Shipping]: 'Livraison',
}

/**
 * Order State - WHAT happened to the order.
 * Represents the current status/outcome.
 */
export const OrderState = {
  /** Initial state */
  New: 'new',
  /** Customer confirmed the order */
  Confirmed: 'confirmed',
  /** Order was cancelled */
  Cancelled: 'cancelled',
  /** Scheduled for callback */
  Callback: 'callback',
  /** Successfully delivered */
  Delivered: 'delivered',
  /** Order returned */
  Returned: 'returned',
} as const

export type OrderStateType = (typeof OrderState)[keyof typeof OrderState]

export const OrderStateLabels: Record<OrderStateType, string> = {
  [OrderState.New]: 'Nouveau',
  [OrderState.Confirmed]: 'Confirmé',
  [OrderState.Cancelled]: 'Annulé',
  [OrderState.Callback]: 'Rappel',
  [OrderState.Delivered]: 'Livré',
  [OrderState.Returned]: 'Retourné',
}

/** Terminal states - order workflow is complete */
export const TerminalStates: readonly string[] = [
  OrderState.Delivered,
  OrderState.Returned,
  OrderState.Cancelled,
  'canceled', // Legacy spelling
]

export const isTerminalState = (state: string | null | undefined): boolean =>
  TerminalStates.includes(state || '')

/**
 * Service Types - types of worker assignments.
 */
export const ServiceTypes = {
  /** Initial order confirmation */
  Confirmation: 'confirmation',
  /** Follow-up/delivery tracking */
  Suivi: 'suivi',
  /** Quality check before shipping */
  Quality: 'quality',
  /** Scheduled callback */
  Callback: 'callback',
} as const

export type ServiceType = (typeof ServiceTypes)[keyof typeof ServiceTypes]

export const ServiceTypeLabels: Record<ServiceType, string> = {
  [ServiceTypes.Confirmation]: 'Confirmation',
  [ServiceTypes.Suivi]: 'Suivi',
  [ServiceTypes.Quality]: 'Qualité',
  [ServiceTypes.Callback]: 'Rappel',
}

/**
 * Assignment Status - lifecycle of worker assignments.
 */
export const AssignmentStatus = {
  /** Assigned but not yet taken */
  Pending: 'pending',
  /** Worker accepted and working */
  Taken: 'taken',
  /** Work completed */
  Completed: 'completed',
  /** Worker released the assignment */
  Released: 'released',
  /** Reassigned to another worker */
  Reassigned: 'reassigned',
  /** Assignment timed out */
  Expired: 'expired',
} as const

export type AssignmentStatusType = (typeof AssignmentStatus)[keyof typeof AssignmentStatus]

export const AssignmentStatusLabels: Record<AssignmentStatusType, string> = {
  [AssignmentStatus.Pending]: 'En attente',
  [AssignmentStatus.Taken]: 'En cours',
  [AssignmentStatus.Completed]: 'Terminé',
  [AssignmentStatus.Released]: 'Libéré',
  [AssignmentStatus.Reassigned]: 'Réassigné',
  [AssignmentStatus.Expired]: 'Expiré',
}

/** Active statuses - assignment is still being worked on */
export const ActiveAssignmentStatuses: readonly string[] = [
  AssignmentStatus.Pending,
  AssignmentStatus.Taken,
]

export const isActiveAssignment = (status: string | null | undefined): boolean =>
  ActiveAssignmentStatuses.includes(status || '')

/**
 * Suivi Result - outcome of suivi (follow-up) assignments.
 */
export const SuiviResult = {
  /** Order successfully delivered */
  Delivered: 'delivered',
  /** Order returned */
  Returned: 'returned',
  /** Delivery in progress */
  InProgress: 'in_progress',
  /** No response from customer */
  NoResponse: 'no_response',
  /** Customer refused delivery */
  Refused: 'refused',
  /** Delivery postponed */
  Postponed: 'postponed',
} as const

export type SuiviResultType = (typeof SuiviResult)[keyof typeof SuiviResult]

export const SuiviResultLabels: Record<SuiviResultType, string> = {
  [SuiviResult.Delivered]: 'Livré',
  [SuiviResult.Returned]: 'Retourné',
  [SuiviResult.InProgress]: 'En cours',
  [SuiviResult.NoResponse]: 'Pas de réponse',
  [SuiviResult.Refused]: 'Refusé',
  [SuiviResult.Postponed]: 'Reporté',
}
