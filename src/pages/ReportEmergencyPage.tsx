import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  AlertOctagon,
  MapPin,
  Camera,
  PhoneCall,
  User,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Navigation,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { IncidentCategory } from '../types';

export const ReportEmergencyPage: React.FC = () => {
  const { submitEmergencyReport, t } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState<IncidentCategory>(
    (searchParams.get('category') as IncidentCategory) || 'Medical emergency'
  );
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Pushkar Ghat, Gate 2, Rajahmundry');
  const [latitude, setLatitude] = useState<number>(17.0005);
  const [longitude, setLongitude] = useState<number>(81.7725);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'success' | 'denied'>('idle');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedIncident, setSubmittedIncident] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setCategory(cat as IncidentCategory);
    }
  }, [searchParams]);

  const categories: { id: IncidentCategory; label: string; icon: string; alertColor: string }[] = [
    { id: 'Medical emergency', label: 'Medical Emergency', icon: '🚑', alertColor: 'border-red-500 bg-red-50' },
    { id: 'Lost child', label: 'Lost Child / Kid', icon: '👦', alertColor: 'border-amber-500 bg-amber-50' },
    { id: 'Accident', label: 'River Bathing Accident', icon: '🌊', alertColor: 'border-blue-500 bg-blue-50' },
    { id: 'Crowd congestion', label: 'Crowd Crush / Surge', icon: '⚠️', alertColor: 'border-orange-500 bg-orange-50' },
    { id: 'Fire emergency', label: 'Fire / Cylinder Flare', icon: '🔥', alertColor: 'border-red-600 bg-red-50' },
    { id: 'Missing person', label: 'Missing Person (Adult)', icon: '🔍', alertColor: 'border-indigo-500 bg-indigo-50' },
    { id: 'Public safety threat', label: 'Public Safety Threat', icon: '🛡️', alertColor: 'border-purple-500 bg-purple-50' },
    { id: 'Other emergency', label: 'Other Emergency', icon: '📢', alertColor: 'border-slate-500 bg-slate-50' },
  ];

  const pushkaraluLandmarks = [
    { name: 'Pushkar Ghat, Gate 3, Rajahmundry', lat: 17.0005, lng: 81.7725 },
    { name: 'Kotilingala Ghat, Bathing Steps, Rajahmundry', lat: 17.0142, lng: 81.7681 },
    { name: 'Saraswathi Ghat, Footbridge Overpass, Rajahmundry', lat: 16.9961, lng: 81.7758 },
    { name: 'Markandeya Temple Approach Road, Rajahmundry', lat: 17.0051, lng: 81.7709 },
    { name: 'Kovvur Goshpada Kshetram (West Godavari Bank)', lat: 17.0092, lng: 81.7611 },
    { name: 'Dowleswaram Barrage Entry Plaza', lat: 16.9421, lng: 81.7712 },
  ];

  const handleFetchGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('denied');
      return;
    }
    setGpsStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(6)));
        setLongitude(Number(pos.coords.longitude.toFixed(6)));
        setGpsStatus('success');
      },
      (err) => {
        console.warn('Geolocation denied or unavailable, using selected ghat coordinates:', err);
        setGpsStatus('denied');
      },
      { timeout: 8000 }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage('Please describe the emergency situation.');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const incident = await submitEmergencyReport({
        category,
        description,
        location,
        latitude,
        longitude,
        reporterName: reporterName.trim() || 'Anonymous Pilgrim',
        reporterPhone: reporterPhone.trim() || '',
        photoUrl: photoPreview || '',
      });
      setSubmittedIncident(incident);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success view with AI Triage breakdown
  if (submittedIncident) {
    const ai = submittedIncident.aiSuggestion;
    return (
      <div className="max-w-2xl mx-auto py-6 space-y-6">
        <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-8 shadow-lg space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Incident Queued in Command Center
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                Emergency Report Submitted
              </h2>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-500 font-medium">Tracking Incident ID</span>
              <p className="font-mono text-xl font-extrabold text-blue-700">
                {submittedIncident.incidentId}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium">Current Status</span>
              <p className="text-sm font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full inline-block">
                {submittedIncident.status}
              </p>
            </div>
          </div>

          {/* AI Triage Card */}
          {ai && (
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>AI Incident Triage Analysis</span>
                </div>
                <span className="text-[10px] font-bold bg-indigo-200/80 text-indigo-900 px-2 py-0.5 rounded">
                  {ai.isFallback ? 'Deterministic Logic' : 'Gemini 3.8 Flash'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                  <span className="text-slate-500 block">Identified Category:</span>
                  <strong className="text-slate-800 text-sm">{ai.category}</strong>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                  <span className="text-slate-500 block">Suggested Priority:</span>
                  <strong
                    className={`text-sm ${
                      ai.priority === 'Critical'
                        ? 'text-red-600'
                        : ai.priority === 'High'
                        ? 'text-amber-600'
                        : 'text-blue-600'
                    }`}
                  >
                    {ai.priority}
                  </strong>
                </div>
              </div>

              <div className="text-xs bg-white p-2.5 rounded-xl border border-indigo-100 space-y-1">
                <span className="text-slate-500 block font-medium">AI Situation Summary:</span>
                <p className="text-slate-800 font-medium">{ai.summary}</p>
              </div>

              {ai.safetyConcerns && ai.safetyConcerns.length > 0 && (
                <div className="text-xs space-y-1">
                  <span className="text-indigo-900 font-semibold block">Detected Safety Concerns:</span>
                  <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                    {ai.safetyConcerns.map((c: string, idx: number) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-xs text-indigo-900 pt-2 border-t border-indigo-200/60 flex items-center justify-between">
                <span>Recommended Response Unit:</span>
                <strong>{ai.recommendedTeam}</strong>
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> AI suggestions are advisory. An authorized human operator in the Control Room will verify priority and dispatch personnel.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to={`/track?id=${submittedIncident.incidentId}`}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-center text-sm shadow transition"
            >
              Track This Incident
            </Link>
            <Link
              to={`/map?lat=${submittedIncident.latitude}&lng=${submittedIncident.longitude}`}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 px-4 rounded-xl text-center text-sm transition"
            >
              View on Live Map
            </Link>
            <button
              onClick={() => {
                setSubmittedIncident(null);
                setDescription('');
                setPhotoPreview(null);
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-center text-sm transition cursor-pointer"
            >
              Report Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-red-100 text-red-600">
            <AlertOctagon className="w-6 h-6" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Report an Emergency
          </h1>
        </div>
        <p className="text-sm text-slate-600">
          Immediate public safety intake for Godavari Pushkaralu 2027. AI automatically classifies severity and assists operator dispatch.
        </p>
      </div>

      {/* Critical Direct Call Disclaimer */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-950">
        <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm space-y-1">
          <p className="font-bold">
            For Active Life-Threatening Emergencies (Drowning, Cardiac Arrest, Stampede):
          </p>
          <p className="text-red-800">
            Submitting a web report does NOT guarantee instant dispatch. Immediately dial{' '}
            <a href="tel:112" className="underline font-bold text-red-700">112 (Police)</a> or{' '}
            <a href="tel:108" className="underline font-bold text-red-700">108 (Ambulance)</a>.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Main Reporting Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Step 1: Category selection */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-900">
            1. Select Incident Category *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  category === cat.id
                    ? `${cat.alertColor} border-2 shadow-xs scale-102`
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-2xl mb-1">{cat.icon}</span>
                <span className="text-xs font-bold leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Description */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-bold text-slate-900">
              2. Describe the Emergency *
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {description.length} characters
            </span>
          </div>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what happened, any visible injuries, physical descriptions, number of persons involved, or immediate dangers..."
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        {/* Step 3: Location and Landmarks */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-900">
            3. Location & Pushkaralu Ghat Landmark *
          </label>

          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Pushkar Ghat Gate 3, or Kotilingala step row 12"
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Quick Select:</span>
            {pushkaraluLandmarks.map((lm) => (
              <button
                type="button"
                key={lm.name}
                onClick={() => {
                  setLocation(lm.name);
                  setLatitude(lm.lat);
                  setLongitude(lm.lng);
                }}
                className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer font-medium transition"
              >
                {lm.name.split(',')[0]}
              </button>
            ))}
          </div>

          {/* GPS Coordinates Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>
                Coordinates: <strong>{latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={handleFetchGps}
              disabled={gpsStatus === 'locating'}
              className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer"
            >
              <Navigation className={`w-3.5 h-3.5 ${gpsStatus === 'locating' ? 'animate-spin' : ''}`} />
              <span>
                {gpsStatus === 'locating' ? 'Fetching GPS...' : gpsStatus === 'success' ? 'GPS Acquired' : 'Get Current GPS'}
              </span>
            </button>
          </div>
        </div>

        {/* Step 4: Photograph Upload (Optional) */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-900">
            4. Photograph (Optional)
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-xl cursor-pointer text-xs font-semibold transition">
              <Camera className="w-4 h-4 text-slate-500" />
              <span>Upload Photo / Capture</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
            {photoPreview && (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Incident Preview"
                  className="w-14 h-14 object-cover rounded-xl border border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Step 5: Reporter Contact Information */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-sm font-bold text-slate-900">
            5. Contact Information (Optional, for Operator Verification)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Your Name (or leave blank)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <input
                type="tel"
                value={reporterPhone}
                onChange={(e) => setReporterPhone(e.target.value)}
                placeholder="Phone Number (e.g. +91 98480 12345)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Privacy Guarantee: Contact details are encrypted and strictly reserved for authorized Control Room dispatchers.
          </p>
        </div>

        {/* Submit Action */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white py-3.5 px-6 rounded-2xl font-extrabold text-base shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-99 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Running AI Classification & Submitting...</span>
              </>
            ) : (
              <>
                <AlertOctagon className="w-5 h-5" />
                <span>Submit Emergency Report</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
