import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyIncidentDeterministic,
  canTransitionStatus,
  calculateCrowdSafetyStatus,
  generateIncidentId,
} from './incidentLogic';

test('deterministic classifier identifies lost child emergency with High priority', () => {
  const result = classifyIncidentDeterministic(
    'A 6-year-old child wearing a yellow shirt went missing near Pushkar Ghat gate 4'
  );
  assert.equal(result.category, 'Lost child');
  assert.equal(result.priority, 'High');
  assert.equal(result.recommendedTeam, 'Lost & Found Unit');
  assert.equal(result.isFallback, true);
  assert.ok(result.safetyConcerns.length > 0);
});

test('deterministic classifier identifies medical distress with Critical priority', () => {
  const result = classifyIncidentDeterministic(
    'Pilgrim has severe chest pain and collapsed, breathing heavily near Kotilingala steps'
  );
  assert.equal(result.category, 'Medical emergency');
  assert.equal(result.priority, 'Critical');
  assert.equal(result.recommendedTeam, 'Medical First Responders (108)');
});

test('deterministic classifier identifies river drowning danger with Critical priority and SDRF team', () => {
  const result = classifyIncidentDeterministic(
    'Young bather caught in deep river whirlpool current past safety ropes at Kovvur ghat'
  );
  assert.equal(result.category, 'Accident');
  assert.equal(result.priority, 'Critical');
  assert.equal(result.recommendedTeam, 'River Rescue & SDRF Boat Unit');
});

test('canTransitionStatus allows admin to verify a submitted report and reject invalid responder transitions', () => {
  // Public cannot transition
  const publicAttempt = canTransitionStatus('Submitted', 'Verified', 'public');
  assert.equal(publicAttempt.allowed, false);

  // Admin can move Submitted -> Verified
  const adminVerify = canTransitionStatus('Submitted', 'Verified', 'admin');
  assert.equal(adminVerify.allowed, true);

  // Responder can only transition Assigned -> Response in Progress
  const responderProgress = canTransitionStatus('Assigned', 'Response in Progress', 'responder');
  assert.equal(responderProgress.allowed, true);

  // Responder cannot reject an incident
  const responderReject = canTransitionStatus('Assigned', 'Rejected', 'responder');
  assert.equal(responderReject.allowed, false);
});

test('calculateCrowdSafetyStatus calculates correct status and advisories', () => {
  const normal = calculateCrowdSafetyStatus(35);
  assert.equal(normal.status, 'Normal');

  const moderate = calculateCrowdSafetyStatus(60);
  assert.equal(moderate.status, 'Moderate');

  const heavy = calculateCrowdSafetyStatus(80);
  assert.equal(heavy.status, 'Heavy');

  const critical = calculateCrowdSafetyStatus(95);
  assert.equal(critical.status, 'Critical');
});

test('generateIncidentId produces expected prefix and format', () => {
  const id = generateIncidentId('INC-2027');
  assert.match(id, /^INC-2027-\d{4}$/);
});
