import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dataStore, IncidentRecord, MissingPersonRecord, AnnouncementRecord } from './src/server/dataStore';
import { classifyIncidentWithAI, generateSafetyAssistantResponse } from './src/server/geminiService';
import { canTransitionStatus, generateIncidentId, IncidentStatus, PriorityLevel, UserRole } from './src/utils/incidentLogic';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Godavari Raksha Public Safety Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 1. INCIDENTS API
app.get('/api/incidents', (req: Request, res: Response) => {
  const { category, priority, status, search } = req.query;
  let items = [...dataStore.incidents];

  if (category && typeof category === 'string' && category !== 'All') {
    items = items.filter((i) => i.category.toLowerCase() === category.toLowerCase());
  }
  if (priority && typeof priority === 'string' && priority !== 'All') {
    items = items.filter((i) => (i.verifiedPriority || i.priority).toLowerCase() === priority.toLowerCase());
  }
  if (status && typeof status === 'string' && status !== 'All') {
    items = items.filter((i) => i.status.toLowerCase() === status.toLowerCase());
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    items = items.filter(
      (i) =>
        i.incidentId.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    count: items.length,
    incidents: items,
  });
});

app.get('/api/incidents/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const incident = dataStore.incidents.find((i) => i.incidentId === id);
  if (!incident) {
    return res.status(404).json({ success: false, error: `Incident ${id} not found` });
  }
  const logs = dataStore.logs.filter((l) => l.incidentId === id);
  res.json({ success: true, incident, logs });
});

// All System Activity & Audit Logs
app.get('/api/activity-logs', (req: Request, res: Response) => {
  const { incidentId, role, action, search } = req.query;
  let items = [...dataStore.logs];

  if (incidentId && typeof incidentId === 'string' && incidentId !== 'All') {
    items = items.filter((l) => l.incidentId.toLowerCase() === incidentId.toLowerCase());
  }
  if (role && typeof role === 'string' && role !== 'All') {
    items = items.filter((l) => l.role.toLowerCase() === role.toLowerCase());
  }
  if (action && typeof action === 'string' && action !== 'All') {
    items = items.filter((l) => l.action.toLowerCase().includes(action.toLowerCase()));
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    items = items.filter(
      (l) =>
        l.incidentId.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.performedBy.toLowerCase().includes(q) ||
        (l.notes && l.notes.toLowerCase().includes(q))
    );
  }

  // Ensure strict chronological sort (most recent first)
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json({
    success: true,
    count: items.length,
    logs: items,
  });
});

app.post('/api/incidents', async (req: Request, res: Response) => {
  console.log('[DEBUG] POST /api/incidents received, body:', req.body);
  try {
    const {
      category,
      description,
      location,
      latitude,
      longitude,
      reporterName,
      reporterPhone,
      photoUrl,
    } = req.body || {};

    if (!description || description.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Incident description is required.' });
    }

    // 1. Run AI incident classification
    const aiResult = await classifyIncidentWithAI(description, location, category);

    // 2. Generate ID & record
    const incidentId = generateIncidentId('INC-2027');
    const newIncident: IncidentRecord = {
      incidentId,
      category: (category && category !== 'Other emergency' ? category : aiResult.category) || 'Other emergency',
      description,
      location: location || 'Godavari Ghat Precinct, Rajahmundry',
      latitude: Number(latitude) || 17.0005,
      longitude: Number(longitude) || 81.7725,
      priority: aiResult.priority || 'Medium',
      status: 'Submitted',
      aiSuggestion: aiResult,
      reporterName: reporterName || 'Anonymous Pilgrim',
      reporterPhone: reporterPhone || '',
      photoUrl: photoUrl || '',
      isDemoData: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dataStore.addIncident(newIncident);

    // 3. Log audit trail
    dataStore.addLog(
      incidentId,
      'Report Submitted',
      reporterName || 'Public Pilgrim',
      'public',
      'Incident logged via Godavari Raksha Public Portal'
    );
    dataStore.addLog(
      incidentId,
      'AI Incident Classification',
      aiResult.isFallback ? 'Deterministic Fallback Classifier' : 'Gemini 3.8 Flash AI Engine',
      'system',
      `Identified category: ${aiResult.category} | Priority: ${aiResult.priority} | Team: ${aiResult.recommendedTeam}`
    );

    res.status(201).json({
      success: true,
      message: 'Emergency report successfully submitted and queued for operator verification.',
      incident: newIncident,
    });
  } catch (err) {
    console.error('[API] Error creating incident:', err);
    res.status(500).json({ success: false, error: 'Internal server error processing emergency report.' });
  }
});

app.patch('/api/incidents/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    status,
    verifiedPriority,
    assignedTeamId,
    assignedTeamName,
    operatorNotes,
    responderNotes,
    performedBy,
    role,
  } = req.body;

  const existing = dataStore.incidents.find((i) => i.incidentId === id);
  if (!existing) {
    return res.status(404).json({ success: false, error: `Incident ${id} not found` });
  }

  const userRole: UserRole = (role as UserRole) || 'admin';
  const targetStatus: IncidentStatus = (status as IncidentStatus) || existing.status;

  // Validate status transition if status is changing
  if (status && status !== existing.status) {
    const check = canTransitionStatus(existing.status, targetStatus, userRole);
    if (!check.allowed) {
      return res.status(403).json({
        success: false,
        error: check.reason || 'Unauthorized status transition.',
      });
    }
  }

  const updates: Partial<IncidentRecord> = {};
  if (status) updates.status = status;
  if (verifiedPriority) updates.verifiedPriority = verifiedPriority;
  if (assignedTeamId) {
    updates.assignedTeamId = assignedTeamId;
    updates.assignedTeamName = assignedTeamName;
    // update response team status
    dataStore.updateResponseTeam(assignedTeamId, {
      availability: 'Responding',
      currentIncidentId: id,
    });
  }
  if (operatorNotes !== undefined) updates.operatorNotes = operatorNotes;
  if (responderNotes !== undefined) updates.responderNotes = responderNotes;

  const updated = dataStore.updateIncident(id, updates);

  // Add audit log
  let actionDescription = 'Incident Updated';
  if (status && status !== existing.status) actionDescription = `Status Changed to ${status}`;
  else if (verifiedPriority && verifiedPriority !== existing.verifiedPriority) actionDescription = `Priority Verified as ${verifiedPriority}`;
  else if (assignedTeamId && assignedTeamId !== existing.assignedTeamId) actionDescription = `Assigned to ${assignedTeamName || assignedTeamId}`;

  dataStore.addLog(
    id,
    actionDescription,
    performedBy || (userRole === 'admin' ? 'Control Room Operator' : 'Assigned Responder'),
    userRole,
    operatorNotes || responderNotes || `Updated field: ${Object.keys(updates).join(', ')}`
  );

  res.json({ success: true, incident: updated });
});

// 2. RESPONSE TEAMS API
app.get('/api/response-teams', (_req: Request, res: Response) => {
  res.json({ success: true, teams: dataStore.responseTeams });
});

app.patch('/api/response-teams/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { availability, leadOfficer, contactNumber } = req.body;
  const updated = dataStore.updateResponseTeam(id, {
    ...(availability ? { availability } : {}),
    ...(leadOfficer ? { leadOfficer } : {}),
    ...(contactNumber ? { contactNumber } : {}),
  });
  if (!updated) return res.status(404).json({ success: false, error: 'Team not found' });
  res.json({ success: true, team: updated });
});

// 3. MISSING PERSONS API
app.get('/api/missing-persons', (req: Request, res: Response) => {
  const { role } = req.query;
  const isAuthorized = role === 'admin' || role === 'responder';

  // Sanitize contact info for public view to protect citizen privacy
  const sanitized = dataStore.missingPersons.map((p) => {
    if (isAuthorized) return p;
    return {
      ...p,
      reporterPhone: 'Protected (Contact Control Desk)',
      reporterName: p.reporterName.split(' ')[0] + ' (Relative)',
    };
  });

  res.json({ success: true, cases: sanitized });
});

app.post('/api/missing-persons', (req: Request, res: Response) => {
  const {
    fullName,
    age,
    gender,
    lastSeenLocation,
    lastSeenTime,
    clothingDescription,
    identifyingFeatures,
    reporterName,
    reporterPhone,
    reporterRelationship,
    photoUrl,
  } = req.body;

  if (!fullName || !lastSeenLocation) {
    return res.status(400).json({ success: false, error: 'Full name and last seen location are required.' });
  }

  const caseId = generateIncidentId('MP-2027');
  const record: MissingPersonRecord = {
    caseId,
    fullName,
    age: Number(age) || 0,
    gender: gender || 'Male',
    lastSeenLocation,
    lastSeenTime: lastSeenTime || 'Just now',
    clothingDescription: clothingDescription || 'Not specified',
    identifyingFeatures: identifyingFeatures || '',
    reporterName: reporterName || 'Family Member',
    reporterPhone: reporterPhone || '',
    reporterRelationship: reporterRelationship || 'Relative',
    photoUrl: photoUrl || '',
    status: 'Active Search',
    caseNotes: 'Reported via public missing person intake portal.',
    isDemoData: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  dataStore.addMissingPerson(record);
  res.status(201).json({ success: true, case: record });
});

app.patch('/api/missing-persons/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, caseNotes } = req.body;
  const updated = dataStore.updateMissingPerson(id, {
    ...(status ? { status } : {}),
    ...(caseNotes ? { caseNotes } : {}),
  });
  if (!updated) return res.status(404).json({ success: false, error: 'Case not found' });
  res.json({ success: true, case: updated });
});

// 4. ANNOUNCEMENTS API
app.get('/api/announcements', (_req: Request, res: Response) => {
  const activeAnnouncements = dataStore.announcements.filter((a) => a.active);
  res.json({ success: true, announcements: activeAnnouncements });
});

app.post('/api/announcements', (req: Request, res: Response) => {
  const { category, title, message, priority, language, publishedBy } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, error: 'Title and message are required.' });
  }

  const record: AnnouncementRecord = {
    announcementId: `ANN-${Date.now().toString().slice(-4)}`,
    category: category || 'General Safety Notice',
    title,
    message,
    priority: priority || 'General',
    language: language || 'English',
    publishedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    active: true,
    publishedBy: publishedBy || 'Godavari Pushkaralu Command Center',
  };

  dataStore.addAnnouncement(record);
  res.status(201).json({ success: true, announcement: record });
});

// 5. FACILITIES API
app.get('/api/facilities', (req: Request, res: Response) => {
  const { category } = req.query;
  let list = dataStore.facilities;
  if (category && typeof category === 'string' && category !== 'All') {
    list = list.filter((f) => f.category === category);
  }
  res.json({ success: true, facilities: list });
});

// 6. CROWD ZONES & OBSERVATION API
app.get('/api/crowd-zones', (_req: Request, res: Response) => {
  res.json({ success: true, zones: dataStore.ghatCrowdZones });
});

app.post('/api/crowd-zones/observation', (req: Request, res: Response) => {
  const { ghatId, deltaVisitors } = req.body;
  const updated = dataStore.updateGhatCrowd(ghatId, Number(deltaVisitors) || 500);
  if (!updated) return res.status(404).json({ success: false, error: 'Ghat not found' });
  res.json({ success: true, zone: updated });
});

// 7. MULTILINGUAL AI ASSISTANT API
app.post('/api/ai/assistant', async (req: Request, res: Response) => {
  try {
    const { message, preferredLanguage, history } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message query is required' });
    }
    const result = await generateSafetyAssistantResponse(message, preferredLanguage || 'English', history || []);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[AI Assistant API Error]:', err);
    res.status(500).json({ success: false, error: 'Error generating AI response.' });
  }
});

// 8. STANDALONE AI CLASSIFICATION TEST
app.post('/api/ai/classify', async (req: Request, res: Response) => {
  const { description, location, category } = req.body;
  if (!description) return res.status(400).json({ error: 'Description required' });
  const result = await classifyIncidentWithAI(description, location, category);
  res.json({ success: true, result });
});

// 9. DEMO RESET API
app.post('/api/demo/reset', (_req: Request, res: Response) => {
  dataStore.resetToSeed();
  res.json({ success: true, message: 'All demo datasets reset to initial Godavari Pushkaralu seed state.' });
});

// VITE MIDDLEWARE SETUP FOR DEV / PROD
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Godavari Raksha] Server running on http://0.0.0.0:${PORT} (mode: ${isDev ? 'dev' : 'production'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
