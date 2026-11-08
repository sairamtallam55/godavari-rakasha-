import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  PhoneCall,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Shield,
  X,
  Camera,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MissingPerson } from '../types';

export const MissingPersonsPage: React.FC = () => {
  const {
    missingPersons,
    submitMissingPersonReport,
    updateMissingPersonCase,
    role,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showReportModal, setShowReportModal] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number>(8);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [lastSeenLocation, setLastSeenLocation] = useState('Kotilingala Ghat, Bathing Steps');
  const [lastSeenTime, setLastSeenTime] = useState('Today at 10:00 AM');
  const [clothingDescription, setClothingDescription] = useState('');
  const [identifyingFeatures, setIdentifyingFeatures] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [reporterRelationship, setReporterRelationship] = useState('Parent');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOperator = role === 'admin' || role === 'responder';

  const filteredCases = missingPersons.filter((c) => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    const q = searchQuery.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.lastSeenLocation.toLowerCase().includes(q) ||
      c.clothingDescription.toLowerCase().includes(q) ||
      c.caseId.toLowerCase().includes(q)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !clothingDescription.trim()) return;
    setIsSubmitting(true);

    try {
      await submitMissingPersonReport({
        fullName,
        age: Number(age),
        gender,
        lastSeenLocation,
        lastSeenTime,
        clothingDescription,
        identifyingFeatures,
        reporterName,
        reporterPhone,
        reporterRelationship,
        photoUrl: photoPreview || undefined,
      });

      setShowReportModal(false);
      setFullName('');
      setClothingDescription('');
      setIdentifyingFeatures('');
      setPhotoPreview(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (caseId: string, newStatus: string) => {
    await updateMissingPersonCase(caseId, { status: newStatus });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Users className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Pushkaralu Missing Persons & Child Recovery
            </h1>
            <span className="bg-black text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
              DEMO DATA
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Integrated search alerts, public PA broadcast liaison, and privacy-conscious family reunification across Godavari Ghats.
          </p>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Report Missing Person</span>
        </button>
      </div>

      {/* Privacy Notice Card */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-xs text-indigo-950 flex items-start gap-3">
        <Shield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Citizen Privacy & Safety Protections:</p>
          <p className="text-slate-600">
            Automated facial recognition is strictly prohibited. Personal telephone numbers and addresses are hidden from the public and accessible exclusively to authorized Control Room operators and police desks.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-600">Status Filter:</span>
          {['All', 'Active Search', 'Under Review', 'Located', 'Reunited'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, clothing, case ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none"
          />
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCases.map((c) => {
          const isLocated = c.status === 'Located' || c.status === 'Reunited';
          return (
            <div
              key={c.caseId}
              className={`bg-white rounded-3xl border p-5 shadow-xs flex flex-col justify-between space-y-4 ${
                isLocated ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {c.caseId}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {c.age} yrs • {c.gender}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-lg mt-1">{c.fullName}</h3>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      c.status === 'Reunited'
                        ? 'bg-emerald-100 text-emerald-800'
                        : c.status === 'Located'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800 animate-pulse'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-700 space-y-1.5">
                  <p className="flex items-center gap-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <strong>Last Seen:</strong> {c.lastSeenLocation}
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <strong>Time:</strong> {c.lastSeenTime}
                  </p>
                  <p className="text-slate-800">
                    <strong>Clothing:</strong> {c.clothingDescription}
                  </p>
                  {c.identifyingFeatures && (
                    <p className="text-slate-600 italic">
                      <strong>Features:</strong> {c.identifyingFeatures}
                    </p>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                  <span>Reporter: <strong>{c.reporterName}</strong></span>
                  <span className="block text-slate-400">Phone: {c.reporterPhone}</span>
                </div>
              </div>

              {/* Operator Action Controls */}
              {isOperator && (
                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 text-xs">
                  {c.status !== 'Located' && c.status !== 'Reunited' && (
                    <button
                      onClick={() => handleUpdateStatus(c.caseId, 'Located')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-2.5 rounded-xl transition cursor-pointer"
                    >
                      Mark Located
                    </button>
                  )}
                  {c.status !== 'Reunited' && (
                    <button
                      onClick={() => handleUpdateStatus(c.caseId, 'Reunited')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2.5 rounded-xl transition cursor-pointer"
                    >
                      Mark Reunited
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl p-6 space-y-4 animate-in fade-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Report a Missing Person</h3>
                <p className="text-xs text-slate-500">Alerts Central Lost & Found at Collectorate Grounds</p>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sai Vignesh"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Age *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={110}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Last Seen Location / Ghat *</label>
                <input
                  type="text"
                  required
                  value={lastSeenLocation}
                  onChange={(e) => setLastSeenLocation(e.target.value)}
                  placeholder="e.g. Pushkar Ghat Gate 2 or Kotilingala steps"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Last Seen Time</label>
                <input
                  type="text"
                  value={lastSeenTime}
                  onChange={(e) => setLastSeenTime(e.target.value)}
                  placeholder="e.g. Today at 09:30 AM"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clothing Description *</label>
                <textarea
                  rows={2}
                  required
                  value={clothingDescription}
                  onChange={(e) => setClothingDescription(e.target.value)}
                  placeholder="Color of shirt, trousers, footwear, cap, bag, etc."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Identifying Features / Language Spoken</label>
                <input
                  type="text"
                  value={identifyingFeatures}
                  onChange={(e) => setIdentifyingFeatures(e.target.value)}
                  placeholder="e.g. Speaks Hindi only, birthmark on left wrist, spectacles"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reporter Name *</label>
                  <input
                    type="text"
                    required
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reporter Phone *</label>
                  <input
                    type="tel"
                    required
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    placeholder="+91 98480 12345"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-xl shadow"
                >
                  {isSubmitting ? 'Submitting...' : 'Broadcast Search Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
