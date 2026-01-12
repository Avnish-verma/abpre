import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';
import NotesViewer from '../../components/NotesViewer';

const ViewNotes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { note } = location.state || {}; 

  if (!note || !note.notesUrl) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <p className="text-gray-500 mb-4">No PDF URL found.</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      {/* Header */}
      <div className="bg-white p-3 border-b flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
             <ArrowLeft size={20} className="text-gray-700"/>
          </button>
          <div>
            <h1 className="font-bold text-gray-800 text-sm md:text-base line-clamp-1">{note.title}</h1>
            <p className="text-[10px] text-gray-500">PDF Viewer</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a 
            href={note.notesUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            download
            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
            title="Download"
          >
            <Download size={20}/>
          </a>
        </div>
      </div>

      {/* Viewer Container */}
      <div className="flex-1 overflow-hidden relative">
        {/* Pass the URL to the dedicated component */}
        <NotesViewer pdfUrl={note.notesUrl} />
      </div>
    </div>
  );
};

export default ViewNotes;