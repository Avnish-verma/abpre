import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Users, BookOpen, Video, IndianRupee, TrendingUp, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: 0,
    batches: 0,
    doubts: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1. Count Students
        const usersSnap = await getDocs(collection(db, "users"));
        const studentCount = usersSnap.size;

        // 2. Count Batches
        const batchesSnap = await getDocs(collection(db, "batches"));
        const batchCount = batchesSnap.size;

        // 3. Count Pending Doubts
        const doubtsQuery = query(collection(db, "interactions"), where("type", "==", "doubt"), where("reply", "==", null));
        const doubtsSnap = await getDocs(doubtsQuery);
        const pendingDoubts = doubtsSnap.size;

        setStats({
          students: studentCount,
          batches: batchCount,
          doubts: pendingDoubts,
          revenue: studentCount * 499 // Dummy logic: 1 student = 499 (Adjust logic as needed)
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="p-6 pb-20">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Total Students</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.students}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Active Batches</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.batches}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl text-green-600">
            <IndianRupee size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Est. Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900">₹{stats.revenue}</h3>
          </div>
        </div>

        <div onClick={() => navigate('/admin/doubts')} className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4 cursor-pointer hover:border-orange-300">
          <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
            <HelpCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Pending Doubts</p>
            <h3 className="text-2xl font-bold text-orange-600">{stats.doubts}</h3>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
           <h3 className="font-bold text-lg mb-4 text-gray-800">Quick Actions</h3>
           <div className="space-y-3">
             <button onClick={() => navigate('/admin/batches')} className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border flex justify-between items-center group">
               <span className="font-medium text-gray-700">Manage Courses</span>
               <span className="text-gray-400 group-hover:text-blue-600">→</span>
             </button>
             <button onClick={() => navigate('/admin/upload')} className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border flex justify-between items-center group">
               <span className="font-medium text-gray-700">Generate AI Notes (No Storage)</span>
               <span className="text-gray-400 group-hover:text-blue-600">→</span>
             </button>
             <button onClick={() => navigate('/admin/doubts')} className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border flex justify-between items-center group">
               <span className="font-medium text-gray-700">Solve Doubts</span>
               <span className="text-gray-400 group-hover:text-blue-600">→</span>
             </button>
           </div>
        </div>

        <div className="bg-blue-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
           <div className="relative z-10">
             <h3 className="font-bold text-xl mb-2">Admin Pro Tips</h3>
             <ul className="text-sm space-y-2 text-blue-100">
               <li>• Use Google Drive links for PDF Notes.</li>
               <li>• Use YouTube Unlisted links for Videos.</li>
               <li>• Use 'Admin Upload' to convert handwritten notes to text.</li>
             </ul>
           </div>
           <TrendingUp className="absolute bottom-[-20px] right-[-20px] text-blue-500 opacity-50" size={150} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;