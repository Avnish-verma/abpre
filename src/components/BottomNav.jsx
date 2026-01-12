import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, UserCircle, Download } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center py-3 z-50 md:hidden shadow-lg pb-safe">
      <Link to="/student/home" className={`flex flex-col items-center gap-1 ${isActive('/student/home') ? "text-blue-600" : "text-gray-400"}`}>
        <Home size={24} />
        <span className="text-[10px] font-medium">Home</span>
      </Link>
      <Link to="/student/my-courses" className={`flex flex-col items-center gap-1 ${isActive('/student/my-courses') ? "text-blue-600" : "text-gray-400"}`}>
        <BookOpen size={24} />
        <span className="text-[10px] font-medium">Courses</span>
      </Link>
      <Link to="/student/downloads" className={`flex flex-col items-center gap-1 ${isActive('/student/downloads') ? "text-blue-600" : "text-gray-400"}`}>
        <Download size={24} />
        <span className="text-[10px] font-medium">Saved</span>
      </Link>
      <Link to="/student/profile" className={`flex flex-col items-center gap-1 ${isActive('/student/profile') ? "text-blue-600" : "text-gray-400"}`}>
        <UserCircle size={24} />
        <span className="text-[10px] font-medium">Profile</span>
      </Link>
    </div>
  );
};

export default BottomNav;