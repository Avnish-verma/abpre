import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import AdminSidebar from './AdminSidebar';
import BottomNav from './BottomNav';

const Layout = ({ children, role }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar based on Role */}
      {role === 'admin' ? (
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      ) : (
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 relative">
        
        {/* Mobile Header */}
        <div className="md:hidden bg-white p-4 flex items-center shadow-sm sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-700">
            <Menu size={24} />
          </button>
          <span className="font-bold text-lg ml-3 text-blue-600">
            {role === 'admin' ? 'Admin Panel' : 'Coaching Classes'}
          </span>
        </div>

        {/* Page Content */}
        <main className="flex-1 relative">
          {children}
        </main>

        {/* Bottom Nav for Students Only */}
        {role === 'student' && <BottomNav />}
      </div>
    </div>
  );
};

export default Layout;