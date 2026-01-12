import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase'; // Path check kar lena
import { doc, getDoc } from 'firebase/firestore';
import { sheetService } from '../../services/sheetService'; // Path check kar lena

// Components
import MyVideoPlayer from '../../components/MyVideoPlayer';
import NotebookView from '../../components/NotebookView'; // Handwritten feel wala component
import DoubtsSection from '../../components/DoubtsSection';

const Player = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // 'video' object BatchContent/CourseDetail se aa raha hai (isme 'id' hai)
  const videoBasicData = location.state?.video; 

  const [activeTab, setActiveTab] = useState('notes');
  const [secureUrl, setSecureUrl] = useState(null);
  const [aiNotes, setAiNotes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!videoBasicData?.id) return;

    const fetchContent = async () => {
      setLoading(true);
      try {
        // 1. Fetch Secure URL from Firestore (Security Check)
        const vidRef = doc(db, "secure_videos", videoBasicData.id);
        const vidSnap = await getDoc(vidRef);
        
        if (vidSnap.exists()) {
          setSecureUrl(vidSnap.data().url);
        } else {
          console.error("Secure link not found");
        }

        // 2. Fetch AI Notes from Google Sheet
        const notesData = await sheetService.getNotes(videoBasicData.id);
        if (notesData) {
            setAiNotes(notesData); // { title: "...", content: "..." }
        }

      } catch (error) {
        console.error("Error loading content:", error);
      }
      setLoading(false);
    };

    fetchContent();
  }, [videoBasicData]);

  if (!videoBasicData) return <div className="p-10 text-white bg-black">No Video Selected</div>;

  return (
    <div className="premium-player-page bg-[#0f0f0f] min-h-screen text-white">
      {/* Header */}
      <header className="royal-header flex items-center p-4 border-b border-gray-800 sticky top-0 bg-[#0f0f0f]/90 z-50">
        <button onClick={() => navigate(-1)} className="mr-4 text-2xl">←</button>
        <div className="font-bold truncate">{videoBasicData.title}</div>
      </header>

      {/* Video Player Area */}
      <div className="video-section max-w-5xl mx-auto bg-black aspect-video flex items-center justify-center">
        {loading ? (
            <div className="animate-pulse text-gray-400">Loading Secure Stream...</div>
        ) : secureUrl ? (
            <MyVideoPlayer videoUrl={secureUrl} />
        ) : (
            <div className="text-red-500">Video Link Unavailable or Access Denied</div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs-container flex border-b border-gray-800 bg-[#0f0f0f] sticky top-[60px] z-40">
        <button className={`flex-1 p-4 font-bold ${activeTab === 'notes' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`} onClick={() => setActiveTab('notes')}>
           📚 Smart Notes
        </button>
        <button className={`flex-1 p-4 font-bold ${activeTab === 'doubts' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`} onClick={() => setActiveTab('doubts')}>
           💬 Doubts
        </button>
      </div>

      {/* Tab Content */}
      <div className="content-area max-w-5xl mx-auto p-4 pb-20">
        
        {/* NOTES TAB */}
        {activeTab === 'notes' && (
          <div className="animate-fade-in">
            {aiNotes ? (
              <NotebookView 
                 notesContent={aiNotes.content} // Markdown text
                 title={videoBasicData.title}
                 videoId={videoBasicData.id}
              />
            ) : (
              <div className="p-10 text-center text-gray-500 border border-dashed border-gray-700 rounded-xl mt-4">
                <p>No AI Notes generated for this lecture yet.</p>
                <p className="text-xs mt-2">Admin can upload notes from Dashboard.</p>
              </div>
            )}
          </div>
        )}

        {/* DOUBTS TAB */}
        {activeTab === 'doubts' && (
          <DoubtsSection 
             videoId={videoBasicData.id} 
             videoTitle={videoBasicData.title}
          />
        )}
      </div>
    </div>
  );
};

export default Player;