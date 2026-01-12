import React from 'react';
import { Home, BookOpen, Download, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/student' },
    { icon: BookOpen, label: 'My Courses', path: '/student/courses' },
    { icon: Download, label: 'Downloads', path: '/student/downloads' },
    { icon: User, label: 'Profile', path: '/student/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 md:hidden">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.label} to={item.path} className="flex flex-col items-center gap-1">
              <item.icon 
                size={24} 
                className={isActive ? 'text-blue-600' : 'text-gray-400'} 
              />
              <span className={`text-[10px] ${isActive ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;