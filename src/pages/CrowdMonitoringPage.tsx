import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  LifeBuoy,
  Users,
  Compass,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  Send,
  Building2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CrowdMonitoringPage: React.FC = () => {
  const { ghatCrowdZones, refreshData, showToast } = useApp();
  const [selectedGhatId, setSelectedGhatId] = useState(ghatCrowdZones[0]?.ghatId || 'GHAT-01');
  const [observationText, setObservationText] = useState('');
  const [estimatedCount, setEstimatedCount] = useState('Heavy Surge');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleObservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!observationText.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/crowd-zones/observation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ghatId: selectedGhatId,
          deltaVisitors: estimatedCount === 'Critical Bottleneck' ? 1200 : 500,
        }),
      });

      if (res.ok) {
        showToast('Crowd observation logged and telemetry updated for Command Center.', 'success');
        setObservationText('');
        await refreshData();
      }
    } catch (err) {
      showToast('Error recording observation', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-orange-100 text-orange-700">
            <Activity className="w-6 h-6" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Godavari Ghat Crowd & Safety Monitoring
          </h1>
          <span className="bg-black text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
            DEMO TELEMETRY
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Real-time bather queue density, holding pen status, river velocity warnings, and crowd surge detection for Pushkaralu 2027.
        </p>
      </div>

      {/* Ghat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ghatCrowdZones.map((ghat) => {
          const isCritical = ghat.status === 'Critical';
          const isHeavy = ghat.status === 'Heavy';

          return (
            <div
              key={ghat.ghatId}
              className={`bg-white rounded-3xl border p-5 shadow-xs space-y-4 transition-all ${
                isCritical
                  ? 'border-red-300 ring-2 ring-red-500/20 bg-red-50/10'
                  : isHeavy
                  ? 'border-amber-300'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{ghat.name}</h3>
                  <p className="text-xs text-slate-500">{ghat.district}</p>
                </div>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    isCritical
                      ? 'bg-red-600 text-white animate-pulse'
                      : isHeavy
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : ghat.status === 'Moderate'
                      ? 'bg-yellow-100 text-yellow-800 font-bold'
                      : 'bg-emerald-100 text-emerald-800 font-bold'
                  }`}
                >
                  {ghat.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Capacity Density: {ghat.occupancyPercent}%</span>
                  <span className="text-slate-500">
                    {ghat.currentVisitors.toLocaleString()} / {ghat.maxCapacity.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      ghat.occupancyPercent >= 90
                        ? 'bg-red-600'
                        : ghat.occupancyPercent >= 75
                        ? 'bg-amber-500'
                        : ghat.occupancyPercent >= 50
                        ? 'bg-yellow-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, ghat.occupancyPercent)}%` }}
                  />
                </div>
              </div>

              {/* Details & River Currents */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Holding Enclosures:</span>
                  <strong className={ghat.holdingAreaActive ? 'text-red-700' : 'text-slate-700'}>
                    {ghat.holdingAreaActive ? 'Active (Gated)' : 'Open Flow'}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Estimated Holy Dip Wait:</span>
                  <strong>~{ghat.estimatedWaitMinutes} minutes</strong>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500 flex items-center gap-1">
                    <LifeBuoy className="w-3.5 h-3.5 text-blue-600" />
                    River Flow:
                  </span>
                  <strong className={ghat.waterFlowStatus.includes('Alert') ? 'text-red-600' : 'text-emerald-700'}>
                    {ghat.waterFlowStatus}
                  </strong>
                </div>
              </div>

              {/* Diversion Suggestion if congested */}
              {ghat.occupancyPercent >= 80 && (
                <div className="text-[11px] bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-xl font-medium">
                  <strong>Advisory:</strong> Consider diverting family groups to Saraswathi or Markandeya Ghat to avoid queue delays.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Public / Volunteer Crowd Observation Submission Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-2xl mx-auto space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Report Local Barricade Choke Point or Queue Surge
          </h2>
          <p className="text-xs text-slate-500">
            Help control room operators detect crowd blockages before stampede risks develop.
          </p>
        </div>

        <form onSubmit={handleObservationSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Ghat *</label>
            <select
              value={selectedGhatId}
              onChange={(e) => setSelectedGhatId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none"
            >
              {ghatCrowdZones.map((g) => (
                <option key={g.ghatId} value={g.ghatId}>
                  {g.name} ({g.occupancyPercent}% Occupancy)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Surge Severity *</label>
            <select
              value={estimatedCount}
              onChange={(e) => setEstimatedCount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none"
            >
              <option value="Moderate Flow Increase">Moderate Flow Increase</option>
              <option value="Heavy Surge">Heavy Surge (Barricades Under Pressure)</option>
              <option value="Critical Bottleneck">Critical Bottleneck (Immediate Holding Gate Required)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Specific Location & Landmark Details *</label>
            <textarea
              rows={2}
              required
              value={observationText}
              onChange={(e) => setObservationText(e.target.value)}
              placeholder="e.g. Exit gate 3 stairs blocked by luggage, pilgrims jumping barricades near south steps..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Logging Observation...' : 'Submit Crowd Telemetry Observation'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
