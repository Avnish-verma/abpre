import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, BookOpen, UserCircle, Download, X } from 'lucide-react'; 

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black/50 z-40 md:hidden"></div>}

      {/* Sidebar Content */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white border-r z-50 shadow-xl transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:shadow-none`}>
        
        <div className="p-6 border-b flex justify-between items-center">
          <span className="text-xl font-bold text-blue-600">coaching Classes</span>
          <button onClick={onClose} className="md:hidden text-gray-500"><X size={24}/></button>
        </div>

        <nav className="p-4 space-y-2">
          <Link to="/student/home" onClick={onClose} className={`flex items-center gap-3 p-3 rounded-lg font-medium ${isActive('/student/home') ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}>
             <Home size={20} /> <span>Home</span>
          </Link>
          <Link to="/student/my-courses" onClick={onClose} className={`flex items-center gap-3 p-3 rounded-lg font-medium ${isActive('/student/my-courses') ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}>
             <BookOpen size={20} /> <span>My Courses</span>
          </Link>
          <Link to="/student/downloads" onClick={onClose} className={`flex items-center gap-3 p-3 rounded-lg font-medium ${isActive('/student/downloads') ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}>
             <Download size={20} /> <span>Downloads</span>
          </Link>
          <Link to="/student/profile" onClick={onClose} className={`flex items-center gap-3 p-3 rounded-lg font-medium ${isActive('/student/profile') ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}>
             <UserCircle size={20} /> <span>Profile</span>
          </Link>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <button onClick={() => logout()} className="flex items-center gap-3 text-red-600 font-medium p-2 hover:bg-red-50 w-full rounded-lg transition">
            <LogOut size={20} /> <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;