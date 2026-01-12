import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { ArrowLeft, PlayCircle, FileText, ChevronDown, ChevronRight, Book, Lock } from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [expandedChapter, setExpandedChapter] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "batches", id), (doc) => {
      if (doc.exists()) setCourse({ id: doc.id, ...doc.data() });
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  const handleVideoClick = (video, subject, chapter) => {
    // Video object pass kar rahe hain jisme "id" hai. 
    // "url" ab yahan nahi hai (Secure hai), wo WatchVideo page par fetch hoga.
    navigate(`/student/watch/${video.id}`, { 
      state: { video: { ...video, subject, chapter, courseId: id } } 
    });
  };

  const handleNoteClick = (note) => {
    navigate('/student/view-pdf', { state: { note } });
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Loading Content...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      
      {/* Mobile Header */}
      <div className="relative h-56 bg-gray-900">
        <img 
           src={course?.thumbnail || "https://source.unsplash.com/random/800x600?book"} 
           className="w-full h-full object-cover opacity-60"
           alt="Header"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/80 to-transparent"></div>
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-white/20 p-2 rounded-full backdrop-blur-md text-white active:scale-95">
           <ArrowLeft size={24}/>
        </button>
        <div className="absolute bottom-4 left-4 right-4">
          <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded mb-2 inline-block">
            {course?.subject || "Course"}
          </span>
          <h1 className="text-2xl font-bold text-white leading-tight shadow-sm">{course?.name}</h1>
        </div>
      </div>

      {/* Content List */}
      <div className="p-4 -mt-4 relative z-10">
        <div className="bg-white rounded-t-2xl shadow-sm min-h-[500px] p-2">
          
          <div className="text-center py-2 mb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto"></div>
          </div>

          {Object.keys(course?.syllabus || {}).length === 0 ? (
             <div className="text-center py-10 text-gray-400">No content uploaded yet.</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(course.syllabus).map(([subject, chapters]) => (
                <div key={subject} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  
                  {/* Subject Header */}
                  <div 
                    onClick={() => setExpandedSubject(expandedSubject === subject ? null : subject)}
                    className="flex items-center justify-between p-4 bg-white active:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 text-blue-600 p-2 rounded-lg"><Book size={20}/></div>
                      <div>
                        <h3 className="font-bold text-gray-800">{subject}</h3>
                        <p className="text-xs text-gray-500">{Object.keys(chapters).length} Chapters</p>
                      </div>
                    </div>
                    {expandedSubject === subject ? <ChevronDown size={20} className="text-gray-400"/> : <ChevronRight size={20} className="text-gray-400"/>}
                  </div>

                  {/* Chapters */}
                  {expandedSubject === subject && (
                    <div className="bg-slate-50 border-t border-gray-100">
                      {Object.entries(chapters).map(([chapter, items]) => (
                        <div key={chapter} className="border-b border-gray-200/50 last:border-0">
                          <div 
                            onClick={() => setExpandedChapter(expandedChapter === chapter ? null : chapter)}
                            className="flex justify-between items-center px-4 py-3 cursor-pointer active:bg-blue-50/50"
                          >
                             <span className="text-sm font-semibold text-gray-700">{chapter}</span>
                             <span className="text-xs bg-white border px-2 py-0.5 rounded text-gray-500">{items?.length || 0}</span>
                          </div>

                          {/* Items */}
                          {expandedChapter === chapter && (
                            <div className="px-4 pb-4 space-y-2">
                              {items.map((item, idx) => (
                                <div 
                                  key={idx} 
                                  onClick={() => item.type === 'video' ? handleVideoClick(item, subject, chapter) : handleNoteClick(item)}
                                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm active:scale-[0.98] transition touch-manipulation"
                                >
                                  <div className={`p-2 rounded-lg shrink-0 ${item.type === 'video' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                                     {item.type === 'video' ? <PlayCircle size={20}/> : <FileText size={20}/>}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 truncate">{item.title}</p>
                                    <div className="flex items-center gap-2">
                                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">
                                        {item.type === 'video' ? 'Video Class' : 'PDF Notes'}
                                      </p>
                                      {item.type === 'video' && <Lock size={10} className="text-green-600"/>}
                                    </div>
                                  </div>
                                  <ChevronRight size={16} className="text-gray-300"/>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;