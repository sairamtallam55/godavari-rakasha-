import test from 'node:test';
import assert from 'node:assert/strict';
import {
  categorizeLogAction,
  filterAuditLogs,
  generateAuditLogsCsv,
} from './auditLogic';
import { IncidentAuditLog } from '../types';

test('categorizeLogAction categorizes admin actions accurately', () => {
  assert.equal(categorizeLogAction('Status Changed to Assigned'), 'Status Change');
  assert.equal(categorizeLogAction('Priority Verified as Critical'), 'Priority Update');
  assert.equal(categorizeLogAction('Assigned to 108 Emergency Medical Alpha Unit'), 'Team Assignment');
  assert.equal(categorizeLogAction('Report Submitted'), 'Report Submitted');
  assert.equal(categorizeLogAction('AI Triage Generated'), 'AI Triage');
  assert.equal(categorizeLogAction('General Observation Logged'), 'All');
});

test('filterAuditLogs filters by actionType, role, incidentId, and keyword search', () => {
  const dummyLogs: IncidentAuditLog[] = [
    {
      logId: 'LOG-1',
      incidentId: 'INC-2027-1001',
      action: 'Status Changed to Assigned',
      performedBy: 'Control Room Operator',
      role: 'admin',
      timestamp: '2026-11-08T10:00:00Z',
      notes: 'Dispatched 108 team',
    },
    {
      logId: 'LOG-2',
      incidentId: 'INC-2027-1002',
      action: 'Priority Verified as High',
      performedBy: 'Officer Rajesh',
      role: 'admin',
      timestamp: '2026-11-08T10:05:00Z',
      notes: 'Confirmed lost child at Kotilingala',
    },
    {
      logId: 'LOG-3',
      incidentId: 'INC-2027-1001',
      action: 'Response in Progress',
      performedBy: 'Dr. Srinivas',
      role: 'responder',
      timestamp: '2026-11-08T10:10:00Z',
      notes: 'On-scene administering IV',
    },
  ];

  // Filter by actionType
  const statusLogs = filterAuditLogs(dummyLogs, { actionType: 'Status Change' });
  assert.equal(statusLogs.length, 1);
  assert.equal(statusLogs[0].logId, 'LOG-1');

  // Filter by role
  const adminLogs = filterAuditLogs(dummyLogs, { role: 'admin' });
  assert.equal(adminLogs.length, 2);

  // Filter by search query
  const searchResults = filterAuditLogs(dummyLogs, { search: 'Kotilingala' });
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].logId, 'LOG-2');

  // Filter by incident ID
  const incidentLogs = filterAuditLogs(dummyLogs, { incidentId: 'INC-2027-1001' });
  assert.equal(incidentLogs.length, 2);
});

test('generateAuditLogsCsv formats RFC 4180 audit spreadsheet', () => {
  const logs: IncidentAuditLog[] = [
    {
      logId: 'LOG-TEST-01',
      incidentId: 'INC-2027-1001',
      action: 'Status Changed to Verified',
      performedBy: 'Officer Rajesh, Lead',
      role: 'admin',
      timestamp: '2026-11-08T12:00:00Z',
      notes: 'Verified via CCTV camera 12 "Gate 3".',
    },
  ];

  const csv = generateAuditLogsCsv(logs);
  const lines = csv.split('\r\n');

  assert.ok(lines[0].includes('Log ID'));
  assert.ok(lines[0].includes('Action Performed'));
  assert.ok(lines[0].includes('Audit Reason / Directives'));

  assert.ok(lines[1].includes('"LOG-TEST-01"'));
  assert.ok(lines[1].includes('"Status Changed to Verified"'));
  assert.ok(lines[1].includes('"Officer Rajesh, Lead"'));
  assert.ok(lines[1].includes('"Verified via CCTV camera 12 ""Gate 3""."'));
});
