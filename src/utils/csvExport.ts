import { Incident, ResponseTeam, GhatCrowdZone } from '../types';

/**
 * Escapes a single CSV value compliant with RFC 4180
 */
export function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  // If value contains comma, quotes, or newlines, quote it and double any quotes
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Generates CSV string for Incidents & Triage Data
 */
export function generateIncidentCsv(incidents: Incident[]): string {
  const headers = [
    'Incident ID',
    'Category',
    'Reported Priority',
    'Verified Priority',
    'Current Status',
    'Location / Landmark',
    'Latitude',
    'Longitude',
    'Description',
    'AI Summary',
    'AI Safety Concerns',
    'AI Recommended Unit',
    'Assigned Team Name',
    'Assigned Team ID',
    'Reporter Name',
    'Reporter Phone',
    'Operator Directives',
    'Field Responder Notes',
    'Logged At (UTC)',
    'Last Updated At (UTC)',
  ];

  const rows = incidents.map((inc) => [
    inc.incidentId,
    inc.category,
    inc.priority,
    inc.verifiedPriority || 'Unverified',
    inc.status,
    inc.location,
    inc.latitude,
    inc.longitude,
    inc.description,
    inc.aiSuggestion?.summary || '',
    inc.aiSuggestion?.safetyConcerns?.join('; ') || '',
    inc.aiSuggestion?.recommendedTeam || '',
    inc.assignedTeamName || 'Unassigned',
    inc.assignedTeamId || 'None',
    inc.reporterName || 'Anonymous',
    inc.reporterPhone || 'Unprovided',
    inc.operatorNotes || '',
    inc.responderNotes || '',
    inc.createdAt,
    inc.updatedAt,
  ]);

  const csvRows = [
    headers.map(escapeCsvField).join(','),
    ...rows.map((row) => row.map(escapeCsvField).join(',')),
  ];

  return csvRows.join('\r\n');
}

/**
 * Generates CSV string for Response Team Performance & Deployment Trends
 */
export function generateResponseTeamPerformanceCsv(
  teams: ResponseTeam[],
  incidents: Incident[]
): string {
  const headers = [
    'Team ID',
    'Team Name',
    'Unit Category',
    'Readiness Status',
    'Station Base Location',
    'Lead Officer',
    'Direct Hotline',
    'Assigned Incidents Count',
    'Active In-Field Cases',
    'Resolved Cases',
    'Current Active Incident ID',
  ];

  const rows = teams.map((team) => {
    const teamIncidents = incidents.filter((i) => i.assignedTeamId === team.teamId);
    const resolvedCount = teamIncidents.filter((i) => i.status === 'Resolved').length;
    const activeCount = teamIncidents.filter((i) => i.status !== 'Resolved' && i.status !== 'Rejected').length;

    return [
      team.teamId,
      team.teamName,
      team.category,
      team.availability,
      team.stationLocation,
      team.leadOfficer,
      team.contactNumber,
      teamIncidents.length,
      activeCount,
      resolvedCount,
      team.currentIncidentId || 'None',
    ];
  });

  const csvRows = [
    headers.map(escapeCsvField).join(','),
    ...rows.map((row) => row.map(escapeCsvField).join(',')),
  ];

  return csvRows.join('\r\n');
}

/**
 * Generates CSV string for Ghat Congestion & Water Safety Telemetry Trends
 */
export function generateGhatCrowdTrendsCsv(zones: GhatCrowdZone[]): string {
  const headers = [
    'Ghat ID',
    'Ghat Name',
    'District / Sector',
    'Max Safe Capacity',
    'Current Estimated Bathers',
    'Occupancy Percentage',
    'Crowd Safety Status',
    'River Water Flow Status',
    'Holding Pen Gating Active',
    'Estimated Queue Wait (Minutes)',
    'Latitude',
    'Longitude',
    'Telemetry Last Updated',
  ];

  const rows = zones.map((zone) => [
    zone.ghatId,
    zone.name,
    zone.district,
    zone.maxCapacity,
    zone.currentVisitors,
    `${zone.occupancyPercent}%`,
    zone.status,
    zone.waterFlowStatus,
    zone.holdingAreaActive ? 'YES' : 'NO',
    zone.estimatedWaitMinutes,
    zone.latitude,
    zone.longitude,
    zone.lastUpdated,
  ]);

  const csvRows = [
    headers.map(escapeCsvField).join(','),
    ...rows.map((row) => row.map(escapeCsvField).join(',')),
  ];

  return csvRows.join('\r\n');
}

/**
 * Generates an All-in-One Executive Audit Report CSV
 */
export function generateExecutiveSummaryCsv(
  incidents: Incident[],
  teams: ResponseTeam[],
  zones: GhatCrowdZone[]
): string {
  const total = incidents.length;
  const critical = incidents.filter((i) => (i.verifiedPriority || i.priority) === 'Critical').length;
  const high = incidents.filter((i) => (i.verifiedPriority || i.priority) === 'High').length;
  const resolved = incidents.filter((i) => i.status === 'Resolved').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const sections: string[] = [];

  // 1. Executive Summary Block
  sections.push('=== GODAVARI PUSHKARALU 2027 PUBLIC SAFETY REPORT ===');
  sections.push(`Generated On: ${new Date().toISOString()}`);
  sections.push(`Total Emergency Incidents Logged: ${total}`);
  sections.push(`Critical Threat Incidents: ${critical}`);
  sections.push(`High Priority Incidents: ${high}`);
  sections.push(`Resolved Cases: ${resolved} (${resolutionRate}% Resolution Rate)`);
  sections.push(`Deployed Response Units: ${teams.length}`);
  sections.push(`Monitored Ghat Sectors: ${zones.length}`);
  sections.push('NOTE: All data points reflect prototype evaluation telemetry.');
  sections.push('');

  // 2. Incident Summary Block
  sections.push('--- INCIDENTS MASTER LOG ---');
  sections.push(generateIncidentCsv(incidents));
  sections.push('');

  // 3. Response Team Summary Block
  sections.push('--- RESPONSE TEAM DEPLOYMENT & PERFORMANCE ---');
  sections.push(generateResponseTeamPerformanceCsv(teams, incidents));
  sections.push('');

  // 4. Ghat Crowd Telemetry Block
  sections.push('--- GHAT CONGESTION & WATER SAFETY TELEMETRY ---');
  sections.push(generateGhatCrowdTrendsCsv(zones));

  return sections.join('\r\n');
}

/**
 * Triggers browser download for generated CSV
 */
export function downloadCsvBlob(content: string, filename: string): void {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
