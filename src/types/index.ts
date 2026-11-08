import { IncidentCategory, PriorityLevel, IncidentStatus, UserRole } from '../utils/incidentLogic';

export type { IncidentCategory, PriorityLevel, IncidentStatus, UserRole };

export interface Incident {
  incidentId: string;
  category: IncidentCategory;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  priority: PriorityLevel;
  verifiedPriority?: PriorityLevel;
  status: IncidentStatus;
  aiSuggestion?: {
    category: IncidentCategory;
    priority: PriorityLevel;
    summary: string;
    safetyConcerns: string[];
    recommendedTeam: string;
    isFallback: boolean;
  };
  reporterName?: string;
  reporterPhone?: string;
  assignedTeamId?: string;
  assignedTeamName?: string;
  operatorNotes?: string;
  responderNotes?: string;
  photoUrl?: string;
  isDemoData: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResponseTeam {
  teamId: string;
  teamName: string;
  category: string;
  availability: 'On Duty' | 'Responding' | 'Standby' | 'Off Duty';
  contactNumber: string;
  leadOfficer: string;
  currentIncidentId?: string;
  stationLocation: string;
  activeAssignmentsCount: number;
}

export interface MissingPerson {
  caseId: string;
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  lastSeenLocation: string;
  lastSeenTime: string;
  clothingDescription: string;
  identifyingFeatures?: string;
  reporterName: string;
  reporterPhone: string;
  reporterRelationship: string;
  photoUrl?: string;
  status: 'Active Search' | 'Under Review' | 'Located' | 'Reunited' | 'Closed';
  caseNotes?: string;
  isDemoData: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  announcementId: string;
  category: 'Crowd Advisory' | 'River Safety' | 'Weather Notice' | 'Missing Person Notice' | 'Emergency Instruction';
  title: string;
  message: string;
  priority: 'Urgent' | 'Advisory' | 'General';
  language: 'English' | 'Telugu' | 'Hindi';
  publishedAt: string;
  expiresAt: string;
  active: boolean;
  publishedBy: string;
}

export interface Facility {
  facilityId: string;
  name: string;
  category: 'Hospital' | 'First Aid Post' | 'Police Help Desk' | 'River Rescue Boat' | 'Drinking Water Point' | 'Lost & Found Center';
  address: string;
  latitude: number;
  longitude: number;
  contactNumber: string;
  operatingHours: string;
  capacity?: string;
  verificationStatus: 'Verified Official' | 'Demo Facility';
  isDemoData: boolean;
}

export interface GhatCrowdZone {
  ghatId: string;
  name: string;
  district: string;
  maxCapacity: number;
  currentVisitors: number;
  occupancyPercent: number;
  status: 'Normal' | 'Moderate' | 'Heavy' | 'Critical';
  waterFlowStatus: 'Safe' | 'Moderate Currents' | 'Fast Current - Alert';
  holdingAreaActive: boolean;
  estimatedWaitMinutes: number;
  lastUpdated: string;
  latitude: number;
  longitude: number;
}

export interface IncidentAuditLog {
  logId: string;
  incidentId: string;
  action: string;
  performedBy: string;
  role: string;
  timestamp: string;
  notes?: string;
}
