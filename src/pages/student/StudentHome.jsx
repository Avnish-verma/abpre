import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { Search, BookOpen, ChevronRight, Lock, CheckCircle } from 'lucide-react';

const StudentHome = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]); // Store User's Enrolled IDs
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch All Batches
        const q = query(collection(db, "batches"));
        const snapshot = await getDocs(q);
        const batchesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBatches(batchesData);

        // 2. Fetch User Enrollment Data
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setEnrolledIds(userSnap.data().enrolledBatches || []);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  // Helper Check
  const isEnrolled = (batchId) => enrolledIds.includes(batchId);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      
      {/* HEADER */}
      <div className="bg-blue-600 text-white p-6 rounded-b-3xl shadow-lg mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">Hi, {user?.displayName?.split(' ')[0] || 'Student'} 👋</h1>
            <p className="text-blue-100 text-sm">Let's continue learning today!</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold backdrop-blur-sm">
            {user?.displayName?.charAt(0) || "U"}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input 
            type="text" placeholder="Search courses..." 
            className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-200 rounded-xl py-3 pl-10 pr-4 backdrop-blur-md focus:outline-none focus:bg-white/20 transition"
          />
          <Search className="absolute left-3 top-3.5 text-blue-200" size={18}/>
        </div>
      </div>

      <div className="px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-blue-600" size={20}/> All Courses
          </h2>
        </div>

        {loading ? (
           <div className="space-y-4">
             {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse"/>)}
           </div>
        ) : (
          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3">
            {batches.map((batch) => {
              const enrolled = isEnrolled(batch.id);
              return (
                <div 
                  key={batch.id} 
                  onClick={() => navigate(`/student/course/${batch.id}`)}
                  className={`relative bg-white rounded-xl shadow-sm border p-3 flex gap-4 cursor-pointer active:scale-[0.98] transition touch-manipulation ${
                    enrolled ? 'border-green-200' : 'border-gray-100'
                  }`}
                >
                  {/* Status Badge (Top Right) */}
                  <div className={`absolute top-0 right-0 px-2 py-1 rounded-bl-xl text-[10px] font-bold flex items-center gap-1 ${
                    enrolled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {enrolled ? <><CheckCircle size={10}/> Enrolled</> : <><Lock size={10}/> Locked</>}
                  </div>

                  {/* Thumbnail */}
                  <div className="w-24 h-24 shrink-0 bg-gray-200 rounded-lg overflow-hidden relative">
                    <img 
                      src={batch.thumbnail || `https://ui-avatars.com/api/?name=${batch.name}&background=random`} 
                      className={`w-full h-full object-cover ${!enrolled && 'grayscale opacity-80'}`} // Gray if locked
                      alt={batch.name}
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit mb-1">
                      {batch.subject || 'Subject'}
                    </span>
                    <h3 className="font-bold text-gray-800 line-clamp-2 leading-tight mb-1">{batch.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1 mb-2">{batch.description}</p>
                    
                    <div className={`flex items-center text-xs font-bold mt-auto ${enrolled ? 'text-green-600' : 'text-blue-600'}`}>
                      {enrolled ? 'Continue Learning' : 'View Details'} <ChevronRight size={14} className="ml-1"/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHome;