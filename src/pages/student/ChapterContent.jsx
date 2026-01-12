import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, PlayCircle, FileText, Lock } from 'lucide-react';

const ChapterContent = () => {
  const { batchId, subjectName, chapterName } = useParams();
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [content, setContent] = useState([]);
  const [activeTab, setActiveTab] = useState('video');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Enrollment Status Check karein
        if (user) {
          const userSnap = await getDoc(doc(db, "users", user.uid));
          if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.enrolledBatches?.includes(batchId)) {
              setIsEnrolled(true);
            }
          }
        }

        // 2. Database se Content (Videos/Notes) fetch karein
        const q = query(
          collection(db, "contents"),
          where("batchId", "==", batchId),
          where("subject", "==", subjectName),
          where("chapter", "==", chapterName)
        );
        const snapshot = await getDocs(q);
        setContent(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching content:", err);
      }
      setLoading(false);
    };
    fetchData();
  }, [batchId, subjectName, chapterName, user]);

  const videos = content.filter(c => c.type === 'video');
  const notes = content.filter(c => c.type === 'note');

  // ✨ UPDATED: Click handler for App-internal Navigation
  const handleItemClick = (item) => {
    // Basic Security: Agar student enrolled nahi hai to lock dikhao
    if (!isEnrolled) {
      alert("🔒 This content is locked! Please buy the course to access.");
      return;
    }

    if (item.type === 'video') {
      // Custom Video Player page par bhejein
      navigate(`/student/watch/${item.id}`, { state: { video: item } });
    } 
    else if (item.type === 'note') {
      // ✨ Naye React PDF Viewer page par bhejein
      if (item.notesUrl) {
        navigate(`/student/notes/${item.id}`, { state: { note: item } });
      } else {
        alert("PDF file link is missing in database.");
      }
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Loading chapter content...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* --- STICKY HEADER --- */}
      <div className="bg-white p-4 border-b sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-lg text-gray-800 line-clamp-1">{chapterName}</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{subjectName}</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('video')} 
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === 'video' ? 'bg-white shadow text-blue-600' : 'text-gray-500'
            }`}
          >
            <PlayCircle size={16} /> Lectures
          </button>
          <button 
            onClick={() => setActiveTab('notes')} 
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === 'notes' ? 'bg-white shadow text-blue-600' : 'text-gray-500'
            }`}
          >
            <FileText size={16} /> PDF Notes
          </button>
        </div>
      </div>

      {/* --- CONTENT LIST --- */}
      <div className="p-4 space-y-3">
        
        {/* Unenrolled Student Banner */}
        {!isEnrolled && (
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center gap-3 mb-4">
             <Lock className="text-blue-500" size={18}/>
             <p className="text-[11px] text-blue-700 font-medium">
               Enroll now to unlock all lectures and premium PDF notes.
             </p>
          </div>
        )}

        {/* VIDEOS LIST */}
        {activeTab === 'video' && (
          videos.length > 0 ? videos.map(item => (
            <div 
              key={item.id} 
              onClick={() => handleItemClick(item)}
              className={`bg-white p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition ${
                !isEnrolled ? 'opacity-70' : 'hover:border-blue-400 hover:shadow-md active:scale-95'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                !isEnrolled ? 'bg-gray-100 text-gray-400' : 'bg-red-50 text-red-500'
              }`}>
                {!isEnrolled ? <Lock size={20}/> : <PlayCircle size={24} />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm text-gray-800 line-clamp-2">{item.title}</h3>
                <span className="text-[10px] text-gray-400 font-medium">Video Lecture</span>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 text-gray-300">No videos uploaded yet.</div>
          )
        )}

        {/* NOTES LIST */}
        {activeTab === 'notes' && (
          notes.length > 0 ? notes.map(item => (
            <div 
              key={item.id} 
              onClick={() => handleItemClick(item)}
              className={`bg-white p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition ${
                !isEnrolled ? 'opacity-70' : 'hover:border-blue-400 hover:shadow-md active:scale-95'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                !isEnrolled ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-500'
              }`}>
                {!isEnrolled ? <Lock size={20}/> : <FileText size={24} />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm text-gray-800 line-clamp-2">{item.title}</h3>
                <span className="text-[10px] text-gray-400 font-medium">Class Notes</span>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 text-gray-300">No notes found.</div>
          )
        )}
      </div>
    </div>
  );
};

export default ChapterContent;