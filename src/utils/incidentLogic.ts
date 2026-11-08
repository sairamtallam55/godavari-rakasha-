/**
 * Core business logic and pure validation functions for Godavari Raksha
 * Emergency Detection, Public Safety and Response Coordination Platform
 */

export type IncidentCategory =
  | 'Medical emergency'
  | 'Missing person'
  | 'Crowd congestion'
  | 'Fire emergency'
  | 'Accident'
  | 'Public safety threat'
  | 'Lost child'
  | 'Other emergency';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type IncidentStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Verified'
  | 'Assigned'
  | 'Response in Progress'
  | 'Resolved'
  | 'Rejected';

export type UserRole = 'public' | 'responder' | 'admin';

export interface IncidentClassificationResult {
  category: IncidentCategory;
  priority: PriorityLevel;
  summary: string;
  safetyConcerns: string[];
  recommendedTeam: string;
  isFallback: boolean;
}

/**
 * Deterministic keyword-based AI fallback classifier
 */
export function classifyIncidentDeterministic(
  description: string,
  userSelectedCategory?: string
): IncidentClassificationResult {
  const text = (description || '').toLowerCase();

  let category: IncidentCategory = 'Other emergency';
  let priority: PriorityLevel = 'Medium';
  let recommendedTeam = 'Police & Crowd Control';
  const safetyConcerns: string[] = [];

  // 1. Category Detection
  if (
    text.includes('child') ||
    text.includes('kid') ||
    text.includes('baba') ||
    text.includes('papa') ||
    text.includes('lost boy') ||
    text.includes('lost girl')
  ) {
    category = 'Lost child';
    priority = 'High';
    recommendedTeam = 'Lost & Found Unit';
    safetyConcerns.push('Vulnerable minor separated from guardian');
    safetyConcerns.push('Risk of wandering near deep water ghats');
  } else if (
    text.includes('missing') ||
    text.includes('lost') ||
    text.includes('cannot find') ||
    text.includes('separated') ||
    text.includes('elderly missing')
  ) {
    category = 'Missing person';
    priority = 'High';
    recommendedTeam = 'Lost & Found Unit';
    safetyConcerns.push('Pilgrim separated in high crowd density');
  } else if (
    text.includes('heart') ||
    text.includes('breathing') ||
    text.includes('unconscious') ||
    text.includes('fainted') ||
    text.includes('seizure') ||
    text.includes('chest pain') ||
    text.includes('stroke') ||
    text.includes('collapse')
  ) {
    category = 'Medical emergency';
    priority = 'Critical';
    recommendedTeam = 'Medical First Responders (108)';
    safetyConcerns.push('Immediate life-threatening medical distress');
    safetyConcerns.push('Crowd access bottleneck for stretcher/ambulance');
  } else if (
    text.includes('drown') ||
    text.includes('river') ||
    text.includes('current') ||
    text.includes('water') ||
    text.includes('boat') ||
    text.includes('swimming') ||
    text.includes('whirlpool')
  ) {
    category = 'Accident';
    priority = 'Critical';
    recommendedTeam = 'River Rescue & SDRF Boat Unit';
    safetyConcerns.push('River current immersion or drowning danger');
    safetyConcerns.push('Requires immediate water rescue equipment');
  } else if (
    text.includes('fire') ||
    text.includes('smoke') ||
    text.includes('cylinder') ||
    text.includes('gas') ||
    text.includes('spark')
  ) {
    category = 'Fire emergency';
    priority = 'Critical';
    recommendedTeam = 'Fire & Disaster Rescue Services';
    safetyConcerns.push('Rapid fire spread in pandals and food stalls');
    safetyConcerns.push('Smoke inhalation and panic-induced stampede');
  } else if (
    text.includes('stampede') ||
    text.includes('barricade') ||
    text.includes('crowd') ||
    text.includes('crush') ||
    text.includes('suffocation') ||
    text.includes('choke point') ||
    text.includes('overcrowded')
  ) {
    category = 'Crowd congestion';
    priority = text.includes('stampede') || text.includes('crush') ? 'Critical' : 'High';
    recommendedTeam = 'Police & Crowd Management Taskforce';
    safetyConcerns.push('Surge pressure against ghat barricades');
    safetyConcerns.push('Narrow entry/exit egress obstruction');
  } else if (
    text.includes('fight') ||
    text.includes('weapon') ||
    text.includes('theft') ||
    text.includes('threat') ||
    text.includes('suspicious')
  ) {
    category = 'Public safety threat';
    priority = 'High';
    recommendedTeam = 'Law Enforcement & Special Strike Team';
    safetyConcerns.push('Breach of public order and pilgrim security');
  } else if (
    text.includes('fall') ||
    text.includes('slip') ||
    text.includes('fracture') ||
    text.includes('bleeding') ||
    text.includes('injury') ||
    text.includes('injured')
  ) {
    category = 'Medical emergency';
    priority = 'High';
    recommendedTeam = 'Medical First Responders (108)';
    safetyConcerns.push('Physical trauma on slippery ghat steps');
  }

  // If user explicitly picked a valid category and our text detection was generic, honor user choice
  if (userSelectedCategory && category === 'Other emergency') {
    category = userSelectedCategory as IncidentCategory;
  }

  const summary = description.length > 120
    ? description.slice(0, 117) + '...'
    : description || 'Emergency report logged via public portal.';

  return {
    category,
    priority,
    summary,
    safetyConcerns: safetyConcerns.length > 0 ? safetyConcerns : ['General public assistance required'],
    recommendedTeam,
    isFallback: true,
  };
}

/**
 * Validates status transitions in the incident lifecycle
 */
export function canTransitionStatus(
  currentStatus: IncidentStatus,
  targetStatus: IncidentStatus,
  role: UserRole
): { allowed: boolean; reason?: string } {
  if (role === 'public') {
    return { allowed: false, reason: 'Public users cannot modify incident status directly.' };
  }

  // Admin can perform all valid forward and corrective transitions
  if (role === 'admin') {
    const validTransitions: Record<IncidentStatus, IncidentStatus[]> = {
      'Submitted': ['Under Review', 'Verified', 'Rejected'],
      'Under Review': ['Verified', 'Rejected', 'Submitted'],
      'Verified': ['Assigned', 'Response in Progress', 'Rejected'],
      'Assigned': ['Response in Progress', 'Resolved', 'Verified'],
      'Response in Progress': ['Resolved', 'Assigned'],
      'Resolved': ['Response in Progress'], // allow reopen if needed
      'Rejected': ['Under Review'], // allow reconsideration
    };

    const allowedTargets = validTransitions[currentStatus] || [];
    if (allowedTargets.includes(targetStatus)) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: `Invalid transition from ${currentStatus} to ${targetStatus}.`,
    };
  }

  // Responder can update status for assigned incidents
  if (role === 'responder') {
    if (currentStatus === 'Assigned' && targetStatus === 'Response in Progress') {
      return { allowed: true };
    }
    if (currentStatus === 'Response in Progress' && targetStatus === 'Resolved') {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: `Responders may only advance assigned incidents to 'Response in Progress' or 'Resolved'.`,
    };
  }

  return { allowed: false, reason: 'Unauthorized role' };
}

/**
 * Computes crowd safety level based on reported density or count
 */
export function calculateCrowdSafetyStatus(
  occupancyPercent: number
): { status: 'Normal' | 'Moderate' | 'Heavy' | 'Critical'; alertColor: string; advisory: string } {
  if (occupancyPercent >= 90) {
    return {
      status: 'Critical',
      alertColor: 'text-red-700 bg-red-100 border-red-300',
      advisory: 'CRITICAL OVERCROWDING: Immediate entry diversion and holding area activation required.',
    };
  }
  if (occupancyPercent >= 75) {
    return {
      status: 'Heavy',
      alertColor: 'text-amber-700 bg-amber-100 border-amber-300',
      advisory: 'HEAVY CONGESTION: Restrict incoming queues; urge pilgrims to alternative ghats.',
    };
  }
  if (occupancyPercent >= 50) {
    return {
      status: 'Moderate',
      alertColor: 'text-yellow-700 bg-yellow-100 border-yellow-300',
      advisory: 'MODERATE DENSITY: Steady pilgrim flow; monitors deployed at main steps.',
    };
  }
  return {
    status: 'Normal',
    alertColor: 'text-emerald-700 bg-emerald-100 border-emerald-300',
    advisory: 'NORMAL FLOW: Ghat operating well within safe visitor thresholds.',
  };
}

/**
 * Unique ID generator for Godavari Pushkaralu incidents and cases
 */
export function generateIncidentId(prefix = 'INC-2027'): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomSuffix}`;
}
