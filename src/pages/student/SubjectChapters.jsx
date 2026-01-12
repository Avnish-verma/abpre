import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { ArrowLeft, Book, ChevronRight } from 'lucide-react';

const SubjectChapters = () => {
  const { batchId, subjectName } = useParams();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    const fetchChapters = async () => {
      // Sirf us batch aur us subject ka content lao
      const q = query(
        collection(db, "contents"), 
        where("batchId", "==", batchId),
        where("subject", "==", subjectName)
      );
      const snapshot = await getDocs(q);
      const allData = snapshot.docs.map(doc => doc.data());

      // Unique Chapters Nikalo
      const uniqueChapters = [...new Set(allData.map(item => item.chapter || "Unit 1"))];
      setChapters(uniqueChapters);
    };
    fetchChapters();
  }, [batchId, subjectName]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Header */}
      <div className="bg-white p-4 border-b flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-lg">{subjectName}</h1>
      </div>

      {/* Chapters List */}
      <div className="p-4 space-y-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Chapters</p>
        
        {chapters.map((chap, index) => (
          <div 
            key={index}
            onClick={() => navigate(`/student/course/${batchId}/subject/${subjectName}/chapter/${chap}`)}
            className="bg-white p-4 rounded-xl border flex justify-between items-center cursor-pointer hover:shadow-md transition active:scale-95"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                <Book size={20} />
              </div>
              <span className="font-medium text-gray-800">{chap}</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
        ))}

        {chapters.length === 0 && (
          <div className="text-center py-10 text-gray-500">No chapters found.</div>
        )}
      </div>
    </div>
  );
};

export default SubjectChapters;