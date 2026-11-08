import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  Search,
  Filter,
  Send,
  Radio,
  FileText,
  X,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  Megaphone,
  History,
  Download,
  RefreshCw,
  Eye,
  UserCheck,
  Activity,
  ListFilter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Incident, PriorityLevel, IncidentStatus, IncidentAuditLog } from '../types';
import {
  AuditActionType,
  categorizeLogAction,
  filterAuditLogs,
  generateAuditLogsCsv,
} from '../utils/auditLogic';
import { downloadCsvBlob } from '../utils/csvExport';

export const ControlRoomPage: React.FC = () => {
  const {
    incidents,
    responseTeams,
    updateIncident,
    publishAnnouncement,
    role,
    setRole,
    showToast,
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();

  // View state: 'queue' (Incident Triage Queue) vs 'activityLogs' (System Activity & Audit Logs)
  const [currentView, setCurrentView] = useState<'queue' | 'activityLogs'>('queue');

  // Queue state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'critical' | 'active' | 'resolved'>('all');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [incidentLogs, setIncidentLogs] = useState<IncidentAuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Modal form states
  const [editPriority, setEditPriority] = useState<PriorityLevel>('High');
  const [editStatus, setEditStatus] = useState<IncidentStatus>('Verified');
  const [editTeamId, setEditTeamId] = useState<string>('');
  const [operatorNotes, setOperatorNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Announcement Modal
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annCategory, setAnnCategory] = useState<'Crowd Advisory' | 'River Safety' | 'Weather Notice' | 'Missing Person Notice' | 'Emergency Instruction'>('Crowd Advisory');
  const [annPriority, setAnnPriority] = useState<'Urgent' | 'Advisory' | 'General'>('Urgent');

  // Activity Logs View States
  const [activityLogs, setActivityLogs] = useState<IncidentAuditLog[]>([]);
  const [loadingActivityLogs, setLoadingActivityLogs] = useState(false);
  const [logActionFilter, setLogActionFilter] = useState<AuditActionType>('All');
  const [logRoleFilter, setLogRoleFilter] = useState<string>('All');
  const [logSearchQuery, setLogSearchQuery] = useState('');

  // Fetch all system activity logs
  const fetchActivityLogs = useCallback(async () => {
    setLoadingActivityLogs(true);
    try {
      const res = await fetch('/api/activity-logs');
      if (res.ok) {
        const d = await res.json();
        setActivityLogs(d.logs || []);
      }
    } catch (err) {
      console.warn('Failed to load system activity logs:', err);
    } finally {
      setLoadingActivityLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  // If incident ID passed in URL, auto-open modal
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      const inc = incidents.find((i) => i.incidentId === idParam);
      if (inc) {
        handleOpenIncident(inc);
      }
    }
    const viewParam = searchParams.get('view');
    if (viewParam === 'activityLogs' || viewParam === 'logs') {
      setCurrentView('activityLogs');
    }
  }, [searchParams, incidents]);

  // Statistics for Queue
  const totalCount = incidents.length;
  const criticalCount = incidents.filter((i) => (i.verifiedPriority || i.priority) === 'Critical' && i.status !== 'Resolved').length;
  const highCount = incidents.filter((i) => (i.verifiedPriority || i.priority) === 'High' && i.status !== 'Resolved').length;
  const pendingCount = incidents.filter((i) => i.status === 'Submitted' || i.status === 'Under Review').length;
  const activeResponsesCount = incidents.filter((i) => i.status === 'Response in Progress' || i.status === 'Assigned').length;
  const resolvedCount = incidents.filter((i) => i.status === 'Resolved').length;

  // Filtered Queue list
  const filteredList = incidents.filter((inc) => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      inc.incidentId.toLowerCase().includes(q) ||
      inc.description.toLowerCase().includes(q) ||
      inc.location.toLowerCase().includes(q) ||
      inc.category.toLowerCase().includes(q);

    if (!matchQuery) return false;

    if (activeTab === 'pending') return inc.status === 'Submitted' || inc.status === 'Under Review';
    if (activeTab === 'critical') return (inc.verifiedPriority || inc.priority) === 'Critical' || (inc.verifiedPriority || inc.priority) === 'High';
    if (activeTab === 'active') return inc.status === 'Response in Progress' || inc.status === 'Assigned';
    if (activeTab === 'resolved') return inc.status === 'Resolved';
    return true;
  });

  // Filtered Activity Logs
  const filteredActivityLogs = filterAuditLogs(activityLogs, {
    actionType: logActionFilter,
    role: logRoleFilter,
    search: logSearchQuery,
  });

  // Activity Log Metrics
  const adminStatusChangesCount = activityLogs.filter((l) => categorizeLogAction(l.action) === 'Status Change').length;
  const teamAssignmentsCount = activityLogs.filter((l) => categorizeLogAction(l.action) === 'Team Assignment').length;
  const priorityUpdatesCount = activityLogs.filter((l) => categorizeLogAction(l.action) === 'Priority Update').length;
  const systemTriageCount = activityLogs.filter((l) => categorizeLogAction(l.action) === 'AI Triage').length;

  const handleOpenIncident = async (inc: Incident) => {
    setSelectedIncident(inc);
    setEditPriority(inc.verifiedPriority || inc.priority);
    setEditStatus(inc.status);
    setEditTeamId(inc.assignedTeamId || '');
    setOperatorNotes(inc.operatorNotes || '');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('id', inc.incidentId);
      return next;
    });

    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/incidents/${inc.incidentId}`);
      if (res.ok) {
        const d = await res.json();
        setIncidentLogs(d.logs || []);
      }
    } catch (e) {
      console.warn('Failed to load audit logs:', e);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSaveIncident = async () => {
    if (!selectedIncident) return;
    setIsUpdating(true);

    const assignedTeam = responseTeams.find((t) => t.teamId === editTeamId);

    const success = await updateIncident(selectedIncident.incidentId, {
      status: editStatus,
      verifiedPriority: editPriority,
      assignedTeamId: editTeamId || undefined,
      assignedTeamName: assignedTeam ? assignedTeam.teamName : undefined,
      operatorNotes: operatorNotes.trim(),
    });

    setIsUpdating(false);
    if (success) {
      // Refresh local logs and global activity logs
      const res = await fetch(`/api/incidents/${selectedIncident.incidentId}`);
      if (res.ok) {
        const d = await res.json();
        setSelectedIncident(d.incident);
        setIncidentLogs(d.logs || []);
      }
      fetchActivityLogs();
    }
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;

    await publishAnnouncement({
      title: annTitle,
      message: annMessage,
      category: annCategory,
      priority: annPriority,
      language: 'English',
    });

    setAnnTitle('');
    setAnnMessage('');
    setShowAnnounceModal(false);
  };

  const handleExportActivityLogsCsv = () => {
    const csv = generateAuditLogsCsv(filteredActivityLogs);
    const dateStamp = new Date().toISOString().slice(0, 10);
    downloadCsvBlob(csv, `godavari_raksha_activity_audit_logs_${dateStamp}.csv`);
    showToast(`Exported ${filteredActivityLogs.length} activity audit log records to CSV.`, 'success');
  };

  const getActionBadgeColor = (action: string) => {
    const cat = categorizeLogAction(action);
    if (cat === 'Status Change') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (cat === 'Team Assignment') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (cat === 'Priority Update') return 'bg-amber-100 text-amber-900 border-amber-300';
    if (cat === 'AI Triage') return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <ShieldAlert className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Control Room Command Center
            </h1>
            <span className="bg-purple-900 text-purple-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Operator Console
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative incident verification, priority confirmation, response team dispatch, and chronological activity audit logging for Godavari Pushkaralu 2027.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {role !== 'admin' && (
            <button
              onClick={() => setRole('admin')}
              className="bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-purple-300 transition cursor-pointer"
            >
              Switch Role to Admin
            </button>
          )}

          <button
            onClick={() => setShowAnnounceModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition cursor-pointer"
          >
            <Megaphone className="w-4 h-4" />
            <span>Broadcast Bulletin</span>
          </button>
        </div>
      </div>

      {/* Primary View Switcher: Incident Triage Queue vs Activity Logs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCurrentView('queue');
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set('view', 'queue');
                return next;
              });
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              currentView === 'queue'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Incident Triage & Queue</span>
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setCurrentView('activityLogs');
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set('view', 'activityLogs');
                return next;
              });
              fetchActivityLogs();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              currentView === 'activityLogs'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Activity Logs & Accountability</span>
            <span className="bg-purple-100 text-purple-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-purple-300">
              {activityLogs.length}
            </span>
          </button>
        </div>

        {currentView === 'activityLogs' && (
          <button
            onClick={fetchActivityLogs}
            disabled={loadingActivityLogs}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingActivityLogs ? 'animate-spin' : ''}`} />
            <span>Refresh Logs</span>
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: INCIDENT TRIAGE QUEUE (DEFAULT VIEW) */}
      {/* ======================================================== */}
      {currentView === 'queue' && (
        <>
          {/* KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Reports</span>
              <p className="text-2xl font-black text-slate-900">{totalCount}</p>
              <span className="text-[10px] text-slate-400">All intake channels</span>
            </div>

            <div className="bg-red-50/80 p-4 rounded-2xl border border-red-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Critical</span>
              <p className="text-2xl font-black text-red-600">{criticalCount}</p>
              <span className="text-[10px] text-red-500">Requires instant triage</span>
            </div>

            <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">High Priority</span>
              <p className="text-2xl font-black text-amber-700">{highCount}</p>
              <span className="text-[10px] text-amber-600">Urgent action</span>
            </div>

            <div className="bg-blue-50/80 p-4 rounded-2xl border border-blue-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Pending Review</span>
              <p className="text-2xl font-black text-blue-600">{pendingCount}</p>
              <span className="text-[10px] text-blue-500">Awaiting operator sign-off</span>
            </div>

            <div className="bg-indigo-50/80 p-4 rounded-2xl border border-indigo-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Active Teams</span>
              <p className="text-2xl font-black text-indigo-600">{activeResponsesCount}</p>
              <span className="text-[10px] text-indigo-500">On-field / en route</span>
            </div>

            <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Resolved</span>
              <p className="text-2xl font-black text-emerald-600">{resolvedCount}</p>
              <span className="text-[10px] text-emerald-500">Cases closed safely</span>
            </div>
          </div>

          {/* Main Table Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
            {/* Search & Tabs */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: `All (${totalCount})` },
                  { id: 'pending', label: `Pending Review (${pendingCount})`, highlight: pendingCount > 0 },
                  { id: 'critical', label: `Critical & High (${criticalCount + highCount})` },
                  { id: 'active', label: `Active In-Field (${activeResponsesCount})` },
                  { id: 'resolved', label: `Resolved (${resolvedCount})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : tab.highlight
                        ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ID, ghat, text..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Incident ID</th>
                    <th className="py-3 px-4">Category & Details</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">AI Triage vs Operator Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Team</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {filteredList.map((inc) => {
                    const priority = inc.verifiedPriority || inc.priority;
                    const isCritical = priority === 'Critical';
                    const isHigh = priority === 'High';

                    return (
                      <tr key={inc.incidentId} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                          {inc.incidentId}
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <span className="font-bold text-slate-900 block mb-0.5">{inc.category}</span>
                          <p className="text-slate-600 truncate">{inc.description}</p>
                        </td>

                        <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                          {inc.location.split(',')[0]}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-block font-extrabold px-2 py-0.5 rounded text-[11px] w-fit ${
                                isCritical
                                  ? 'bg-red-600 text-white'
                                  : isHigh
                                  ? 'bg-amber-500 text-slate-950 font-black'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {priority} {inc.verifiedPriority ? '✓ Verified' : 'AI Suggested'}
                            </span>
                            {inc.aiSuggestion && !inc.verifiedPriority && (
                              <span className="text-[10px] text-indigo-700 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                AI Rec: {inc.aiSuggestion.priority}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                              inc.status === 'Resolved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inc.status === 'Response in Progress'
                                ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                                : inc.status === 'Assigned'
                                ? 'bg-blue-100 text-blue-800'
                                : inc.status === 'Verified'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {inc.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                          {inc.assignedTeamName ? (
                            <span className="font-semibold text-slate-800">{inc.assignedTeamName}</span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleOpenIncident(inc)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-2xs transition cursor-pointer"
                          >
                            Manage Triage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: ACTIVITY LOGS & AUDIT TRAIL (NEW AUDIT VIEW) */}
      {/* ======================================================== */}
      {currentView === 'activityLogs' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Accountability KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Audit Actions
              </span>
              <p className="text-2xl font-black text-purple-700">{activityLogs.length}</p>
              <span className="text-[10px] text-slate-400">Chronological audit ledger</span>
            </div>

            <div className="bg-blue-50/80 p-4 rounded-2xl border border-blue-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                Status Transitions
              </span>
              <p className="text-2xl font-black text-blue-600">{adminStatusChangesCount}</p>
              <span className="text-[10px] text-blue-500">Verified, Assigned, Resolved</span>
            </div>

            <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                Team Assignments
              </span>
              <p className="text-2xl font-black text-emerald-600">{teamAssignmentsCount}</p>
              <span className="text-[10px] text-emerald-500">Field units dispatched</span>
            </div>

            <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                Priority Overrides
              </span>
              <p className="text-2xl font-black text-amber-700">{priorityUpdatesCount}</p>
              <span className="text-[10px] text-amber-600">Operator verified severity</span>
            </div>
          </div>

          {/* Activity Log Filter & Export Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Action type filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-bold text-slate-600 flex items-center gap-1 mr-1">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  Action Type:
                </span>
                {[
                  { id: 'All', label: 'All Actions' },
                  { id: 'Status Change', label: `Status Changes (${adminStatusChangesCount})` },
                  { id: 'Team Assignment', label: `Assignments (${teamAssignmentsCount})` },
                  { id: 'Priority Update', label: `Priority (${priorityUpdatesCount})` },
                  { id: 'Report Submitted', label: 'Intakes' },
                  { id: 'AI Triage', label: `AI Triage (${systemTriageCount})` },
                ].map((act) => (
                  <button
                    key={act.id}
                    onClick={() => setLogActionFilter(act.id as AuditActionType)}
                    className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                      logActionFilter === act.id
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>

              {/* CSV Export & Actions */}
              <button
                onClick={handleExportActivityLogsCsv}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition cursor-pointer text-xs"
                title="Download Activity Logs CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit Log CSV</span>
              </button>
            </div>

            {/* Second row: Role filter & search input */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  Authority / Role:
                </span>
                <select
                  value={logRoleFilter}
                  onChange={(e) => setLogRoleFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="All">All Roles</option>
                  <option value="admin">Control Room Admin Only</option>
                  <option value="responder">Field Responders</option>
                  <option value="system">System / AI Engine</option>
                  <option value="public">Public Reporters</option>
                </select>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  placeholder="Search logs by action, officer, or incident ID..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Chronological Audit Table & Ledger */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-purple-700" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Chronological System Audit Ledger
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  ({filteredActivityLogs.length} events logged)
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Immutable chronological order (Most recent first)
              </span>
            </div>

            {loadingActivityLogs ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-600" />
                <p>Loading activity logs...</p>
              </div>
            ) : filteredActivityLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <FileText className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-700">No audit logs match current filters</p>
                <p className="text-xs text-slate-400">Try adjusting the action type or search term.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredActivityLogs.map((log) => {
                  const badgeStyle = getActionBadgeColor(log.action);
                  const isIncLink = Boolean(log.incidentId);

                  return (
                    <div
                      key={log.logId}
                      className="p-4 sm:p-5 hover:bg-slate-50 transition flex flex-col sm:flex-row items-start justify-between gap-4 text-xs"
                    >
                      {/* Left: Action, Officer, Incident */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Action Badge */}
                          <span
                            className={`font-bold px-2.5 py-0.5 rounded-full border text-[11px] ${badgeStyle}`}
                          >
                            {log.action}
                          </span>

                          {/* Related Incident ID */}
                          {isIncLink && (
                            <Link
                              to={`/admin?id=${log.incidentId}`}
                              onClick={() => {
                                const matched = incidents.find((i) => i.incidentId === log.incidentId);
                                if (matched) handleOpenIncident(matched);
                              }}
                              className="font-mono font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition flex items-center gap-1"
                              title="Inspect Incident Triage"
                            >
                              <span>{log.incidentId}</span>
                              <ExternalLink className="w-3 h-3 text-blue-500" />
                            </Link>
                          )}

                          {/* Authority / Performer Tag */}
                          <span className="text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-slate-500" />
                            <span>{log.performedBy}</span>
                            <span className="text-slate-400 font-normal">({log.role})</span>
                          </span>
                        </div>

                        {/* Audit Directives / Notes */}
                        {log.notes && (
                          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-slate-800 text-xs font-medium">
                            <span className="text-slate-400 font-bold block text-[10px] uppercase mb-0.5">
                              Audit Reason & Action Directives:
                            </span>
                            {log.notes}
                          </div>
                        )}
                      </div>

                      {/* Right: Timestamp */}
                      <div className="text-right sm:self-center shrink-0 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(log.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(log.timestamp).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Incident Triage & Operator Management Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-300 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                    {selectedIncident.incidentId}
                  </span>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    {selectedIncident.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">Incident Dispatch & Operator Control</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedIncident(null);
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.delete('id');
                    return next;
                  });
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-800">
              {/* Incident Details Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="font-bold text-sm text-slate-900">Incident Description:</div>
                <p className="text-slate-700 text-sm leading-relaxed">{selectedIncident.description}</p>
                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-slate-500 gap-2">
                  <span>📍 Location: <strong>{selectedIncident.location}</strong></span>
                  <span>Coords: <strong>{selectedIncident.latitude.toFixed(4)}, {selectedIncident.longitude.toFixed(4)}</strong></span>
                  <span>Reporter: <strong>{selectedIncident.reporterName || 'Anonymous'}</strong> ({selectedIncident.reporterPhone || 'No phone'})</span>
                </div>
              </div>

              {/* AI Suggestion Card */}
              {selectedIncident.aiSuggestion && (
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      AI Advisory Recommendation
                    </span>
                    <span className="text-[10px] font-bold bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded">
                      {selectedIncident.aiSuggestion.isFallback ? 'Deterministic Logic' : 'Gemini 3.8 Flash'}
                    </span>
                  </div>
                  <p className="text-slate-700"><strong>Summary:</strong> {selectedIncident.aiSuggestion.summary}</p>
                  {selectedIncident.aiSuggestion.safetyConcerns.length > 0 && (
                    <div>
                      <span className="font-semibold text-indigo-900">Safety Concerns:</span>
                      <ul className="list-disc list-inside text-slate-700 mt-0.5">
                        {selectedIncident.aiSuggestion.safetyConcerns.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="text-slate-700">
                    Recommended Team: <strong>{selectedIncident.aiSuggestion.recommendedTeam}</strong>
                  </div>
                </div>
              )}

              {/* Operator Action Form */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-2xs">
                <h4 className="font-bold text-sm text-slate-900">Operator Decision & Dispatch Controls</h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Verified Priority */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Verified Priority Level *
                    </label>
                    <select
                      aria-label="Select Verified Priority"
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as PriorityLevel)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold focus:outline-none"
                    >
                      <option value="Critical">Critical Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>

                  {/* Status Transition */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Incident Status *
                    </label>
                    <select
                      aria-label="Select Incident Status"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as IncidentStatus)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold focus:outline-none"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Verified">Verified</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Response in Progress">Response in Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Assign Response Team */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Assign Response Team
                    </label>
                    <select
                      aria-label="Select Response Team"
                      value={editTeamId}
                      onChange={(e) => setEditTeamId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold focus:outline-none"
                    >
                      <option value="">-- No Team Assigned --</option>
                      {responseTeams.map((team) => (
                        <option key={team.teamId} value={team.teamId}>
                          {team.teamName} ({team.availability})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Operator Notes */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Internal Operator Notes & Action Directives
                  </label>
                  <textarea
                    rows={2}
                    value={operatorNotes}
                    onChange={(e) => setOperatorNotes(e.target.value)}
                    placeholder="Enter dispatch notes, CCTV verification details, or medical instructions..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveIncident}
                    disabled={isUpdating}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl shadow transition cursor-pointer disabled:opacity-60"
                  >
                    {isUpdating ? 'Saving Update...' : 'Commit Operator Decision'}
                  </button>
                </div>
              </div>

              {/* Complete Audit Timeline Log for this specific incident */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  Incident Audit Trail & Timeline
                </h4>
                {loadingLogs ? (
                  <p className="text-slate-400">Loading audit history...</p>
                ) : (
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                    {incidentLogs.map((log) => (
                      <div key={log.logId} className="p-3 text-xs flex items-start gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{log.action}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                          <span className="text-slate-500 block">
                            By: <strong>{log.performedBy}</strong> ({log.role})
                          </span>
                          {log.notes && <p className="text-slate-700 italic mt-0.5">{log.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Bulletin Modal */}
      {showAnnounceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Broadcast Official Pushkaralu Bulletin</h3>
              <button onClick={() => setShowAnnounceModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handlePublishAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. High Water Current Alert at Kotilingala"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Message Text *</label>
                <textarea
                  rows={3}
                  required
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  placeholder="Official advisory instructions for pilgrims and bathers..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={annCategory}
                    onChange={(e) => setAnnCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                  >
                    <option value="Crowd Advisory">Crowd Advisory</option>
                    <option value="River Safety">River Safety</option>
                    <option value="Weather Notice">Weather Notice</option>
                    <option value="Missing Person Notice">Missing Person Notice</option>
                    <option value="Emergency Instruction">Emergency Instruction</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={annPriority}
                    onChange={(e) => setAnnPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                  >
                    <option value="Urgent">Urgent Alert</option>
                    <option value="Advisory">Advisory</option>
                    <option value="General">General Notice</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAnnounceModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl shadow"
                >
                  Broadcast Bulletin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
