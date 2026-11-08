import { IncidentAuditLog } from '../types';
import { escapeCsvField } from './csvExport';

export type AuditActionType = 'All' | 'Status Change' | 'Team Assignment' | 'Priority Update' | 'Report Submitted' | 'AI Triage';

/**
 * Categorizes an audit log action into a standardized action type
 */
export function categorizeLogAction(action: string): AuditActionType {
  const act = (action || '').toLowerCase();
  if (act.includes('status')) return 'Status Change';
  if (act.includes('assigned') || act.includes('team')) return 'Team Assignment';
  if (act.includes('priority')) return 'Priority Update';
  if (act.includes('submitted')) return 'Report Submitted';
  if (act.includes('ai') || act.includes('triage')) return 'AI Triage';
  return 'All';
}

export interface AuditLogFilterOptions {
  actionType?: AuditActionType;
  role?: string;
  search?: string;
  incidentId?: string;
}

/**
 * Filters audit logs deterministically based on action type, role, and search query
 */
export function filterAuditLogs(
  logs: IncidentAuditLog[],
  options: AuditLogFilterOptions = {}
): IncidentAuditLog[] {
  const { actionType = 'All', role = 'All', search = '', incidentId = '' } = options;
  const q = search.trim().toLowerCase();

  return logs.filter((log) => {
    // 1. Action type filter
    if (actionType !== 'All') {
      const detected = categorizeLogAction(log.action);
      if (detected !== actionType) return false;
    }

    // 2. Role filter
    if (role !== 'All') {
      if (log.role.toLowerCase() !== role.toLowerCase()) return false;
    }

    // 3. Incident ID filter
    if (incidentId && incidentId !== 'All') {
      if (log.incidentId.toLowerCase() !== incidentId.toLowerCase()) return false;
    }

    // 4. Search query
    if (q) {
      const match =
        log.incidentId.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.performedBy.toLowerCase().includes(q) ||
        (log.notes && log.notes.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });
}

/**
 * Generates an RFC 4180 CSV export for activity audit logs
 */
export function generateAuditLogsCsv(logs: IncidentAuditLog[]): string {
  const headers = [
    'Log ID',
    'Timestamp (UTC)',
    'Action Performed',
    'Incident ID',
    'Performed By',
    'Role / Authority',
    'Audit Reason / Directives',
  ];

  const rows = logs.map((log) => [
    log.logId,
    log.timestamp,
    log.action,
    log.incidentId,
    log.performedBy,
    log.role,
    log.notes || '',
  ]);

  const csvRows = [
    headers.map(escapeCsvField).join(','),
    ...rows.map((row) => row.map(escapeCsvField).join(',')),
  ];

  return csvRows.join('\r\n');
}
