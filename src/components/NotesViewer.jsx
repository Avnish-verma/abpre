import React from 'react';
import { ExternalLink, AlertTriangle } from 'lucide-react';

const NotesViewer = ({ pdfUrl }) => {
  if (!pdfUrl) return <div className="p-10 text-center">No PDF URL Found</div>;

  // Helper to check if it's a Google Drive link
  const isGoogleDrive = pdfUrl.includes('drive.google.com');
  
  // Convert 'view' link to 'preview' link for embedding if needed
  const embedUrl = isGoogleDrive 
    ? pdfUrl.replace('/view', '/preview') 
    : pdfUrl;

  return (
    <div className="w-full h-full flex flex-col bg-gray-100">
      
      {/* 1. External Link Fallback (Always visible just in case) */}
      <div className="bg-yellow-50 p-2 text-xs text-center text-yellow-800 border-b border-yellow-200 flex items-center justify-center gap-2">
        <AlertTriangle size={14}/>
        <span>If document doesn't load, </span>
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="underline font-bold flex items-center gap-1">
          Open in New Tab <ExternalLink size={12}/>
        </a>
      </div>

      {/* 2. Iframe for Embedding */}
      <div className="flex-1 w-full h-full relative">
        <iframe 
          src={embedUrl} 
          className="w-full h-full absolute inset-0 border-none"
          title="PDF Viewer"
          allow="autoplay"
        ></iframe>
      </div>
    </div>
  );
};

export default NotesViewer;