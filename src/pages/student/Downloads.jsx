import React, { useState, useEffect } from 'react';
import { Trash2, FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotebookView from '../../components/NotebookView';

const Downloads = () => {
  const [downloads, setDownloads] = useState([]);
  const [viewingNote, setViewingNote] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = () => {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('offline_note_')) {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            const id = key.replace('offline_note_', '');
            items.push({ ...data, id });
        } catch (e) {
            console.error("Error parsing note", e);
        }
      }
    }
    setDownloads(items);
  };

  const handleDelete = (id) => {
    localStorage.removeItem(`offline_note_${id}`);
    setDownloads(prev => prev.filter(item => item.id !== id));
  };

  if (viewingNote) {
    return (
      // ✅ Fixed Fullscreen Overlay
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* ✅ Scrollable Container for NotebookView */}
        {/* 'overflow-y-auto' yahan lagaya hai taaki ye div scroll kare */}
        <div className="flex-1 w-full h-full overflow-y-auto bg-white">
            <NotebookView 
              notesContent={viewingNote.content} 
              title={viewingNote.title} 
              videoId={viewingNote.id}
              onBack={() => setViewingNote(null)} 
            />
        </div>
        
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 pb-24 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Offline Downloads</h1>
      
      {downloads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 opacity-50">
             <FileText size={32} />
          </div>
          <p className="font-medium">No notes saved yet.</p>
          <p className="text-xs mt-1">Save notes from the video player to read offline.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {downloads.map((note) => (
            <div 
              key={note.id} 
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between active:scale-[0.99] transition-all"
            >
              <div onClick={() => setViewingNote(note)} className="flex items-center gap-4 cursor-pointer flex-1 min-w-0">
                <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 shrink-0">
                  <FileText size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 truncate text-base">{note.title}</h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Saved on {new Date(note.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={(e) => { 
                    e.stopPropagation(); 
                    if(confirm('Are you sure you want to delete this note?')) handleDelete(note.id); 
                }} 
                className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="Delete Note"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Downloads;