import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Incident,
  ResponseTeam,
  Facility,
  Announcement,
  MissingPerson,
  GhatCrowdZone,
  UserRole,
  IncidentStatus,
  PriorityLevel,
} from '../types';
import { Language, translations } from '../utils/translations';

interface ToastInfo {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['English'];
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeResponderTeamId: string;
  setActiveResponderTeamId: (teamId: string) => void;
  incidents: Incident[];
  responseTeams: ResponseTeam[];
  facilities: Facility[];
  announcements: Announcement[];
  missingPersons: MissingPerson[];
  ghatCrowdZones: GhatCrowdZone[];
  isLoading: boolean;
  toast: ToastInfo | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  aiAssistantOpen: boolean;
  setAiAssistantOpen: (open: boolean) => void;
  refreshData: () => Promise<void>;
  resetDemoData: () => Promise<void>;
  submitEmergencyReport: (report: {
    category: string;
    description: string;
    location: string;
    latitude?: number;
    longitude?: number;
    reporterName?: string;
    reporterPhone?: string;
    photoUrl?: string;
  }) => Promise<Incident>;
  updateIncident: (
    incidentId: string,
    updates: {
      status?: IncidentStatus;
      verifiedPriority?: PriorityLevel;
      assignedTeamId?: string;
      assignedTeamName?: string;
      operatorNotes?: string;
      responderNotes?: string;
    }
  ) => Promise<boolean>;
  submitMissingPersonReport: (data: {
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
  }) => Promise<MissingPerson>;
  updateMissingPersonCase: (caseId: string, updates: { status?: string; caseNotes?: string }) => Promise<boolean>;
  publishAnnouncement: (data: {
    title: string;
    message: string;
    category?: any;
    priority?: any;
    language?: any;
  }) => Promise<Announcement>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('English');
  const [role, setRole] = useState<UserRole>('public');
  const [activeResponderTeamId, setActiveResponderTeamId] = useState<string>('TEAM-108-A');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [responseTeams, setResponseTeams] = useState<ResponseTeam[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [missingPersons, setMissingPersons] = useState<MissingPerson[]>([]);
  const [ghatCrowdZones, setGhatCrowdZones] = useState<GhatCrowdZone[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<ToastInfo | null>(null);
  const [aiAssistantOpen, setAiAssistantOpen] = useState<boolean>(false);

  const t = translations[language] || translations.English;

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const [incRes, teamsRes, facRes, annRes, mpRes, crowdRes] = await Promise.all([
        fetch('/api/incidents'),
        fetch('/api/response-teams'),
        fetch('/api/facilities'),
        fetch('/api/announcements'),
        fetch(`/api/missing-persons?role=${role}`),
        fetch('/api/crowd-zones'),
      ]);

      if (incRes.ok) {
        const d = await incRes.json();
        setIncidents(d.incidents || []);
      }
      if (teamsRes.ok) {
        const d = await teamsRes.json();
        setResponseTeams(d.teams || []);
      }
      if (facRes.ok) {
        const d = await facRes.json();
        setFacilities(d.facilities || []);
      }
      if (annRes.ok) {
        const d = await annRes.json();
        setAnnouncements(d.announcements || []);
      }
      if (mpRes.ok) {
        const d = await mpRes.json();
        setMissingPersons(d.cases || []);
      }
      if (crowdRes.ok) {
        const d = await crowdRes.json();
        setGhatCrowdZones(d.zones || []);
      }
    } catch (err) {
      console.error('Failed to fetch data from API:', err);
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    refreshData();
    // Poll every 25 seconds for live status updates
    const interval = setInterval(() => {
      refreshData();
    }, 25000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const submitEmergencyReport = async (report: {
    category: string;
    description: string;
    location: string;
    latitude?: number;
    longitude?: number;
    reporterName?: string;
    reporterPhone?: string;
    photoUrl?: string;
  }): Promise<Incident> => {
    const res = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to submit report');
    }
    setIncidents((prev) => [data.incident, ...prev]);
    showToast(`Emergency report ${data.incident.incidentId} submitted! Triage priority: ${data.incident.priority}`, 'success');
    return data.incident;
  };

  const updateIncident = async (
    incidentId: string,
    updates: {
      status?: IncidentStatus;
      verifiedPriority?: PriorityLevel;
      assignedTeamId?: string;
      assignedTeamName?: string;
      operatorNotes?: string;
      responderNotes?: string;
    }
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          role,
          performedBy: role === 'admin' ? 'Control Room Operator' : 'Assigned Responder',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || 'Failed to update incident', 'error');
        return false;
      }
      setIncidents((prev) =>
        prev.map((inc) => (inc.incidentId === incidentId ? data.incident : inc))
      );
      showToast(`Incident ${incidentId} updated successfully.`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Error updating incident', 'error');
      return false;
    }
  };

  const submitMissingPersonReport = async (data: {
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
  }): Promise<MissingPerson> => {
    const res = await fetch('/api/missing-persons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Failed to register missing person');
    }
    setMissingPersons((prev) => [result.case, ...prev]);
    showToast(`Missing person case ${result.case.caseId} logged. Search alert broadcasted.`, 'success');
    return result.case;
  };

  const updateMissingPersonCase = async (caseId: string, updates: { status?: string; caseNotes?: string }): Promise<boolean> => {
    try {
      const res = await fetch(`/api/missing-persons/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        showToast(result.error || 'Failed to update case', 'error');
        return false;
      }
      setMissingPersons((prev) =>
        prev.map((c) => (c.caseId === caseId ? result.case : c))
      );
      showToast(`Case ${caseId} status changed to ${updates.status || 'Updated'}.`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Error updating missing person case', 'error');
      return false;
    }
  };

  const publishAnnouncement = async (data: {
    title: string;
    message: string;
    category?: any;
    priority?: any;
    language?: any;
  }): Promise<Announcement> => {
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        publishedBy: 'Godavari Pushkaralu District Control Room',
      }),
    });
    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Failed to publish announcement');
    }
    setAnnouncements((prev) => [result.announcement, ...prev]);
    showToast(`Announcement published: ${result.announcement.title}`, 'success');
    return result.announcement;
  };

  const resetDemoData = async () => {
    try {
      setIsLoading(true);
      await fetch('/api/demo/reset', { method: 'POST' });
      await refreshData();
      showToast('All demo records reset to initial Godavari Pushkaralu dataset.', 'info');
    } catch (err) {
      showToast('Failed to reset demo dataset', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        role,
        setRole,
        activeResponderTeamId,
        setActiveResponderTeamId,
        incidents,
        responseTeams,
        facilities,
        announcements,
        missingPersons,
        ghatCrowdZones,
        isLoading,
        toast,
        showToast,
        aiAssistantOpen,
        setAiAssistantOpen,
        refreshData,
        resetDemoData,
        submitEmergencyReport,
        updateIncident,
        submitMissingPersonReport,
        updateMissingPersonCase,
        publishAnnouncement,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
