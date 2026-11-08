import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  PhoneCall,
  AlertOctagon,
  Bot,
  Globe,
  UserCheck,
  ChevronDown,
  Menu,
  X,
  Radio,
  FileSearch,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Language } from '../utils/translations';

export const Header: React.FC = () => {
  const {
    t,
    language,
    setLanguage,
    role,
    setRole,
    setAiAssistantOpen,
    incidents,
  } = useApp();

  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCallDropdown, setShowCallDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const pendingVerificationCount = incidents.filter(
    (i) => i.status === 'Submitted' || i.status === 'Under Review'
  ).length;

  const activeCriticalCount = incidents.filter(
    (i) => (i.verifiedPriority || i.priority) === 'Critical' && i.status !== 'Resolved' && i.status !== 'Rejected'
  ).length;

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/map', label: t.liveMap },
    { to: '/crowd', label: t.crowdMonitor },
    { to: '/missing-persons', label: t.missingPersons },
    { to: '/facilities', label: t.facilities },
    { to: '/track', label: t.trackStatus },
    { to: '/admin', label: t.controlRoom, badge: pendingVerificationCount },
    { to: '/responder', label: t.responderPortal },
    { to: '/analytics', label: t.analytics },
  ];

  const handleRoleSelect = (newRole: UserRole) => {
    setRole(newRole);
    setShowRoleDropdown(false);
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Top Utility Ribbon */}
      <div className="bg-slate-950 px-4 py-1 border-b border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Pushkaralu 2027 Command Active
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-300">
              Rajahmundry & Kovvur Godavari River Sector
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Direct Emergency Call Button */}
            <div className="relative">
              <button
                onClick={() => setShowCallDropdown(!showCallDropdown)}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-2.5 py-0.5 rounded font-bold transition shadow-sm cursor-pointer"
                aria-label="Direct Emergency Call Helplines"
              >
                <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
                <span>Emergency Helplines</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showCallDropdown && (
                <div className="absolute right-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-2 z-50 text-slate-200">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Official Pushkaralu Helplines
                  </div>
                  <a
                    href="tel:112"
                    className="flex items-center justify-between px-3 py-2 hover:bg-slate-800 transition"
                  >
                    <span className="font-semibold text-white">112 Police & Rescue</span>
                    <span className="text-xs bg-red-900/60 text-red-300 px-2 py-0.5 rounded">Toll-Free</span>
                  </a>
                  <a
                    href="tel:108"
                    className="flex items-center justify-between px-3 py-2 hover:bg-slate-800 transition"
                  >
                    <span className="font-semibold text-white">108 Medical Ambulance</span>
                    <span className="text-xs bg-red-900/60 text-red-300 px-2 py-0.5 rounded">Toll-Free</span>
                  </a>
                  <a
                    href="tel:101"
                    className="flex items-center justify-between px-3 py-2 hover:bg-slate-800 transition"
                  >
                    <span className="font-semibold text-white">101 Fire & Disaster</span>
                    <span className="text-xs bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded">Toll-Free</span>
                  </a>
                  <a
                    href="tel:08832464400"
                    className="flex items-center justify-between px-3 py-2 hover:bg-slate-800 transition"
                  >
                    <span className="font-semibold text-white">Lost Child Helpline</span>
                    <span className="text-xs text-slate-400">0883-2464400</span>
                  </a>
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-slate-800 rounded px-2 py-0.5 border border-slate-700">
              <Globe className="w-3 h-3 text-slate-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
                aria-label="Select Language"
              >
                <option value="English" className="bg-slate-900 text-white">English</option>
                <option value="Telugu" className="bg-slate-900 text-white">తెలుగు (Telugu)</option>
                <option value="Hindi" className="bg-slate-900 text-white">हिंदी (Hindi)</option>
              </select>
            </div>

            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-1.5 bg-blue-950 hover:bg-blue-900 text-blue-200 border border-blue-700/60 px-2 py-0.5 rounded font-medium transition cursor-pointer"
                aria-label="Switch User Role"
              >
                <UserCheck className="w-3 h-3 text-blue-400" />
                <span className="capitalize">{role === 'public' ? 'Public' : role === 'responder' ? 'Responder' : 'Admin'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-1 w-52 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-50">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Simulate Role
                  </div>
                  <button
                    onClick={() => handleRoleSelect('public')}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 ${
                      role === 'public' ? 'text-blue-400 font-bold bg-blue-950/40' : 'text-slate-300'
                    }`}
                  >
                    <span>Pilgrim / Public User</span>
                    {role === 'public' && <span className="text-xs">✓</span>}
                  </button>
                  <button
                    onClick={() => handleRoleSelect('responder')}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 ${
                      role === 'responder' ? 'text-amber-400 font-bold bg-amber-950/40' : 'text-slate-300'
                    }`}
                  >
                    <span>Response Team</span>
                    {role === 'responder' && <span className="text-xs">✓</span>}
                  </button>
                  <button
                    onClick={() => handleRoleSelect('admin')}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 ${
                      role === 'admin' ? 'text-purple-400 font-bold bg-purple-950/40' : 'text-slate-300'
                    }`}
                  >
                    <span>Control Room Admin</span>
                    {role === 'admin' && <span className="text-xs">✓</span>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/40 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                {t.appName}
              </span>
              <span className="hidden sm:inline-block bg-blue-900/80 text-blue-300 border border-blue-700/60 text-[10px] font-bold px-1.5 py-0.5 rounded">
                PUSHKARALU 2027
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && link.badge > 0 ? (
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {link.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* AI Guide Trigger */}
          <button
            onClick={() => setAiAssistantOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 border border-indigo-600/60 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm"
            aria-label="Open AI Safety Assistant"
          >
            <Bot className="w-4 h-4 text-indigo-300" />
            <span className="hidden sm:inline">AI Safety Guide</span>
          </button>

          {/* Primary Call to Action: Report Emergency */}
          <Link
            to="/report"
            className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold shadow-lg shadow-red-600/30 transition-all hover:scale-102 active:scale-98"
          >
            <AlertOctagon className="w-4 h-4 animate-bounce" />
            <span>{t.reportEmergency}</span>
          </Link>

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-t border-slate-800 px-4 py-3 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 px-3 rounded-md text-sm text-slate-300 hover:bg-slate-800 hover:text-white font-medium"
            >
              <span>{link.label}</span>
              {link.badge && link.badge > 0 ? (
                <span className="bg-amber-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full">
                  {link.badge}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};
