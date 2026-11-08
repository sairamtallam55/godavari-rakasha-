import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Incident, IncidentAuditLog } from '../types';

export const TrackIncidentPage: React.FC = () => {
  const { incidents } = useApp();
  const [searchParams] = useSearchParams();
  const [searchId, setSearchId] = useState('');
  const [currentIncident, setCurrentIncident] = useState<Incident | null>(null);
  const [logs, setLogs] = useState<IncidentAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setSearchId(id);
      fetchIncident(id);
    } else if (incidents.length > 0) {
      // Default to first active incident for easy preview
      const sample = incidents[0];
      setSearchId(sample.incidentId);
      fetchIncident(sample.incidentId);
    }
  }, [searchParams, incidents]);

  const fetchIncident = async (id: string) => {
    setIsLoading(true);
    setNotFound(false);
    try {
      const res = await fetch(`/api/incidents/${id.trim()}`);
      if (res.ok) {
        const d = await res.json();
        setCurrentIncident(d.incident);
        setLogs(d.logs || []);
      } else {
        setNotFound(true);
        setCurrentIncident(null);
      }
    } catch (e) {
      setNotFound(true);
      setCurrentIncident(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    fetchIncident(searchId);
  };

  const stages = ['Submitted', 'Under Review', 'Verified', 'Assigned', 'Response in Progress', 'Resolved'];

  const getStageIndex = (status: string) => {
    if (status === 'Rejected') return -1;
    return stages.indexOf(status);
  };

  const currentStageIndex = currentIncident ? getStageIndex(currentIncident.status) : 0;

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Track Emergency Report Status
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Check live verification, responder dispatch, and on-scene progress for your reported Pushkaralu incident.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Incident ID (e.g. INC-2027-1001)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition cursor-pointer"
        >
          Track Status
        </button>
      </form>

      {notFound && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 p-5 rounded-2xl text-xs space-y-1">
          <p className="font-bold">Incident Not Found</p>
          <p className="text-slate-600">Please verify the Tracking ID from your submission receipt.</p>
        </div>
      )}

      {currentIncident && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Incident Overview Card */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {currentIncident.incidentId}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    (currentIncident.verifiedPriority || currentIncident.priority) === 'Critical'
                      ? 'bg-red-600 text-white'
                      : 'bg-amber-500 text-slate-950 font-bold'
                  }`}
                >
                  {(currentIncident.verifiedPriority || currentIncident.priority)} Priority
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{currentIncident.category}</h2>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Current Status</span>
              <span className="text-sm font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 inline-block mt-0.5">
                {currentIncident.status}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {currentIncident.description}
          </p>

          {/* Stepper Pipeline */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Response Coordination Progress
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {stages.map((st, idx) => {
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div
                    key={st}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isCurrent
                        ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-sm'
                        : isPassed
                        ? 'bg-blue-50 text-blue-900 border-blue-200 font-semibold'
                        : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                  >
                    <span className="text-[10px] block font-bold mb-0.5">Step {idx + 1}</span>
                    <span className="text-[11px] leading-tight block">{st}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location & Team Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-500 font-medium">Incident Location:</span>
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                {currentIncident.location}
              </p>
              <Link
                to={`/map?lat=${currentIncident.latitude}&lng=${currentIncident.longitude}`}
                className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1 mt-1 text-[11px]"
              >
                <Compass className="w-3 h-3" />
                View on Live Map
              </Link>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-500 font-medium">Assigned Response Team:</span>
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {currentIncident.assignedTeamName || 'Under Review in Control Room'}
              </p>
              {currentIncident.responderNotes && (
                <p className="text-[11px] text-slate-600 italic mt-1">
                  Latest note: {currentIncident.responderNotes}
                </p>
              )}
            </div>
          </div>

          {/* Timeline Audit Logs */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              Incident Event Log
            </h3>
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.logId} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900">{log.action}</strong>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">By {log.performedBy}</p>
                    {log.notes && <p className="text-slate-700 italic mt-0.5">{log.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
