import test from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeCsvField,
  generateIncidentCsv,
  generateResponseTeamPerformanceCsv,
  generateGhatCrowdTrendsCsv,
  generateExecutiveSummaryCsv,
} from './csvExport';
import { Incident, ResponseTeam, GhatCrowdZone } from '../types';

test('escapeCsvField escapes strings with quotes, commas, and newlines properly', () => {
  assert.equal(escapeCsvField('normal text'), '"normal text"');
  assert.equal(escapeCsvField('text, with comma'), '"text, with comma"');
  assert.equal(escapeCsvField('text with "quotes" inside'), '"text with ""quotes"" inside"');
  assert.equal(escapeCsvField('multi\nline\rvalue'), '"multi\nline\rvalue"');
  assert.equal(escapeCsvField(null), '""');
  assert.equal(escapeCsvField(undefined), '""');
  assert.equal(escapeCsvField(42), '"42"');
});

test('generateIncidentCsv generates valid header and escaped incident rows', () => {
  const dummyIncidents: Incident[] = [
    {
      incidentId: 'INC-2027-9999',
      category: 'Medical emergency',
      description: 'Patient has severe heat stroke, "needs oxygen" near Gate 1.',
      location: 'Pushkar Ghat, Main Gate, Rajahmundry',
      latitude: 17.0005,
      longitude: 81.7725,
      priority: 'Critical',
      verifiedPriority: 'Critical',
      status: 'Response in Progress',
      assignedTeamName: '108 Alpha Unit',
      assignedTeamId: 'TEAM-108-A',
      reporterName: 'Suresh, Volunteer',
      reporterPhone: '+91 98480 12345',
      operatorNotes: 'Dispatched stretcher cart',
      responderNotes: 'En route',
      isDemoData: true,
      createdAt: '2026-11-08T10:00:00Z',
      updatedAt: '2026-11-08T10:05:00Z',
    },
  ];

  const csv = generateIncidentCsv(dummyIncidents);
  const lines = csv.split('\r\n');

  // Verify header exists
  assert.ok(lines[0].includes('Incident ID'));
  assert.ok(lines[0].includes('Reported Priority'));
  assert.ok(lines[0].includes('Verified Priority'));

  // Verify escaped row content
  assert.ok(lines[1].includes('"INC-2027-9999"'));
  assert.ok(lines[1].includes('"Patient has severe heat stroke, ""needs oxygen"" near Gate 1."'));
  assert.ok(lines[1].includes('"Pushkar Ghat, Main Gate, Rajahmundry"'));
  assert.ok(lines[1].includes('"108 Alpha Unit"'));
});

test('generateResponseTeamPerformanceCsv calculates active and resolved counts accurately', () => {
  const teams: ResponseTeam[] = [
    {
      teamId: 'TEAM-01',
      teamName: 'SDRF River Patrol',
      category: 'River Rescue',
      availability: 'On Duty',
      contactNumber: '112',
      leadOfficer: 'Inspector Rao',
      stationLocation: 'Pushkar Ghat Jetty',
      activeAssignmentsCount: 1,
    },
  ];

  const incidents: Incident[] = [
    {
      incidentId: 'INC-01',
      category: 'Accident',
      description: 'Swimmer slipped',
      location: 'Pushkar Ghat',
      latitude: 17.0,
      longitude: 81.7,
      priority: 'Critical',
      status: 'Resolved',
      assignedTeamId: 'TEAM-01',
      assignedTeamName: 'SDRF River Patrol',
      isDemoData: true,
      createdAt: '2026-11-08T10:00:00Z',
      updatedAt: '2026-11-08T10:15:00Z',
    },
    {
      incidentId: 'INC-02',
      category: 'Accident',
      description: 'Boat assist',
      location: 'Kovvur',
      latitude: 17.01,
      longitude: 81.76,
      priority: 'High',
      status: 'Response in Progress',
      assignedTeamId: 'TEAM-01',
      assignedTeamName: 'SDRF River Patrol',
      isDemoData: true,
      createdAt: '2026-11-08T11:00:00Z',
      updatedAt: '2026-11-08T11:10:00Z',
    },
  ];

  const csv = generateResponseTeamPerformanceCsv(teams, incidents);
  const lines = csv.split('\r\n');

  assert.ok(lines[0].includes('Team Name'));
  assert.ok(lines[1].includes('"TEAM-01"'));
  assert.ok(lines[1].includes('"SDRF River Patrol"'));
  // Assigned: 2, Active: 1, Resolved: 1
  assert.ok(lines[1].includes('"2"'));
  assert.ok(lines[1].includes('"1"'));
});

test('generateGhatCrowdTrendsCsv includes all telemetry metrics', () => {
  const zones: GhatCrowdZone[] = [
    {
      ghatId: 'GHAT-01',
      name: 'Pushkar Ghat',
      district: 'Central',
      maxCapacity: 35000,
      currentVisitors: 32000,
      occupancyPercent: 91,
      status: 'Critical',
      waterFlowStatus: 'Moderate Currents',
      holdingAreaActive: true,
      estimatedWaitMinutes: 45,
      lastUpdated: '10:30 AM',
      latitude: 17.0005,
      longitude: 81.7725,
    },
  ];

  const csv = generateGhatCrowdTrendsCsv(zones);
  assert.ok(csv.includes('Ghat ID'));
  assert.ok(csv.includes('Pushkar Ghat'));
  assert.ok(csv.includes('"91%"'));
  assert.ok(csv.includes('"Critical"'));
  assert.ok(csv.includes('"YES"'));
});

test('generateExecutiveSummaryCsv produces multi-section summary report', () => {
  const csv = generateExecutiveSummaryCsv([], [], []);
  assert.ok(csv.includes('=== GODAVARI PUSHKARALU 2027 PUBLIC SAFETY REPORT ==='));
  assert.ok(csv.includes('--- INCIDENTS MASTER LOG ---'));
  assert.ok(csv.includes('--- RESPONSE TEAM DEPLOYMENT & PERFORMANCE ---'));
  assert.ok(csv.includes('--- GHAT CONGESTION & WATER SAFETY TELEMETRY ---'));
});
