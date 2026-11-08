import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  TrendingUp,
  FileSpreadsheet,
  ShieldCheck,
  Activity,
  FileText,
  ChevronDown,
  Eye,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  generateIncidentCsv,
  generateResponseTeamPerformanceCsv,
  generateGhatCrowdTrendsCsv,
  generateExecutiveSummaryCsv,
  downloadCsvBlob,
} from '../utils/csvExport';

export const AnalyticsPage: React.FC = () => {
  const { incidents, responseTeams, ghatCrowdZones, showToast } = useApp();

  // Export filters
  const [exportReportType, setExportReportType] = useState<
    'executive' | 'incidents' | 'teams' | 'ghats'
  >('executive');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Filtered incidents for report export
  const exportIncidents = incidents.filter((inc) => {
    if (filterCategory !== 'All' && inc.category !== filterCategory) return false;
    const priority = inc.verifiedPriority || inc.priority;
    if (filterPriority !== 'All' && priority !== filterPriority) return false;
    if (filterStatus !== 'All' && inc.status !== filterStatus) return false;
    return true;
  });

  // 1. Incidents by Category
  const categoryCounts: Record<string, number> = {};
  incidents.forEach((inc) => {
    categoryCounts[inc.category] = (categoryCounts[inc.category] || 0) + 1;
  });

  // 2. Incidents by Priority
  const priorityCounts = {
    Critical: incidents.filter((i) => (i.verifiedPriority || i.priority) === 'Critical').length,
    High: incidents.filter((i) => (i.verifiedPriority || i.priority) === 'High').length,
    Medium: incidents.filter((i) => (i.verifiedPriority || i.priority) === 'Medium').length,
    Low: incidents.filter((i) => (i.verifiedPriority || i.priority) === 'Low').length,
  };

  // 3. Status Pipeline
  const statusCounts = {
    Submitted: incidents.filter((i) => i.status === 'Submitted').length,
    'Under Review': incidents.filter((i) => i.status === 'Under Review').length,
    Verified: incidents.filter((i) => i.status === 'Verified').length,
    Assigned: incidents.filter((i) => i.status === 'Assigned').length,
    'Response in Progress': incidents.filter((i) => i.status === 'Response in Progress').length,
    Resolved: incidents.filter((i) => i.status === 'Resolved').length,
  };

  // Execute CSV Download
  const handleDownloadCsv = (type: 'executive' | 'incidents' | 'teams' | 'ghats') => {
    const dateStamp = new Date().toISOString().slice(0, 10);

    if (type === 'executive') {
      const csv = generateExecutiveSummaryCsv(exportIncidents, responseTeams, ghatCrowdZones);
      downloadCsvBlob(csv, `godavari_raksha_executive_audit_report_${dateStamp}.csv`);
      showToast('Executive Comprehensive Audit Report CSV downloaded successfully.', 'success');
    } else if (type === 'incidents') {
      const csv = generateIncidentCsv(exportIncidents);
      downloadCsvBlob(csv, `godavari_raksha_incidents_triage_log_${dateStamp}.csv`);
      showToast(`Exported ${exportIncidents.length} incident records to CSV.`, 'success');
    } else if (type === 'teams') {
      const csv = generateResponseTeamPerformanceCsv(responseTeams, incidents);
      downloadCsvBlob(csv, `godavari_raksha_responder_performance_trends_${dateStamp}.csv`);
      showToast('Response team performance metrics CSV downloaded.', 'success');
    } else if (type === 'ghats') {
      const csv = generateGhatCrowdTrendsCsv(ghatCrowdZones);
      downloadCsvBlob(csv, `godavari_raksha_ghat_crowd_trends_${dateStamp}.csv`);
      showToast('Ghat congestion & river telemetry trends CSV downloaded.', 'success');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <BarChart3 className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Public Safety Analytics & Reports
            </h1>
            <span className="bg-black text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
              DEMO DATA
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Statistical incident distribution, priority breakdown, responder performance, and multi-format CSV report generation.
          </p>
        </div>

        {/* Quick CSV Export Master Button */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleDownloadCsv('executive')}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer"
            aria-label="Download Executive Comprehensive CSV Report"
          >
            <Download className="w-4 h-4" />
            <span>Download All-In-One Audit CSV</span>
          </button>
        </div>
      </div>

      {/* Dedicated CSV Report Generation & Export Panel */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-800 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Pushkaralu 2027 CSV Report Generation Hub
              </h2>
              <p className="text-xs text-slate-400">
                Generate and download RFC 4180 compliant CSV spreadsheets for administrative audit, response trend analysis, and crowd safety reviews.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700 font-mono">
              Ready: {exportIncidents.length} Records
            </span>
            <button
              onClick={() => setShowPreviewModal(!showPreviewModal)}
              className="flex items-center gap-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 px-3 py-1 rounded-full font-semibold transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showPreviewModal ? 'Hide Sample' : 'Preview Sample'}</span>
            </button>
          </div>
        </div>

        {/* Export Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Incident Category Filter
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Categories ({incidents.length})</option>
              {Object.keys(categoryCounts).map((cat) => (
                <option key={cat} value={cat}>
                  {cat} ({categoryCounts[cat]})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Priority Filter
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical Priority ({priorityCounts.Critical})</option>
              <option value="High">High Priority ({priorityCounts.High})</option>
              <option value="Medium">Medium Priority ({priorityCounts.Medium})</option>
              <option value="Low">Low Priority ({priorityCounts.Low})</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Status Filter
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted ({statusCounts.Submitted})</option>
              <option value="Under Review">Under Review ({statusCounts['Under Review']})</option>
              <option value="Verified">Verified ({statusCounts.Verified})</option>
              <option value="Assigned">Assigned ({statusCounts.Assigned})</option>
              <option value="Response in Progress">In Progress ({statusCounts['Response in Progress']})</option>
              <option value="Resolved">Resolved ({statusCounts.Resolved})</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Active Evaluation Window
            </label>
            <div className="bg-slate-800/80 border border-slate-700 text-slate-300 rounded-xl p-2.5 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span className="truncate">Pushkaralu 2027 Prototype</span>
            </div>
          </div>
        </div>

        {/* 4 Targeted CSV Download Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Card 1: All-In-One Comprehensive */}
          <div className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700 p-4 rounded-2xl flex flex-col justify-between space-y-3 transition">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                Full Summary
              </span>
              <h3 className="font-bold text-white text-sm">Executive Audit CSV</h3>
              <p className="text-[11px] text-slate-400">
                Comprehensive export combining Incidents, Responder Units, and Ghat Telemetry in a single audit document.
              </p>
            </div>
            <button
              onClick={() => handleDownloadCsv('executive')}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Executive CSV</span>
            </button>
          </div>

          {/* Card 2: Incident Triage Log */}
          <div className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700 p-4 rounded-2xl flex flex-col justify-between space-y-3 transition">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">
                Incident Triage
              </span>
              <h3 className="font-bold text-white text-sm">Incident Records CSV</h3>
              <p className="text-[11px] text-slate-400">
                Raw incident logs with GPS coordinates, AI classification summaries, reporter tags, and operator directives.
              </p>
            </div>
            <button
              onClick={() => handleDownloadCsv('incidents')}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Incidents ({exportIncidents.length})</span>
            </button>
          </div>

          {/* Card 3: Response Team Performance */}
          <div className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700 p-4 rounded-2xl flex flex-col justify-between space-y-3 transition">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                Field Units
              </span>
              <h3 className="font-bold text-white text-sm">Response Unit Trends CSV</h3>
              <p className="text-[11px] text-slate-400">
                Team readiness metrics, assigned vs resolved case breakdowns, lead officer names, and station depots.
              </p>
            </div>
            <button
              onClick={() => handleDownloadCsv('teams')}
              className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Units ({responseTeams.length})</span>
            </button>
          </div>

          {/* Card 4: Ghat Congestion Trends */}
          <div className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700 p-4 rounded-2xl flex flex-col justify-between space-y-3 transition">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/60">
                Crowd & Water
              </span>
              <h3 className="font-bold text-white text-sm">Ghat Telemetry CSV</h3>
              <p className="text-[11px] text-slate-400">
                Capacity ratios, queue delay estimates, water current warning states, and holding pen telemetry across 7 ghats.
              </p>
            </div>
            <button
              onClick={() => handleDownloadCsv('ghats')}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Ghats ({ghatCrowdZones.length})</span>
            </button>
          </div>
        </div>

        {/* Live Sample Preview Table */}
        {showPreviewModal && (
          <div className="bg-slate-950/80 border border-slate-700/80 rounded-2xl p-4 text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span>CSV Sample Preview (First 3 Matching Records):</span>
              <span className="text-[11px] text-slate-500">Columns: ID, Category, Priority, Status, Location, Team</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px] text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-1 px-2">ID</th>
                    <th className="py-1 px-2">Category</th>
                    <th className="py-1 px-2">Priority</th>
                    <th className="py-1 px-2">Status</th>
                    <th className="py-1 px-2">Location</th>
                    <th className="py-1 px-2">Assigned Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {exportIncidents.slice(0, 3).map((inc) => (
                    <tr key={inc.incidentId}>
                      <td className="py-1 px-2 text-blue-400">{inc.incidentId}</td>
                      <td className="py-1 px-2">{inc.category}</td>
                      <td className="py-1 px-2">{inc.verifiedPriority || inc.priority}</td>
                      <td className="py-1 px-2">{inc.status}</td>
                      <td className="py-1 px-2 truncate max-w-xs">{inc.location}</td>
                      <td className="py-1 px-2 truncate max-w-xs">{inc.assignedTeamName || 'Unassigned'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Analytics Visual Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Incidents by Category */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base">Incidents by Category</h3>
            <span className="text-xs font-semibold text-slate-500">Total: {incidents.length}</span>
          </div>
          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / incidents.length) * 100);
              return (
                <div key={cat} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-800">{cat}</span>
                    <span className="text-slate-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Incidents by Priority */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base">Incidents by Priority</h3>
            <span className="text-xs font-semibold text-slate-500">Triage Classification</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-red-50 p-4 rounded-2xl border border-red-200 space-y-1">
              <span className="text-red-700 font-bold uppercase text-[10px]">Critical</span>
              <p className="text-2xl font-black text-red-600">{priorityCounts.Critical}</p>
              <p className="text-slate-500 text-[11px]">Immediate life threat triage</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-1">
              <span className="text-amber-800 font-bold uppercase text-[10px]">High</span>
              <p className="text-2xl font-black text-amber-700">{priorityCounts.High}</p>
              <p className="text-slate-500 text-[11px]">Rapid dispatch priority</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 space-y-1">
              <span className="text-blue-800 font-bold uppercase text-[10px]">Medium</span>
              <p className="text-2xl font-black text-blue-700">{priorityCounts.Medium}</p>
              <p className="text-slate-500 text-[11px]">Standard medical / crowd aid</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-700 font-bold uppercase text-[10px]">Low</span>
              <p className="text-2xl font-black text-slate-800">{priorityCounts.Low}</p>
              <p className="text-slate-500 text-[11px]">Minor logistics / queries</p>
            </div>
          </div>
        </div>

        {/* Status Pipeline Flow */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base">
              Incident Lifecycle & Status Progression
            </h3>
            <span className="text-xs font-semibold text-slate-500">Pipeline Distribution</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs">
            {Object.entries(statusCounts).map(([st, count]) => (
              <div key={st} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold text-[11px] block truncate">{st}</span>
                <p className="text-xl font-black text-slate-900">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
