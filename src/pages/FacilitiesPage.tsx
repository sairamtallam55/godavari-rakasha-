import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Search,
  PhoneCall,
  MapPin,
  Clock,
  Compass,
  Filter,
  CheckCircle2,
  LifeBuoy,
  Shield,
  Droplet,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FacilitiesPage: React.FC = () => {
  const { facilities } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    { id: 'All', label: 'All Facilities', icon: Building2 },
    { id: 'Hospital', label: 'Hospitals', icon: Building2 },
    { id: 'First Aid Post', label: 'First Aid Posts', icon: CheckCircle2 },
    { id: 'Police Help Desk', label: 'Police Desks', icon: Shield },
    { id: 'River Rescue Boat', label: 'SDRF River Boats', icon: LifeBuoy },
    { id: 'Drinking Water Point', label: 'Drinking Water', icon: Droplet },
    { id: 'Lost & Found Center', label: 'Lost & Found', icon: Users },
  ];

  const filteredFacilities = facilities.filter((fac) => {
    if (selectedCategory !== 'All' && fac.category !== selectedCategory) return false;
    const q = searchQuery.toLowerCase();
    return (
      fac.name.toLowerCase().includes(q) ||
      fac.address.toLowerCase().includes(q) ||
      fac.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
            <Building2 className="w-6 h-6" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Public Safety & Emergency Facilities
          </h1>
          <span className="bg-black text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
            DEMO DATA
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Searchable directory of 24/7 hospitals, first-aid medical camps, police help desks, SDRF patrol jetties, and RO water points in Rajahmundry & Kovvur.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {categories.map((c) => {
            const Icon = c.icon;
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facility name, address, or location..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFacilities.map((fac) => (
          <div
            key={fac.facilityId}
            className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase tracking-wider">
                    {fac.category}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base mt-1">{fac.name}</h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {fac.verificationStatus}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5">
                <p className="flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{fac.address}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Hours: <strong>{fac.operatingHours}</strong></span>
                </p>
                {fac.capacity && (
                  <p className="text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-100 text-[11px]">
                    <strong>Capacity / Facilities:</strong> {fac.capacity}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <a
                href={`tel:${fac.contactNumber.replace(/[^0-9]/g, '')}`}
                className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-xl text-xs transition"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{fac.contactNumber}</span>
              </a>

              <Link
                to={`/map?lat=${fac.latitude}&lng=${fac.longitude}`}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 rounded-xl text-xs transition"
              >
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span>View on Map</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
