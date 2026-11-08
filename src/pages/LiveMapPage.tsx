import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import L from 'leaflet';
import {
  MapPin,
  Filter,
  List,
  Map as MapIcon,
  Navigation,
  ShieldCheck,
  AlertOctagon,
  Layers,
  Crosshair,
  Building2,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Incident, Facility, PriorityLevel } from '../types';

export const LiveMapPage: React.FC = () => {
  const { incidents, facilities, role } = useApp();
  const [searchParams] = useSearchParams();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [showFacilities, setShowFacilities] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);

  // Read initial coords from query params if passed
  const initialLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : 17.0005;
  const initialLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : 81.7725;

  // Filtered incidents
  const filteredIncidents = incidents.filter((inc) => {
    if (selectedCategory !== 'All' && inc.category !== selectedCategory) return false;
    const prio = inc.verifiedPriority || inc.priority;
    if (selectedPriority !== 'All' && prio !== selectedPriority) return false;
    if (selectedStatus !== 'All' && inc.status !== selectedStatus) return false;
    return true;
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | Godavari Pushkaralu 2027 Safety Grid',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map alive or cleanup
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // 1. Plot Incidents
    filteredIncidents.forEach((inc) => {
      const isCritical = (inc.verifiedPriority || inc.priority) === 'Critical' && inc.status !== 'Resolved';
      const isHigh = (inc.verifiedPriority || inc.priority) === 'High';
      const isResolved = inc.status === 'Resolved';

      const markerColor = isResolved
        ? '#10b981'
        : isCritical
        ? '#ef4444'
        : isHigh
        ? '#f59e0b'
        : '#3b82f6';

      const customIcon = L.divIcon({
        className: 'custom-incident-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${
              isCritical
                ? `<span style="position: absolute; width: 36px; height: 36px; background-color: rgba(239, 68, 68, 0.4); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
                : ''
            }
            <div style="
              width: 30px;
              height: 30px;
              background-color: ${markerColor};
              border: 2px solid #ffffff;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
              font-size: 13px;
              color: white;
              font-weight: bold;
            ">
              ${
                inc.category === 'Medical emergency'
                  ? '🚑'
                  : inc.category === 'Lost child'
                  ? '👦'
                  : inc.category === 'Accident'
                  ? '🌊'
                  : inc.category === 'Fire emergency'
                  ? '🔥'
                  : inc.category === 'Crowd congestion'
                  ? '⚠️'
                  : '🚨'
              }
            </div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([inc.latitude, inc.longitude], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; max-width: 260px; line-height: 1.4;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-family: monospace; font-weight: bold; color: #1d4ed8; background: #eff6ff; padding: 2px 6px; border-radius: 4px;">
              ${inc.incidentId}
            </span>
            <span style="font-weight: 800; font-size: 11px; padding: 2px 6px; border-radius: 4px; background: ${
              isCritical ? '#fee2e2; color: #b91c1c;' : '#fef3c7; color: #b45309;'
            }">
              ${inc.verifiedPriority || inc.priority}
            </span>
          </div>
          <div style="font-weight: bold; color: #0f172a; margin-bottom: 2px;">
            ${inc.category}
          </div>
          <p style="color: #334155; margin: 4px 0 6px 0; font-size: 11.5px;">
            ${inc.description.slice(0, 95)}${inc.description.length > 95 ? '...' : ''}
          </p>
          <div style="color: #64748b; font-size: 10.5px; border-top: 1px solid #e2e8f0; padding-top: 4px; display: flex; justify-content: space-between;">
            <span>📍 ${inc.location.split(',')[0]}</span>
            <span><strong>${inc.status}</strong></span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setActiveIncident(inc);
      });

      markersLayerRef.current?.addLayer(marker);
    });

    // 2. Plot Facilities
    if (showFacilities) {
      facilities.forEach((fac) => {
        const facIcon = L.divIcon({
          className: 'custom-facility-marker',
          html: `
            <div style="
              width: 24px;
              height: 24px;
              background-color: #0f172a;
              border: 1.5px solid #38bdf8;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              font-size: 11px;
            ">
              ${
                fac.category === 'Hospital'
                  ? '🏥'
                  : fac.category === 'Police Help Desk'
                  ? '👮'
                  : fac.category === 'River Rescue Boat'
                  ? '⚓'
                  : fac.category === 'Drinking Water Point'
                  ? '💧'
                  : 'ℹ️'
              }
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const facMarker = L.marker([fac.latitude, fac.longitude], { icon: facIcon });
        facMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 11.5px; max-width: 220px;">
            <div style="font-weight: bold; color: #0f172a; margin-bottom: 2px;">${fac.name}</div>
            <div style="color: #0284c7; font-weight: 600; font-size: 10.5px; margin-bottom: 4px;">${fac.category}</div>
            <div style="color: #475569; font-size: 10.5px;">📍 ${fac.address}</div>
            <div style="color: #16a34a; font-weight: bold; font-size: 10px; margin-top: 4px;">📞 ${fac.contactNumber}</div>
          </div>
        `);
        markersLayerRef.current?.addLayer(facMarker);
      });
    }

    // 3. User Location Marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-gps-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <span style="position: absolute; width: 32px; height: 32px; background-color: rgba(37, 99, 235, 0.4); border-radius: 50%; animation: ping 2s infinite;"></span>
            <div style="width: 16px; height: 16px; background-color: #2563eb; border: 3px solid #ffffff; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      const userMarker = L.marker(userLocation, { icon: userIcon }).bindPopup('<strong>Your Current Location</strong>');
      markersLayerRef.current?.addLayer(userMarker);
    }
  }, [filteredIncidents, showFacilities, userLocation]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        mapInstanceRef.current?.flyTo(coords, 16);
        setLocatingUser(false);
      },
      (err) => {
        console.warn('Location denied:', err);
        setLocatingUser(false);
      }
    );
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Title & View Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">
              Live Godavari Pushkaralu Incident Map
            </h1>
            <span className="bg-black text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
              DEMO DATA
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time geospatial tracking of emergencies, river safety boats, and medical points across Rajahmundry & Kovvur
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLocateMe}
            disabled={locatingUser}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <Crosshair className={`w-3.5 h-3.5 text-blue-600 ${locatingUser ? 'animate-spin' : ''}`} />
            <span>{locatingUser ? 'Locating...' : 'Find My Location'}</span>
          </button>

          <div className="flex bg-slate-200 p-0.5 rounded-xl border border-slate-300">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
                viewMode === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List ({filteredIncidents.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 font-bold">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Category */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none"
        >
          <option value="All">All Categories</option>
          <option value="Medical emergency">Medical Emergency</option>
          <option value="Lost child">Lost Child</option>
          <option value="Accident">River Accident</option>
          <option value="Crowd congestion">Crowd Congestion</option>
          <option value="Fire emergency">Fire Emergency</option>
          <option value="Missing person">Missing Person</option>
          <option value="Public safety threat">Public Safety Threat</option>
        </select>

        {/* Priority */}
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none"
        >
          <option value="All">All Priorities</option>
          <option value="Critical">Critical Priority</option>
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>

        {/* Status */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="Submitted">Submitted</option>
          <option value="Under Review">Under Review</option>
          <option value="Verified">Verified</option>
          <option value="Assigned">Assigned</option>
          <option value="Response in Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>

        {/* Toggle Facilities */}
        <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-semibold ml-auto">
          <input
            type="checkbox"
            checked={showFacilities}
            onChange={(e) => setShowFacilities(e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <span>Show Safety Facilities ({facilities.length})</span>
        </label>
      </div>

      {/* Main View Area */}
      {viewMode === 'map' ? (
        <div className="relative rounded-3xl overflow-hidden border border-slate-300 shadow-md bg-slate-100 h-[620px]">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Map Overlay Legend */}
          <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs p-3 rounded-2xl border border-slate-200 shadow-lg text-[11px] space-y-1.5 hidden sm:block max-w-xs">
            <span className="font-bold text-slate-900 block">Map Legend</span>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping inline-block" />
                Critical Incident
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                High Incident
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Resolved Incident
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-slate-900 border border-sky-400 rounded-xs inline-block" />
                Facility (Hospital / Post)
              </span>
            </div>
          </div>

          {/* Active Incident Drawer (When clicked) */}
          {activeIncident && (
            <div className="absolute top-4 right-4 z-20 bg-white/98 backdrop-blur-xs p-4 rounded-2xl border border-slate-300 shadow-2xl w-80 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {activeIncident.incidentId}
                </span>
                <button
                  onClick={() => setActiveIncident(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm">{activeIncident.category}</h4>
                <p className="text-slate-600 mt-1">{activeIncident.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500">
                <span>📍 {activeIncident.location}</span>
                <span className="font-bold text-slate-800">{activeIncident.status}</span>
              </div>

              <div className="pt-2 flex gap-2">
                <Link
                  to={`/track?id=${activeIncident.incidentId}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-xl text-center text-[11px]"
                >
                  Track Status
                </Link>
                {role === 'admin' && (
                  <Link
                    to={`/admin?id=${activeIncident.incidentId}`}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-1.5 px-3 rounded-xl text-center text-[11px]"
                  >
                    Open in Control
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
          {filteredIncidents.map((inc) => (
            <div key={inc.incidentId} className="p-4 sm:p-5 hover:bg-slate-50 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {inc.incidentId}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
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
                    {inc.verifiedPriority || inc.priority}
                  </span>
                  <span className="text-xs text-slate-500">
                    Status: <strong>{inc.status}</strong>
                  </span>
                </div>
                <p className="text-sm text-slate-800">{inc.description}</p>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>📍 {inc.location}</span>
                  <span>•</span>
                  <span>Coords: {inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/track?id=${inc.incidentId}`}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-semibold"
                >
                  Track
                </Link>
                <button
                  onClick={() => {
                    setViewMode('map');
                    setTimeout(() => {
                      mapInstanceRef.current?.flyTo([inc.latitude, inc.longitude], 16);
                      setActiveIncident(inc);
                    }, 100);
                  }}
                  className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-semibold"
                >
                  View on Map
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
