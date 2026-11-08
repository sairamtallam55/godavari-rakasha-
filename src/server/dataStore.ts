import {
  IncidentCategory,
  PriorityLevel,
  IncidentStatus,
  IncidentClassificationResult,
  generateIncidentId,
} from '../utils/incidentLogic';

export interface IncidentRecord {
  incidentId: string;
  category: IncidentCategory;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  priority: PriorityLevel;
  verifiedPriority?: PriorityLevel;
  status: IncidentStatus;
  aiSuggestion?: {
    category: IncidentCategory;
    priority: PriorityLevel;
    summary: string;
    safetyConcerns: string[];
    recommendedTeam: string;
    isFallback: boolean;
  };
  reporterName?: string;
  reporterPhone?: string;
  reporterId?: string;
  assignedTeamId?: string;
  assignedTeamName?: string;
  operatorNotes?: string;
  responderNotes?: string;
  photoUrl?: string;
  isDemoData: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResponseTeamRecord {
  teamId: string;
  teamName: string;
  category: string;
  availability: 'On Duty' | 'Responding' | 'Standby' | 'Off Duty';
  contactNumber: string;
  leadOfficer: string;
  currentIncidentId?: string;
  stationLocation: string;
  activeAssignmentsCount: number;
}

export interface MissingPersonRecord {
  caseId: string;
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  lastSeenLocation: string;
  lastSeenTime: string;
  clothingDescription: string;
  identifyingFeatures?: string;
  reporterName: string;
  reporterPhone: string;
  reporterRelationship: string;
  photoUrl?: string;
  status: 'Active Search' | 'Under Review' | 'Located' | 'Reunited' | 'Closed';
  caseNotes?: string;
  isDemoData: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementRecord {
  announcementId: string;
  category: 'Crowd Advisory' | 'River Safety' | 'Weather Notice' | 'Missing Person Notice' | 'Emergency Instruction';
  title: string;
  message: string;
  priority: 'Urgent' | 'Advisory' | 'General';
  language: 'English' | 'Telugu' | 'Hindi';
  publishedAt: string;
  expiresAt: string;
  active: boolean;
  publishedBy: string;
}

export interface FacilityRecord {
  facilityId: string;
  name: string;
  category: 'Hospital' | 'First Aid Post' | 'Police Help Desk' | 'River Rescue Boat' | 'Drinking Water Point' | 'Lost & Found Center';
  address: string;
  latitude: number;
  longitude: number;
  contactNumber: string;
  operatingHours: string;
  capacity?: string;
  verificationStatus: 'Verified Official' | 'Demo Facility';
  isDemoData: boolean;
}

export interface GhatCrowdZone {
  ghatId: string;
  name: string;
  district: string;
  maxCapacity: number;
  currentVisitors: number;
  occupancyPercent: number;
  status: 'Normal' | 'Moderate' | 'Heavy' | 'Critical';
  waterFlowStatus: 'Safe' | 'Moderate Currents' | 'Fast Current - Alert';
  holdingAreaActive: boolean;
  estimatedWaitMinutes: number;
  lastUpdated: string;
  latitude: number;
  longitude: number;
}

export interface IncidentAuditLog {
  logId: string;
  incidentId: string;
  action: string;
  performedBy: string;
  role: string;
  timestamp: string;
  notes?: string;
}

// Initial rich synthetic datasets for Godavari Pushkaralu 2027
export function createInitialSeedData() {
  const incidents: IncidentRecord[] = [
    {
      incidentId: 'INC-2027-1001',
      category: 'Medical emergency',
      description: 'An elderly 71-year-old woman collapsed with severe dizziness and dehydration near Pushkar Ghat main entry gate 3.',
      location: 'Pushkar Ghat, Gate 3, Rajahmundry',
      latitude: 17.0005,
      longitude: 81.7725,
      priority: 'Critical',
      verifiedPriority: 'Critical',
      status: 'Response in Progress',
      aiSuggestion: {
        category: 'Medical emergency',
        priority: 'Critical',
        summary: 'Elderly pilgrim collapsed with dehydration symptoms at crowded gate.',
        safetyConcerns: ['Heat stroke / cardiovascular distress', 'Stretcher crowd obstruction'],
        recommendedTeam: '108 Emergency Medical Alpha Unit',
        isFallback: false,
      },
      reporterName: 'Suresh Kumar',
      reporterPhone: '+91 98480 12345',
      assignedTeamId: 'TEAM-108-A',
      assignedTeamName: '108 Emergency Medical Alpha Unit',
      operatorNotes: 'Verified with Pushkar Ghat gate monitor. Medical team dispatched on rapid stretcher cart.',
      responderNotes: 'Team reached scene, IV fluids administered, transferring to GGH Rajahmundry.',
      isDemoData: true,
      createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      incidentId: 'INC-2027-1002',
      category: 'Lost child',
      description: '6-year-old boy named Sai Vignesh separated from parents near Kotilingala bathing steps. Wearing yellow t-shirt and dark blue shorts.',
      location: 'Kotilingala Ghat, Bathing Block B, Rajahmundry',
      latitude: 17.0142,
      longitude: 81.7681,
      priority: 'High',
      verifiedPriority: 'High',
      status: 'Assigned',
      aiSuggestion: {
        category: 'Lost child',
        priority: 'High',
        summary: 'Young minor separated in high density bathing zone.',
        safetyConcerns: ['Proximity to deep water bath zone', 'High pilgrim surge'],
        recommendedTeam: 'Pushkaralu Lost & Found Child Support Desk',
        isFallback: false,
      },
      reporterName: 'Lakshmi Devi',
      reporterPhone: '+91 94401 56789',
      assignedTeamId: 'TEAM-LF-01',
      assignedTeamName: 'Pushkaralu Lost & Found Child Support Desk',
      operatorNotes: 'Public address announcement initiated across Kotilingala audio horns.',
      isDemoData: true,
      createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
    {
      incidentId: 'INC-2027-1003',
      category: 'Crowd congestion',
      description: 'Severe bottleneck at Saraswathi Ghat pedestrian overpass exit stairs. Incoming crowd pushing against barricades.',
      location: 'Saraswathi Ghat, Footover Bridge Stairs, Rajahmundry',
      latitude: 16.9961,
      longitude: 81.7758,
      priority: 'High',
      verifiedPriority: 'High',
      status: 'Under Review',
      aiSuggestion: {
        category: 'Crowd congestion',
        priority: 'High',
        summary: 'Surge bottleneck at footbridge stairs with risk of crush.',
        safetyConcerns: ['Choke point on elevated stairs', 'Barricade collapse risk'],
        recommendedTeam: 'Police Crowd Quick Reaction Team 3',
        isFallback: false,
      },
      reporterName: 'Ramesh Reddy',
      reporterPhone: '+91 97012 34567',
      isDemoData: true,
      createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    {
      incidentId: 'INC-2027-1004',
      category: 'Accident',
      description: 'Two pilgrims slipped beyond the cautionary yellow safety chain into river whirlpool current near Kovvur Goshpada Kshetram.',
      location: 'Goshpada Kshetram Ghat, Kovvur (West Godavari Bank)',
      latitude: 17.0092,
      longitude: 81.7611,
      priority: 'Critical',
      verifiedPriority: 'Critical',
      status: 'Resolved',
      aiSuggestion: {
        category: 'Accident',
        priority: 'Critical',
        summary: 'Bathers drifting into Godavari river current past safety chain.',
        safetyConcerns: ['High velocity river current', 'Drowning risk'],
        recommendedTeam: 'SDRF River Rescue Boat Unit 1',
        isFallback: false,
      },
      reporterName: 'Kovvur Ghat Patrol Officer',
      reporterPhone: '+91 99887 76655',
      assignedTeamId: 'TEAM-SDRF-01',
      assignedTeamName: 'SDRF River Rescue Boat Unit 1',
      operatorNotes: 'Immediate rescue boat deployment ordered.',
      responderNotes: 'Boat Unit 1 successfully deployed lifebuoys and brought both pilgrims safely to shore. Checked by paramedic.',
      isDemoData: true,
      createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    },
    {
      incidentId: 'INC-2027-1005',
      category: 'Fire emergency',
      description: 'Electrical spark and small oil fire reported at a prasadam food stall near Markandeya temple queue complex.',
      location: 'Markandeya Temple Approach Road, Rajahmundry',
      latitude: 17.0051,
      longitude: 81.7709,
      priority: 'Critical',
      verifiedPriority: 'High',
      status: 'Resolved',
      aiSuggestion: {
        category: 'Fire emergency',
        priority: 'Critical',
        summary: 'Electrical cooking stall fire near temple queue complex.',
        safetyConcerns: ['LPG cylinder nearby', 'Panic spread among queued pilgrims'],
        recommendedTeam: 'Fire & Hazard Rescue Unit 2',
        isFallback: false,
      },
      reporterName: 'Stall Vendor',
      reporterPhone: '+91 91234 56780',
      assignedTeamId: 'TEAM-FIRE-02',
      assignedTeamName: 'Fire & Hazard Rescue Unit 2',
      operatorNotes: 'Power line cut at local feeder. Mobile fire tender extinguished flame with CO2 canisters.',
      responderNotes: 'Fire completely extinguished. Area cordoned and safe.',
      isDemoData: true,
      createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    },
    {
      incidentId: 'INC-2027-1006',
      category: 'Public safety threat',
      description: 'Aggressive dispute breaking out between unregulated auto drivers and queuing pilgrims blocking ambulance route near Dowleswaram.',
      location: 'Dowleswaram Barrage Approach Junction, Rajahmundry',
      latitude: 16.9421,
      longitude: 81.7712,
      priority: 'Medium',
      verifiedPriority: 'Medium',
      status: 'Assigned',
      aiSuggestion: {
        category: 'Public safety threat',
        priority: 'Medium',
        summary: 'Traffic brawl blocking emergency transit corridor.',
        safetyConcerns: ['Ambulance lane obstruction', 'Public order'],
        recommendedTeam: 'Pushkaralu Police Traffic & Strike Team 4',
        isFallback: false,
      },
      reporterName: 'Ambulance Driver',
      reporterPhone: '+91 98499 11223',
      assignedTeamId: 'TEAM-POL-03',
      assignedTeamName: 'Pushkaralu Police Crowd Quick Reaction Team 3',
      isDemoData: true,
      createdAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    },
    {
      incidentId: 'INC-2027-1007',
      category: 'Medical emergency',
      description: 'Pilgrim slipped on wet mossy steps at Kotilingala Ghat, suspected ankle fracture, unable to walk.',
      location: 'Kotilingala Ghat, Step row 14, Rajahmundry',
      latitude: 17.0138,
      longitude: 81.7679,
      priority: 'Medium',
      verifiedPriority: 'Medium',
      status: 'Verified',
      aiSuggestion: {
        category: 'Medical emergency',
        priority: 'High',
        summary: 'Orthopedic trauma on slippery river steps.',
        safetyConcerns: ['Mobility impairment on wet steps', 'Incoming foot traffic'],
        recommendedTeam: '108 Emergency Medical Alpha Unit',
        isFallback: false,
      },
      reporterName: 'Venkata Rao',
      reporterPhone: '+91 94901 88223',
      operatorNotes: 'Verified with river safety marshals. Awaiting first-aid stretcher dispatch.',
      isDemoData: true,
      createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    },
    {
      incidentId: 'INC-2027-1008',
      category: 'Missing person',
      description: 'Elderly 68-year-old grandfather who speaks only Hindi separated from his family bus group near Godavari Railway Station exit.',
      location: 'Godavari Railway Station, North Exit Plaza, Rajahmundry',
      latitude: 17.0084,
      longitude: 81.7788,
      priority: 'High',
      verifiedPriority: 'High',
      status: 'Under Review',
      aiSuggestion: {
        category: 'Missing person',
        priority: 'High',
        summary: 'Hindi-speaking elderly pilgrim missing in transit hub.',
        safetyConcerns: ['Language barrier', 'High transit churn'],
        recommendedTeam: 'Pushkaralu Lost & Found Child Support Desk',
        isFallback: false,
      },
      reporterName: 'Anil Sharma',
      reporterPhone: '+91 98112 33445',
      isDemoData: true,
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      incidentId: 'INC-2027-1009',
      category: 'Crowd congestion',
      description: 'Holding area at Pushkar Ghat Gate 1 is full. Pilgrims are jumping barricades to enter the holy dip arena.',
      location: 'Pushkar Ghat, Gate 1 Holding Area, Rajahmundry',
      latitude: 17.0012,
      longitude: 81.7719,
      priority: 'Critical',
      verifiedPriority: 'Critical',
      status: 'Response in Progress',
      aiSuggestion: {
        category: 'Crowd congestion',
        priority: 'Critical',
        summary: 'Holding area overflow with crowd breaching secondary barriers.',
        safetyConcerns: ['Stampede hazard', 'Uncontrolled push towards water edge'],
        recommendedTeam: 'Pushkaralu Police Crowd Quick Reaction Team 3',
        isFallback: false,
      },
      reporterName: 'Volunteer Commander',
      reporterPhone: '+91 90001 22334',
      assignedTeamId: 'TEAM-POL-03',
      assignedTeamName: 'Pushkaralu Police Crowd Quick Reaction Team 3',
      operatorNotes: 'Diverting queue lines to Saraswathi Ghat. Reinforcement platoons moved to Gate 1.',
      responderNotes: 'Barricade restored with secondary police cordon. PA announcements active.',
      isDemoData: true,
      createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      incidentId: 'INC-2027-1010',
      category: 'Other emergency',
      description: 'Major drinking water pipe joint leaked, flooding the queue barricade pathway and cutting off potable water kiosk 4.',
      location: 'Gouthami Ghat Access Boulevard, Rajahmundry',
      latitude: 16.9912,
      longitude: 81.7801,
      priority: 'Low',
      verifiedPriority: 'Low',
      status: 'Verified',
      aiSuggestion: {
        category: 'Other emergency',
        priority: 'Medium',
        summary: 'Utility waterline rupture flooding queue sector.',
        safetyConcerns: ['Slippery mud path', 'Water disruption for queued bathers'],
        recommendedTeam: 'Municipal Disaster Engineering Cell',
        isFallback: false,
      },
      reporterName: 'Sanitation Supervisor',
      reporterPhone: '+91 97000 44556',
      isDemoData: true,
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      incidentId: 'INC-2027-1011',
      category: 'Lost child',
      description: '4-year-old girl separated from parents at Kovvur Goshpada temple courtyard. Found crying by female volunteer.',
      location: 'Goshpada Kshetram Temple Compound, Kovvur',
      latitude: 17.0098,
      longitude: 81.7618,
      priority: 'High',
      verifiedPriority: 'High',
      status: 'Resolved',
      aiSuggestion: {
        category: 'Lost child',
        priority: 'High',
        summary: 'Unattended toddler in temple precinct.',
        safetyConcerns: ['Immediate reunion required', 'Minor emotional distress'],
        recommendedTeam: 'Pushkaralu Lost & Found Child Support Desk',
        isFallback: false,
      },
      reporterName: 'Pooja (Volunteer)',
      reporterPhone: '+91 96666 77889',
      assignedTeamId: 'TEAM-LF-01',
      assignedTeamName: 'Pushkaralu Lost & Found Child Support Desk',
      operatorNotes: 'Verified and matched with pending inquiry by father.',
      responderNotes: 'Parents arrived at Kovvur police post. Identity verified via Aadhaar photo, child safely reunited.',
      isDemoData: true,
      createdAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    },
    {
      incidentId: 'INC-2027-1012',
      category: 'Medical emergency',
      description: 'Pregnant woman experiencing acute nausea and faintness in high humidity queue line at Kotilingala Ghat.',
      location: 'Kotilingala Ghat, Family Queue Lane 2, Rajahmundry',
      latitude: 17.0146,
      longitude: 81.7686,
      priority: 'High',
      verifiedPriority: 'High',
      status: 'Submitted',
      aiSuggestion: {
        category: 'Medical emergency',
        priority: 'High',
        summary: 'Maternal health distress in humid queue.',
        safetyConcerns: ['Risk of fainting in dense crowd', 'Specialized medical transit'],
        recommendedTeam: '108 Emergency Medical Alpha Unit',
        isFallback: false,
      },
      reporterName: 'Devi Prasad',
      reporterPhone: '+91 93939 12345',
      isDemoData: true,
      createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    },
  ];

  const responseTeams: ResponseTeamRecord[] = [
    {
      teamId: 'TEAM-108-A',
      teamName: '108 Emergency Medical Alpha Unit',
      category: 'Medical First Responders',
      availability: 'Responding',
      contactNumber: '108 / +91 883 2461081',
      leadOfficer: 'Dr. K. Srinivas Rao (Senior Emergency Physician)',
      currentIncidentId: 'INC-2027-1001',
      stationLocation: 'Pushkar Ghat Central Medical Depot',
      activeAssignmentsCount: 1,
    },
    {
      teamId: 'TEAM-SDRF-01',
      teamName: 'SDRF River Rescue Boat Unit 1',
      category: 'River Rescue & SDRF',
      availability: 'On Duty',
      contactNumber: '+91 883 2465520',
      leadOfficer: 'Inspector M. Balaram (State Disaster Response Force)',
      stationLocation: 'Godavari River Police Jetty, Rajahmundry',
      activeAssignmentsCount: 0,
    },
    {
      teamId: 'TEAM-POL-03',
      teamName: 'Pushkaralu Police Crowd Quick Reaction Team 3',
      category: 'Police & Crowd Control',
      availability: 'Responding',
      contactNumber: '112 / +91 883 2469911',
      leadOfficer: 'DSP T. V. Ramana (AP Police Special Wing)',
      currentIncidentId: 'INC-2027-1009',
      stationLocation: 'Kotilingala Sector Command Post',
      activeAssignmentsCount: 2,
    },
    {
      teamId: 'TEAM-FIRE-02',
      teamName: 'Fire & Hazard Rescue Unit 2',
      category: 'Fire & Hazard Rescue',
      availability: 'Standby',
      contactNumber: '101 / +91 883 2461010',
      leadOfficer: 'Fire Officer C. H. Venkat',
      stationLocation: 'Main Railway Station Fire Outpost',
      activeAssignmentsCount: 0,
    },
    {
      teamId: 'TEAM-LF-01',
      teamName: 'Pushkaralu Lost & Found Child Support Desk',
      category: 'Lost & Found Unit',
      availability: 'On Duty',
      contactNumber: '+91 883 2464400',
      leadOfficer: 'Smt. P. Annapurna (Women & Child Welfare Dept)',
      currentIncidentId: 'INC-2027-1002',
      stationLocation: 'Collectorate Control Ground, Rajahmundry',
      activeAssignmentsCount: 1,
    },
  ];

  const facilities: FacilityRecord[] = [
    {
      facilityId: 'FAC-01',
      name: 'Government General Hospital (GGH) Rajahmundry',
      category: 'Hospital',
      address: 'Danavaipeta, Rajahmundry, AP 533103',
      latitude: 17.0089,
      longitude: 81.7825,
      contactNumber: '+91 883 2473333',
      operatingHours: '24 Hours Emergency & Trauma Care',
      capacity: '650 Beds | 20 ICU | 8 Trauma Bays',
      verificationStatus: 'Verified Official',
      isDemoData: true,
    },
    {
      facilityId: 'FAC-02',
      name: 'Pushkar Ghat Central Emergency Medical Post',
      category: 'First Aid Post',
      address: 'Pushkar Ghat Promenade, Gate 2, Rajahmundry',
      latitude: 17.0008,
      longitude: 81.7723,
      contactNumber: '+91 883 2461088',
      operatingHours: '24 Hours Pushkaralu Duty',
      capacity: '12 Emergency Stretcher Beds | Oxygen Supply',
      verificationStatus: 'Verified Official',
      isDemoData: true,
    },
    {
      facilityId: 'FAC-03',
      name: 'Kotilingala Ghat Integrated Police Command Desk',
      category: 'Police Help Desk',
      address: 'Kotilingala Ghat North Plaza, Rajahmundry',
      latitude: 17.0145,
      longitude: 81.7684,
      contactNumber: '112 / +91 883 2469915',
      operatingHours: '24/7 Police Assistance & Lost Property',
      verificationStatus: 'Verified Official',
      isDemoData: true,
    },
    {
      facilityId: 'FAC-04',
      name: 'SDRF River Rescue Water Patrol Jetty',
      category: 'River Rescue Boat',
      address: 'Old Godavari Bridge Bank, Rajahmundry',
      latitude: 17.0045,
      longitude: 81.7688,
      contactNumber: '+91 883 2465522',
      operatingHours: '24/7 River Patrol with 8 High-Speed Boats',
      capacity: 'Deep Diver Units | Lifebuoy Deployment Teams',
      verificationStatus: 'Verified Official',
      isDemoData: true,
    },
    {
      facilityId: 'FAC-05',
      name: 'Kovvur Goshpada Kshetram First Aid & Camp',
      category: 'First Aid Post',
      address: 'Goshpada Kshetram Bathing Area, Kovvur, West Godavari',
      latitude: 17.0095,
      longitude: 81.7615,
      contactNumber: '+91 8813 231108',
      operatingHours: '24 Hours Pushkaralu Camp',
      capacity: '8 Beds | Paramedic Unit | Ambulance on Standby',
      verificationStatus: 'Verified Official',
      isDemoData: true,
    },
    {
      facilityId: 'FAC-06',
      name: 'Pushkaralu Central Lost & Found Registration Center',
      category: 'Lost & Found Center',
      address: 'District Collectorate Grounds, Rajahmundry',
      latitude: 17.0062,
      longitude: 81.7794,
      contactNumber: '+91 883 2464400',
      operatingHours: '24 Hours Missing Persons Assistance',
      capacity: 'Audio PA Broadcast Grid | Child Care Shelter',
      verificationStatus: 'Verified Official',
      isDemoData: true,
    },
    {
      facilityId: 'FAC-07',
      name: 'Saraswathi Ghat Potable Water Distribution Hub',
      category: 'Drinking Water Point',
      address: 'Saraswathi Ghat Queue Line Corridor, Rajahmundry',
      latitude: 16.9964,
      longitude: 81.7755,
      contactNumber: 'Toll-Free 1800-425-0099',
      operatingHours: 'Continuous RO Purified Cold Drinking Water',
      capacity: '10,000 Litres/Hour Chilled Dispenser',
      verificationStatus: 'Verified Official',
      isDemoData: true,
    },
    {
      facilityId: 'FAC-08',
      name: 'Dowleswaram Barrage Emergency Response Depot',
      category: 'First Aid Post',
      address: 'Sir Arthur Cotton Museum Road, Dowleswaram',
      latitude: 16.9425,
      longitude: 81.7715,
      contactNumber: '+91 883 2482200',
      operatingHours: '24 Hours Emergency Rapid Response',
      verificationStatus: 'Verified Official',
      isDemoData: true,
    },
  ];

  const announcements: AnnouncementRecord[] = [
    {
      announcementId: 'ANN-01',
      category: 'River Safety',
      title: 'High River Current Alert: Kotilingala Ghat Outer Bathing Line',
      message: 'Water discharge upstream has increased Godavari flow velocity. All pilgrims are strictly advised to remain inside the iron chain safety boundary and not venture into deep river zones.',
      priority: 'Urgent',
      language: 'English',
      publishedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      active: true,
      publishedBy: 'Godavari Pushkaralu District Control Room',
    },
    {
      announcementId: 'ANN-02',
      category: 'Crowd Advisory',
      title: 'Pushkar Ghat Queue Diversion to Saraswathi Ghat',
      message: 'Pushkar Ghat main holding area has reached maximum capacity. Pilgrims arriving from RTC Bus Complex are requested to proceed directly to Saraswathi Ghat or Markandeya Ghat for smooth holy dip.',
      priority: 'Urgent',
      language: 'English',
      publishedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      active: true,
      publishedBy: 'Crowd Management Cell, AP Police',
    },
    {
      announcementId: 'ANN-03',
      category: 'Weather Notice',
      title: 'Heat Wave & Hydration Advisory: 11:30 AM to 3:30 PM',
      message: 'Mid-day temperatures are forecasted to reach 38°C. Elderly bathers and children are advised to use shaded shelters and drink free ORS / RO water available at all ghat kiosks.',
      priority: 'Advisory',
      language: 'English',
      publishedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      active: true,
      publishedBy: 'Disaster Management Authority',
    },
    {
      announcementId: 'ANN-04',
      category: 'Missing Person Notice',
      title: 'Child Sai Vignesh (6 yrs) Reported Separated at Kotilingala',
      message: 'Boy wearing yellow shirt & blue shorts. If spotted, please alert nearest police desk or call Child Help Desk at 0883-2464400 immediately.',
      priority: 'Advisory',
      language: 'English',
      publishedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      active: true,
      publishedBy: 'Child Welfare Cell',
    },
  ];

  const missingPersons: MissingPersonRecord[] = [
    {
      caseId: 'MP-2027-01',
      fullName: 'Sai Vignesh',
      age: 6,
      gender: 'Male',
      lastSeenLocation: 'Kotilingala Ghat, Bathing Block B, Rajahmundry',
      lastSeenTime: 'Today at 08:30 AM',
      clothingDescription: 'Bright yellow polo t-shirt, dark blue sports shorts, red rubber sandals.',
      identifyingFeatures: 'Small birthmark on left wrist.',
      reporterName: 'Lakshmi Devi (Mother)',
      reporterPhone: '+91 94401 56789',
      reporterRelationship: 'Mother',
      status: 'Active Search',
      caseNotes: 'PA broadcast running at Kotilingala and Pushkar Ghat audio systems. Team LF-01 coordinating.',
      isDemoData: true,
      createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      caseId: 'MP-2027-02',
      fullName: 'Ram Das Sharma',
      age: 68,
      gender: 'Male',
      lastSeenLocation: 'Godavari Railway Station North Plaza, Rajahmundry',
      lastSeenTime: 'Today at 09:15 AM',
      clothingDescription: 'White cotton kurta-pyjama, saffron angavastram shawl, spectacles.',
      identifyingFeatures: 'Speaks only Hindi, carries a steel walking stick.',
      reporterName: 'Anil Sharma (Son)',
      reporterPhone: '+91 98112 33445',
      reporterRelationship: 'Son',
      status: 'Under Review',
      caseNotes: 'Volunteer deployed near station Hindi information kiosk.',
      isDemoData: true,
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
    {
      caseId: 'MP-2027-03',
      fullName: 'Ananya Rao',
      age: 11,
      gender: 'Female',
      lastSeenLocation: 'Pushkar Ghat Promenade, Flower Stall Row',
      lastSeenTime: 'Today at 07:15 AM',
      clothingDescription: 'Pink traditional pattu pavada (skirt & blouse), green bangles.',
      reporterName: 'Venkatesh Rao (Father)',
      reporterPhone: '+91 98488 22334',
      reporterRelationship: 'Father',
      status: 'Located',
      caseNotes: 'Located at Pushkar Ghat lost child holding booth. Father notified, proceeding for verification.',
      isDemoData: true,
      createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
  ];

  const ghatCrowdZones: GhatCrowdZone[] = [
    {
      ghatId: 'GHAT-01',
      name: 'Pushkar Ghat',
      district: 'Rajahmundry Central',
      maxCapacity: 35000,
      currentVisitors: 32600,
      occupancyPercent: 93,
      status: 'Critical',
      waterFlowStatus: 'Moderate Currents',
      holdingAreaActive: true,
      estimatedWaitMinutes: 55,
      lastUpdated: new Date().toLocaleTimeString(),
      latitude: 17.0005,
      longitude: 81.7725,
    },
    {
      ghatId: 'GHAT-02',
      name: 'Kotilingala Ghat',
      district: 'Rajahmundry North',
      maxCapacity: 50000,
      currentVisitors: 41200,
      occupancyPercent: 82,
      status: 'Heavy',
      waterFlowStatus: 'Fast Current - Alert',
      holdingAreaActive: true,
      estimatedWaitMinutes: 35,
      lastUpdated: new Date().toLocaleTimeString(),
      latitude: 17.0142,
      longitude: 81.7681,
    },
    {
      ghatId: 'GHAT-03',
      name: 'Saraswathi Ghat',
      district: 'Rajahmundry South',
      maxCapacity: 25000,
      currentVisitors: 13800,
      occupancyPercent: 55,
      status: 'Moderate',
      waterFlowStatus: 'Safe',
      holdingAreaActive: false,
      estimatedWaitMinutes: 15,
      lastUpdated: new Date().toLocaleTimeString(),
      latitude: 16.9961,
      longitude: 81.7758,
    },
    {
      ghatId: 'GHAT-04',
      name: 'Markandeya Ghat',
      district: 'Rajahmundry Old Town',
      maxCapacity: 20000,
      currentVisitors: 8400,
      occupancyPercent: 42,
      status: 'Normal',
      waterFlowStatus: 'Safe',
      holdingAreaActive: false,
      estimatedWaitMinutes: 5,
      lastUpdated: new Date().toLocaleTimeString(),
      latitude: 17.0051,
      longitude: 81.7709,
    },
    {
      ghatId: 'GHAT-05',
      name: 'Kovvur Goshpada Kshetram Ghat',
      district: 'West Godavari Bank',
      maxCapacity: 30000,
      currentVisitors: 21900,
      occupancyPercent: 73,
      status: 'Moderate',
      waterFlowStatus: 'Fast Current - Alert',
      holdingAreaActive: false,
      estimatedWaitMinutes: 20,
      lastUpdated: new Date().toLocaleTimeString(),
      latitude: 17.0092,
      longitude: 81.7611,
    },
    {
      ghatId: 'GHAT-06',
      name: 'Dowleswaram Barrage Ghat',
      district: 'Dowleswaram',
      maxCapacity: 15000,
      currentVisitors: 5100,
      occupancyPercent: 34,
      status: 'Normal',
      waterFlowStatus: 'Safe',
      holdingAreaActive: false,
      estimatedWaitMinutes: 0,
      lastUpdated: new Date().toLocaleTimeString(),
      latitude: 16.9421,
      longitude: 81.7712,
    },
    {
      ghatId: 'GHAT-07',
      name: 'Gouthami ISKCON Ghat',
      district: 'Rajahmundry Suburbs',
      maxCapacity: 20000,
      currentVisitors: 10800,
      occupancyPercent: 54,
      status: 'Moderate',
      waterFlowStatus: 'Safe',
      holdingAreaActive: false,
      estimatedWaitMinutes: 10,
      lastUpdated: new Date().toLocaleTimeString(),
      latitude: 16.9912,
      longitude: 81.7801,
    },
  ];

  const logs: IncidentAuditLog[] = [
    {
      logId: 'LOG-01',
      incidentId: 'INC-2027-1001',
      action: 'Report Submitted',
      performedBy: 'Public User (Suresh Kumar)',
      role: 'public',
      timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      notes: 'Initial emergency report lodged via Godavari Raksha mobile web portal.',
    },
    {
      logId: 'LOG-02',
      incidentId: 'INC-2027-1001',
      action: 'AI Triage Generated',
      performedBy: 'Gemini AI Engine (Server-Side)',
      role: 'system',
      timestamp: new Date(Date.now() - 34 * 60 * 1000).toISOString(),
      notes: 'Suggested Category: Medical emergency | Suggested Priority: Critical | Confidence: High',
    },
    {
      logId: 'LOG-03',
      incidentId: 'INC-2027-1001',
      action: 'Priority Verified as Critical',
      performedBy: 'Officer K. Rajesh (Control Room Lead)',
      role: 'admin',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      notes: 'Verified collapse with Pushkar Ghat CCTV camera 12. Marked Critical.',
    },
    {
      logId: 'LOG-04',
      incidentId: 'INC-2027-1001',
      action: 'Assigned to 108 Emergency Medical Alpha Unit',
      performedBy: 'Control Room Dispatcher (admin)',
      role: 'admin',
      timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
      notes: 'Dispatched stretcher unit with oxygen kit to Pushkar Ghat Gate 3.',
    },
    {
      logId: 'LOG-05',
      incidentId: 'INC-2027-1001',
      action: 'Status Changed to Response in Progress',
      performedBy: 'Dr. K. Srinivas Rao (108 Lead)',
      role: 'responder',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      notes: 'Reached patient at Gate 3. Commenced emergency IV rehydration.',
    },
    {
      logId: 'LOG-06',
      incidentId: 'INC-2027-1002',
      action: 'Report Submitted',
      performedBy: 'Lakshmi Devi (Mother)',
      role: 'public',
      timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      notes: 'Lost 6-year-old child Sai Vignesh in yellow shirt reported near Kotilingala.',
    },
    {
      logId: 'LOG-07',
      incidentId: 'INC-2027-1002',
      action: 'Priority Verified as High',
      performedBy: 'Duty Superintendent Ramana (admin)',
      role: 'admin',
      timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
      notes: 'High crowd density at river bathing steps warrants urgent priority.',
    },
    {
      logId: 'LOG-08',
      incidentId: 'INC-2027-1002',
      action: 'Assigned to Pushkaralu Lost & Found Child Support Desk',
      performedBy: 'Control Room Dispatcher (admin)',
      role: 'admin',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      notes: 'Public address audio announcement triggered across Kotilingala audio horns.',
    },
    {
      logId: 'LOG-09',
      incidentId: 'INC-2027-1004',
      action: 'Status Changed to Verified',
      performedBy: 'Officer K. Rajesh (admin)',
      role: 'admin',
      timestamp: new Date(Date.now() - 115 * 60 * 1000).toISOString(),
      notes: 'River safety marshal confirmed 2 pilgrims drifting beyond safety chains.',
    },
    {
      logId: 'LOG-10',
      incidentId: 'INC-2027-1004',
      action: 'Assigned to SDRF River Rescue Boat Unit 1',
      performedBy: 'Duty Superintendent Ramana (admin)',
      role: 'admin',
      timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
      notes: 'High speed boat deployed with lifebuoys and diver personnel.',
    },
    {
      logId: 'LOG-11',
      incidentId: 'INC-2027-1004',
      action: 'Status Changed to Resolved',
      performedBy: 'Inspector M. Balaram (SDRF Lead)',
      role: 'responder',
      timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      notes: 'Both bathers recovered safely to Kovvur shore. Evaluated and discharged by paramedic.',
    },
    {
      logId: 'LOG-12',
      incidentId: 'INC-2027-1009',
      action: 'Priority Verified as Critical',
      performedBy: 'Officer K. Rajesh (admin)',
      role: 'admin',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      notes: 'CCTV camera 4 shows barricade breach at Pushkar Ghat holding area.',
    },
    {
      logId: 'LOG-13',
      incidentId: 'INC-2027-1009',
      action: 'Assigned to Pushkaralu Police Crowd Quick Reaction Team 3',
      performedBy: 'Control Room Dispatcher (admin)',
      role: 'admin',
      timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
      notes: 'Police platoon ordered to establish secondary cordon and divert queue to Saraswathi Ghat.',
    },
  ];

  return { incidents, responseTeams, facilities, announcements, missingPersons, ghatCrowdZones, logs };
}

// Global in-memory instance with thread safety in Node
class DataStore {
  incidents: IncidentRecord[] = [];
  responseTeams: ResponseTeamRecord[] = [];
  facilities: FacilityRecord[] = [];
  announcements: AnnouncementRecord[] = [];
  missingPersons: MissingPersonRecord[] = [];
  ghatCrowdZones: GhatCrowdZone[] = [];
  logs: IncidentAuditLog[] = [];

  constructor() {
    this.resetToSeed();
  }

  resetToSeed() {
    const seed = createInitialSeedData();
    this.incidents = seed.incidents;
    this.responseTeams = seed.responseTeams;
    this.facilities = seed.facilities;
    this.announcements = seed.announcements;
    this.missingPersons = seed.missingPersons;
    this.ghatCrowdZones = seed.ghatCrowdZones;
    this.logs = seed.logs;
  }

  addIncident(record: IncidentRecord): IncidentRecord {
    this.incidents.unshift(record);
    return record;
  }

  updateIncident(incidentId: string, updates: Partial<IncidentRecord>): IncidentRecord | null {
    const index = this.incidents.findIndex((inc) => inc.incidentId === incidentId);
    if (index === -1) return null;

    this.incidents[index] = {
      ...this.incidents[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.incidents[index];
  }

  addLog(incidentId: string, action: string, performedBy: string, role: string, notes?: string) {
    const log: IncidentAuditLog = {
      logId: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      incidentId,
      action,
      performedBy,
      role,
      timestamp: new Date().toISOString(),
      notes,
    };
    this.logs.unshift(log);
    return log;
  }

  addMissingPerson(record: MissingPersonRecord) {
    this.missingPersons.unshift(record);
    return record;
  }

  updateMissingPerson(caseId: string, updates: Partial<MissingPersonRecord>) {
    const index = this.missingPersons.findIndex((m) => m.caseId === caseId);
    if (index === -1) return null;
    this.missingPersons[index] = {
      ...this.missingPersons[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.missingPersons[index];
  }

  addAnnouncement(record: AnnouncementRecord) {
    this.announcements.unshift(record);
    return record;
  }

  updateResponseTeam(teamId: string, updates: Partial<ResponseTeamRecord>) {
    const index = this.responseTeams.findIndex((t) => t.teamId === teamId);
    if (index === -1) return null;
    this.responseTeams[index] = {
      ...this.responseTeams[index],
      ...updates,
    };
    return this.responseTeams[index];
  }

  updateGhatCrowd(ghatId: string, visitorsDelta: number) {
    const ghat = this.ghatCrowdZones.find((g) => g.ghatId === ghatId);
    if (!ghat) return null;
    ghat.currentVisitors = Math.max(0, Math.min(ghat.maxCapacity * 1.2, ghat.currentVisitors + visitorsDelta));
    ghat.occupancyPercent = Math.round((ghat.currentVisitors / ghat.maxCapacity) * 100);
    if (ghat.occupancyPercent >= 90) ghat.status = 'Critical';
    else if (ghat.occupancyPercent >= 75) ghat.status = 'Heavy';
    else if (ghat.occupancyPercent >= 50) ghat.status = 'Moderate';
    else ghat.status = 'Normal';
    ghat.lastUpdated = new Date().toLocaleTimeString();
    return ghat;
  }
}

export const dataStore = new DataStore();
