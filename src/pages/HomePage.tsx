import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertOctagon,
  MapPin,
  Users,
  ShieldCheck,
  Building2,
  Activity,
  PhoneCall,
  AlertTriangle,
  LifeBuoy,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Compass,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HomePage: React.FC = () => {
  const { t, incidents, announcements, ghatCrowdZones, setAiAssistantOpen } = useApp();

  const criticalIncidents = incidents.filter(
    (i) => (i.verifiedPriority || i.priority) === 'Critical' && i.status !== 'Resolved'
  );

  const pendingVerificationCount = incidents.filter(
    (i) => i.status === 'Submitted' || i.status === 'Under Review'
  ).length;

  const quickCategories = [
    { name: 'Medical emergency', label: 'Medical Emergency', icon: '🚑', desc: 'Heart attack, fainting, severe injury' },
    { name: 'Lost child', label: 'Lost Child / Person', icon: '👦', desc: 'Separated minor or elderly pilgrim' },
    { name: 'Accident', label: 'River / Bathing Accident', icon: '🌊', desc: 'Current drift, slipping past chains' },
    { name: 'Crowd congestion', label: 'Crowd Bottleneck', icon: '⚠️', desc: 'Barricade crush or gate surge' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-900/60 border border-blue-500/40 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Godavari Pushkaralu 2027 Safety Grid • Rajahmundry & Kovvur</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {t.appName}
          </h1>
          <p className="text-base sm:text-xl text-slate-300 font-medium max-w-2xl leading-relaxed">
            {t.tagline}
          </p>

          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Integrated AI emergency triage, real-time ghat crowd telemetry, river safety patrol coordination, and missing-persons recovery across Andhra Pradesh Pushkaralu sectors.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/report"
              className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-red-600/30 transition-transform active:scale-95 text-sm sm:text-base"
            >
              <AlertOctagon className="w-5 h-5 animate-pulse" />
              <span>{t.reportEmergency}</span>
            </Link>

            <Link
              to="/map"
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-5 py-3 rounded-xl font-semibold transition text-sm sm:text-base"
            >
              <MapPin className="w-5 h-5 text-blue-400" />
              <span>{t.liveMap}</span>
            </Link>

            <button
              onClick={() => setAiAssistantOpen(true)}
              className="flex items-center gap-2 bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-200 border border-indigo-700/60 px-4 py-3 rounded-xl font-semibold transition text-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span>Ask AI Safety Guide</span>
            </button>
          </div>

          {/* Direct Toll-Free Helplines Strip */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider">Direct Dial:</span>
            <a
              href="tel:112"
              className="inline-flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 font-semibold"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-400" />
              112 Police & Rescue
            </a>
            <a
              href="tel:108"
              className="inline-flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 font-semibold"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-400" />
              108 Medical Ambulance
            </a>
            <a
              href="tel:08832464400"
              className="inline-flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 font-semibold"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              Child Help: 0883-2464400
            </a>
          </div>
        </div>
      </section>

      {/* Quick Emergency Category Jump */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Rapid Incident Reporting
          </h2>
          <span className="text-xs text-slate-500 font-medium">Select type for instant AI classification</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickCategories.map((cat) => (
            <Link
              key={cat.name}
              to={`/report?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex items-start gap-3.5"
            >
              <span className="text-3xl p-2 rounded-xl bg-slate-100 group-hover:scale-110 transition-transform">
                {cat.icon}
              </span>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 text-sm">
                  {cat.label}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{cat.desc}</p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 mt-2">
                  Report Now <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Announcements Ticker & Active Alerts */}
      {announcements.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <h2 className="text-lg font-bold text-slate-900">{t.recentAnnouncements}</h2>
            </div>
            <span className="text-xs font-semibold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full">
              Live Control Room Feed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.slice(0, 4).map((ann) => (
              <div
                key={ann.announcementId}
                className={`p-4 rounded-2xl border shadow-xs transition-all ${
                  ann.priority === 'Urgent'
                    ? 'bg-red-50/70 border-red-200 text-red-950'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      ann.priority === 'Urgent'
                        ? 'bg-red-600 text-white'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {ann.category}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(ann.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 className="font-bold text-sm mb-1">{ann.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{ann.message}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pushkaralu Ghat Status Telemetry */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Pushkaralu Ghat Congestion & Safety</h2>
            <p className="text-xs text-slate-500">Live bather density, holding area status, and water flow velocities</p>
          </div>
          <Link
            to="/crowd"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            All Ghats <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ghatCrowdZones.slice(0, 6).map((ghat) => (
            <div
              key={ghat.ghatId}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{ghat.name}</h3>
                  <span className="text-[11px] text-slate-500">{ghat.district}</span>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    ghat.status === 'Critical'
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : ghat.status === 'Heavy'
                      ? 'bg-amber-100 text-amber-700 border border-amber-300'
                      : ghat.status === 'Moderate'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {ghat.status}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Occupancy: {ghat.occupancyPercent}%</span>
                  <span className="text-slate-500">
                    {ghat.currentVisitors.toLocaleString()} / {ghat.maxCapacity.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
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

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span className="flex items-center gap-1">
                  <LifeBuoy className="w-3.5 h-3.5 text-blue-500" />
                  Flow: <strong>{ghat.waterFlowStatus}</strong>
                </span>
                <span>Wait: ~{ghat.estimatedWaitMinutes} min</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Godavari Bathing Safety Rules */}
      <section className="bg-blue-50/70 border border-blue-200/80 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-blue-900">
          <LifeBuoy className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold">{t.bathingSafety}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-700">
          <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-2xs space-y-1.5">
            <span className="font-bold text-blue-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              1. Iron Safety Chains
            </span>
            <p className="text-slate-600">{t.stayWithinChains}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-2xs space-y-1.5">
            <span className="font-bold text-blue-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              2. Watch Children & Elderly
            </span>
            <p className="text-slate-600">{t.watchChildren}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-2xs space-y-1.5">
            <span className="font-bold text-blue-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              3. SDRF Boat Directives
            </span>
            <p className="text-slate-600">{t.followSdrf}</p>
          </div>
        </div>
      </section>

      {/* Recent Incidents Activity Feed with Clear Demo Label */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Recent Incident Coordination Feed</h2>
              <span className="bg-black text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                DEMO DATA
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Live updates showing AI triage recommendations and verified operator actions
            </p>
          </div>
          <Link
            to="/admin"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Control Room Queue ({pendingVerificationCount} pending) <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            {incidents.slice(0, 5).map((inc) => (
              <div key={inc.incidentId} className="p-4 sm:p-5 hover:bg-slate-50 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {inc.incidentId}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {inc.category}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        (inc.verifiedPriority || inc.priority) === 'Critical'
                          ? 'bg-red-600 text-white'
                          : (inc.verifiedPriority || inc.priority) === 'High'
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {inc.verifiedPriority || inc.priority} Priority
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      Status: <strong className="text-slate-800">{inc.status}</strong>
                    </span>
                  </div>

                  <p className="text-sm text-slate-800 font-medium">{inc.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {inc.location}
                    </span>
                    {inc.assignedTeamName && (
                      <span className="flex items-center gap-1 text-emerald-700 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Team: {inc.assignedTeamName}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link
                    to={`/track?id=${inc.incidentId}`}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-semibold transition"
                  >
                    Track Status
                  </Link>
                  <Link
                    to={`/map?lat=${inc.latitude}&lng=${inc.longitude}`}
                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Locate
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
