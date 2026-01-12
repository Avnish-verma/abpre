import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Mail, Phone, Shield } from 'lucide-react';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen pb-24 p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm border text-center mb-6">
        <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-blue-600 text-3xl font-bold border-4 border-white shadow">
          {currentUser?.displayName?.charAt(0) || "U"}
        </div>
        <h2 className="text-xl font-bold text-gray-900">{currentUser?.displayName || "Student"}</h2>
        <p className="text-gray-500 text-sm">{currentUser?.email}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-6">
        <div className="p-4 border-b flex items-center gap-3">
           <Mail size={20} className="text-gray-400" />
           <div>
             <p className="text-xs text-gray-500">Email Address</p>
             <p className="text-sm font-medium text-gray-800">{currentUser?.email}</p>
           </div>
        </div>
        <div className="p-4 flex items-center gap-3">
           <Phone size={20} className="text-gray-400" />
           <div>
             <p className="text-xs text-gray-500">Phone</p>
             <p className="text-sm font-medium text-gray-400">Not Added</p>
           </div>
        </div>
      </div>

      <button onClick={handleLogout} className="w-full bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-3 text-red-600 font-bold justify-center hover:bg-red-100 transition">
        <LogOut size={20} /> Logout
      </button>
    </div>
  );
};

export default Profile;