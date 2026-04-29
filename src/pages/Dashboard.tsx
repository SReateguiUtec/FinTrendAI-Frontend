import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/components/dashboard/sidebar';
import { TopBar } from '@/components/dashboard/topbar';

// Sub-páginas
import { VistaGeneral } from './dashboard/VistaGeneral';
import { Seguimiento } from './dashboard/Seguimiento';
import { Analitica } from './dashboard/Analitica';
import { Senales } from './dashboard/Senales';
import { Noticias } from './dashboard/Noticias';
import { FloatingChatWidget } from '@/components/ui/FloatingChat';

const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <Routes>
            <Route index element={<VistaGeneral />} />
            <Route path="seguimiento" element={<Seguimiento />} />
            <Route path="analitica" element={<Analitica />} />
            <Route path="senales" element={<Senales />} />
            <Route path="noticias" element={<Noticias />} />
          </Routes>
        </main>
      </div>

      <FloatingChatWidget />
    </div>
  );
};

export default Dashboard;
