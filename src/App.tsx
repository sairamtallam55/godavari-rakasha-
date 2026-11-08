import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { DemoDataBanner } from './components/DemoDataBanner';
import { BottomNav } from './components/BottomNav';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { HomePage } from './pages/HomePage';
import { ReportEmergencyPage } from './pages/ReportEmergencyPage';
import { LiveMapPage } from './pages/LiveMapPage';
import { ControlRoomPage } from './pages/ControlRoomPage';
import { ResponderPortalPage } from './pages/ResponderPortalPage';
import { MissingPersonsPage } from './pages/MissingPersonsPage';
import { CrowdMonitoringPage } from './pages/CrowdMonitoringPage';
import { FacilitiesPage } from './pages/FacilitiesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TrackIncidentPage } from './pages/TrackIncidentPage';

const ToastBanner: React.FC = () => {
  const { toast } = useApp();
  if (!toast) return null;

  const bg =
    toast.type === 'error'
      ? 'bg-red-600 text-white'
      : toast.type === 'success'
      ? 'bg-emerald-600 text-white'
      : toast.type === 'warning'
      ? 'bg-amber-600 text-white'
      : 'bg-blue-600 text-white';

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-4 z-50 max-w-md animate-in slide-in-from-bottom duration-200">
      <div className={`${bg} px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-semibold flex items-center gap-2`}>
        <span>{toast.message}</span>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
          {/* Official Demo Banner */}
          <DemoDataBanner />

          {/* Navigation Header */}
          <Header />

          {/* Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/report" element={<ReportEmergencyPage />} />
              <Route path="/map" element={<LiveMapPage />} />
              <Route path="/admin" element={<ControlRoomPage />} />
              <Route path="/responder" element={<ResponderPortalPage />} />
              <Route path="/missing-persons" element={<MissingPersonsPage />} />
              <Route path="/crowd" element={<CrowdMonitoringPage />} />
              <Route path="/facilities" element={<FacilitiesPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/track" element={<TrackIncidentPage />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 hidden sm:block">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <p className="font-bold text-white">Godavari Raksha • Pushkaralu 2027 Public Safety</p>
                <p className="text-slate-500 mt-0.5">
                  Designed for emergency detection, incident triage, and response coordination in Andhra Pradesh, India.
                </p>
              </div>
              <div className="text-slate-500 text-[11px]">
                <p>Helplines: 112 (Police & SDRF) • 108 (Ambulance) • 0883-2464400 (Lost Child)</p>
                <p className="mt-0.5 text-amber-400 font-semibold">SYNTHETIC DEMO DATASET • PROTOTYPE ONLY</p>
              </div>
            </div>
          </footer>

          {/* Mobile Bottom Navigation */}
          <BottomNav />

          {/* AI Multilingual Safety Drawer */}
          <AiAssistantDrawer />

          {/* Toast Notifications */}
          <ToastBanner />
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
