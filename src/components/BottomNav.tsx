import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, AlertOctagon, Map, Users, ShieldCheck, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { role, incidents } = useApp();

  const pendingCount = incidents.filter(
    (i) => i.status === 'Submitted' || i.status === 'Under Review'
  ).length;

  const tabs = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/report', label: 'Report', icon: AlertOctagon, highlight: true },
    { to: '/map', label: 'Live Map', icon: Map },
    { to: '/crowd', label: 'Ghats', icon: Activity },
    role === 'admin'
      ? { to: '/admin', label: 'Control', icon: ShieldCheck, badge: pendingCount }
      : role === 'responder'
      ? { to: '/responder', label: 'Tasks', icon: ShieldCheck }
      : { to: '/missing-persons', label: 'Lost Persons', icon: Users },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-40 py-1.5 px-2 shadow-2xl safe-area-pb">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.to;
          const Icon = tab.icon;

          if (tab.highlight) {
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className="flex flex-col items-center -mt-5"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-600/40 border-2 border-slate-900 active:scale-95 transition-transform">
                  <Icon className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-[10px] font-bold text-red-400 mt-0.5">
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex flex-col items-center py-1 px-2 relative transition-colors ${
                isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-amber-500 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
