import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Layers, Users, X, HelpCircle ,FileType} from 'lucide-react'; 

const AdminSidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black/50 z-40 md:hidden"></div>}

      <div className={`fixed top-0 left-0 min-h-screen w-64 bg-slate-900 text-white border-r border-slate-800 z-50 shadow-xl transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static`}>
        
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Admin Panel</span>
          <button onClick={onClose} className="md:hidden text-gray-400"><X size={24}/></button>
        </div>

        <nav className="p-4 space-y-2">
          <Link to="/admin/dashboard" onClick={onClose} className={`flex items-center gap-3 p-3 rounded-lg transition font-medium ${isActive('/admin/dashboard') ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-slate-800 hover:text-white"}`}>
             <LayoutDashboard size={20} /> <span>Dashboard</span>
          </Link>
          <Link to="/admin/batches" onClick={onClose} className={`flex items-center gap-3 p-3 rounded-lg transition font-medium ${isActive('/admin/batches') ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-slate-800 hover:text-white"}`}>
             <Layers size={20} /> <span>Batches</span>
          </Link>
          <Link to="/admin/students" onClick={onClose} className={`flex items-center gap-3 p-3 rounded-lg transition font-medium ${isActive('/admin/students') ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-slate-800 hover:text-white"}`}>
             <Users size={20} /> <span>Students</span>
          </Link>
          <Link to="/admin/doubts" onClick={onClose} className={`flex items-center gap-3 p-3 rounded-lg transition font-medium ${isActive('/admin/doubts') ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-slate-800 hover:text-white"}`}>
             <HelpCircle size={20} /> <span>Doubts</span>
          </Link>
          <Link 
  to="/admin/quizzes" 
  onClick={onClose} 
  className={`flex items-center gap-3 p-3 rounded-lg transition font-medium ${
    isActive('/admin/quizzes') ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-slate-800 hover:text-white"
  }`}
>
   <FileType size={20} />
   <span>Quiz Builder</span>
</Link>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <button onClick={() => logout()} className="flex items-center gap-3 text-red-400 font-medium p-2 hover:bg-red-500/10 w-full rounded-lg transition">
            <LogOut size={20} /> <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;