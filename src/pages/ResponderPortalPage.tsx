import React, { useState } from 'react';
import {
  ShieldCheck,
  MapPin,
  PhoneCall,
  CheckCircle2,
  Clock,
  Compass,
  AlertTriangle,
  User,
  Radio,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Incident } from '../types';

export const ResponderPortalPage: React.FC = () => {
  const {
    responseTeams,
    activeResponderTeamId,
    setActiveResponderTeamId,
    incidents,
    updateIncident,
    role,
    setRole,
  } = useApp();

  const [actionNotes, setActionNotes] = useState<{ [incidentId: string]: string }>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const currentTeam = responseTeams.find((t) => t.teamId === activeResponderTeamId) || responseTeams[0];

  // Incidents assigned to this team
  const assignedIncidents = incidents.filter(
    (i) => i.assignedTeamId === currentTeam?.teamId && i.status !== 'Resolved' && i.status !== 'Rejected'
  );

  const resolvedHistory = incidents.filter(
    (i) => i.assignedTeamId === currentTeam?.teamId && i.status === 'Resolved'
  );

  const handleUpdateStatus = async (incident: Incident, targetStatus: any, defaultNote: string) => {
    setUpdatingId(incident.incidentId);
    const note = actionNotes[incident.incidentId] || defaultNote;

    await updateIncident(incident.incidentId, {
      status: targetStatus,
      responderNotes: note,
    });

    setUpdatingId(null);
    setActionNotes((prev) => ({ ...prev, [incident.incidentId]: '' }));
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Response Team Field Operations
            </h1>
            <span className="bg-amber-900 text-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Responder View
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mobile-optimized task management for deployed Pushkaralu medical, river rescue, crowd control, and child welfare units.
          </p>
        </div>

        {role !== 'responder' && (
          <button
            onClick={() => setRole('responder')}
            className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-300 transition cursor-pointer"
          >
            Switch Role to Responder
          </button>
        )}
      </div>

      {/* Responder Team Selector Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Deployed Unit:</span>
          <div className="flex items-center gap-3">
            <select
              value={activeResponderTeamId}
              onChange={(e) => setActiveResponderTeamId(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 font-extrabold text-sm sm:text-base rounded-xl px-3 py-2 focus:outline-none"
            >
              {responseTeams.map((team) => (
                <option key={team.teamId} value={team.teamId}>
                  {team.teamName} — ({team.category})
                </option>
              ))}
            </select>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                currentTeam?.availability === 'Responding'
                  ? 'bg-amber-100 text-amber-800 animate-pulse'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {currentTeam?.availability}
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-600 space-y-1">
          <p>Lead Officer: <strong className="text-slate-900">{currentTeam?.leadOfficer}</strong></p>
          <p>Station Depot: <strong className="text-slate-900">{currentTeam?.stationLocation}</strong></p>
          <p>Direct Radio / Call: <strong className="text-blue-700">{currentTeam?.contactNumber}</strong></p>
        </div>
      </div>

      {/* Active Tasks Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Assigned Emergency Incidents</span>
            <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {assignedIncidents.length}
            </span>
          </h2>
          <span className="text-xs text-slate-500">Requires on-scene action and status updates</span>
        </div>

        {assignedIncidents.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">All clear! No active pending tasks.</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your unit ({currentTeam?.teamName}) has resolved all assigned emergencies. Maintain patrol readiness at {currentTeam?.stationLocation}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedIncidents.map((inc) => {
              const isCritical = (inc.verifiedPriority || inc.priority) === 'Critical';
              const isHigh = (inc.verifiedPriority || inc.priority) === 'High';

              return (
                <div
                  key={inc.incidentId}
                  className={`bg-white rounded-3xl border p-5 shadow-xs space-y-4 ${
                    isCritical ? 'border-red-300 ring-2 ring-red-500/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {inc.incidentId}
                        </span>
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded ${
                            isCritical
                              ? 'bg-red-600 text-white'
                              : isHigh
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {inc.verifiedPriority || inc.priority}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">{inc.category}</h3>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        inc.status === 'Response in Progress'
                          ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inc.status}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {inc.description}
                  </p>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <strong>Location:</strong> {inc.location}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
                      <strong>Reporter:</strong> {inc.reporterName || 'Anonymous'} ({inc.reporterPhone || 'Not provided'})
                    </p>
                    {inc.operatorNotes && (
                      <p className="text-purple-800 bg-purple-50 p-1.5 rounded border border-purple-200 mt-1">
                        <strong>Control Room Directive:</strong> {inc.operatorNotes}
                      </p>
                    )}
                  </div>

                  {/* Responder Action Note input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Add Field Action Note / Medical Observation:
                    </label>
                    <input
                      type="text"
                      value={actionNotes[inc.incidentId] || ''}
                      onChange={(e) =>
                        setActionNotes((prev) => ({
                          ...prev,
                          [inc.incidentId]: e.target.value,
                        }))
                      }
                      placeholder="e.g. Arrived at gate 3, victim stabilized, administering first aid..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    {inc.status !== 'Response in Progress' && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            inc,
                            'Response in Progress',
                            'Unit acknowledged assignment and deployed en route.'
                          )
                        }
                        disabled={updatingId === inc.incidentId}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 px-3 rounded-xl text-xs shadow-xs transition cursor-pointer"
                      >
                        En Route / In Progress
                      </button>
                    )}

                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          inc,
                          'Resolved',
                          'Incident resolved and handled safely on-scene.'
                        )
                      }
                      disabled={updatingId === inc.incidentId}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs shadow-xs transition cursor-pointer"
                    >
                      Mark Resolved
                    </button>

                    <a
                      href={`https://www.google.com/maps?q=${inc.latitude},${inc.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl transition flex items-center justify-center"
                      title="Open GPS Navigation"
                    >
                      <Compass className="w-4 h-4 text-blue-600" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolved History */}
      {resolvedHistory.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Resolved Incident History ({resolvedHistory.length})</h2>
          <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {resolvedHistory.map((inc) => (
              <div key={inc.incidentId} className="p-4 text-xs flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-700">{inc.incidentId}</span>
                    <span className="font-bold text-slate-900">{inc.category}</span>
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                      Resolved
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{inc.description}</p>
                  {inc.responderNotes && (
                    <p className="text-slate-500 italic mt-0.5">Note: {inc.responderNotes}</p>
                  )}
                </div>
                <span className="text-slate-400">
                  {new Date(inc.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
