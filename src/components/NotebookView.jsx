import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Check, X, 
  Search, Moon, Sun, 
  FileText, Printer, Play, Pause, Square,
  Download, ArrowLeft
} from 'lucide-react';

const NotebookView = ({ notesContent, title, videoId, onBack }) => {
  const [saved, setSaved] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Audio States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef(null);
  
  // Preferences
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('notebook_theme');
    if (savedTheme) setTheme(savedTheme);
    
    // Cleanup audio on unmount
    return () => window.speechSynthesis.cancel();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('notebook_theme', newTheme);
  };

  useEffect(() => {
    if (videoId && localStorage.getItem(`offline_note_${videoId}`)) {
      setSaved(true);
    }
  }, [videoId]);

  // --- AUDIO HANDLERS ---
  const handleSpeak = () => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } else if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      const cleanText = notesContent.replace(/[#*`_\[\]]/g, '');
      utteranceRef.current = new SpeechSynthesisUtterance(cleanText);
      
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(voice => voice.lang === 'en-IN' && voice.name.toLowerCase().includes('male')) || 
                          voices.find(voice => voice.lang === 'en-IN');
      
      if (indianVoice) {
        utteranceRef.current.voice = indianVoice;
      }

      utteranceRef.current.rate = 1; 
      utteranceRef.current.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      window.speechSynthesis.speak(utteranceRef.current);
      setIsSpeaking(true);
      setIsPaused(false);
    }
  };

  const handleStopSpeak = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  // --- PDF EXPORT ---
  const handleExportPDF = () => {
    if (!notesContent) return;
    const noteData = { title, content: notesContent, date: new Date().toISOString() };
    localStorage.setItem(`offline_note_${videoId}`, JSON.stringify(noteData));
    setSaved(true);
    
    setTimeout(() => {
        window.print();
    }, 100);
  };

  const getThemeClasses = () => {
    return theme === 'dark' ? 'bg-[#121212] text-gray-300' : 'bg-white text-gray-900';
  };

  const getProseClasses = () => {
    let base = 'prose max-w-none transition-all duration-300 prose-base '; 
    
    if (theme === 'dark') {
      base += 'prose-headings:text-gray-100 prose-p:text-gray-300 prose-strong:text-white prose-a:text-blue-400 prose-code:text-pink-400 prose-code:bg-gray-800 prose-blockquote:text-gray-400 prose-blockquote:border-gray-700 prose-li:marker:text-gray-600 prose-hr:border-gray-800 ';
    } else {
      base += 'prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-a:text-blue-600 prose-code:text-pink-600 prose-code:bg-gray-100 prose-blockquote:text-gray-700 prose-blockquote:border-gray-200 prose-hr:border-gray-100 ';
    }
    return base;
  };

  const markdownComponents = useMemo(() => {
    return {
      h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-3 pb-2 border-b border-gray-100/10" {...props} />,
      h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-2" {...props} />,
      p: ({node, children, ...props}) => {
        if (!searchQuery) return <p className="leading-relaxed mb-3" {...props}>{children}</p>;
        const text = React.Children.toArray(children).join('');
        const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
        return (
          <p className="leading-relaxed mb-3" {...props}>
            {parts.map((part, i) => 
              part.toLowerCase() === searchQuery.toLowerCase() 
                ? <mark key={i} className="bg-yellow-300 text-black rounded px-0.5">{part}</mark> 
                : part
            )}
          </p>
        );
      },
      code: ({node, inline, className, children, ...props}) => {
          return inline ? (
            <code className="px-1 py-0.5 rounded text-[0.85em] font-mono border border-gray-500/20" {...props}>{children}</code>
          ) : (
            <div className={`my-4 rounded-lg overflow-hidden border ${theme === 'dark' ? 'bg-[#1e1e1e] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
              <pre className="p-3 overflow-x-auto text-sm font-mono leading-relaxed" {...props}>
                <code>{children}</code>
              </pre>
            </div>
          )
      },
    };
  }, [searchQuery, theme]);

  if (!notesContent) {
     return (
        <div className="flex flex-col items-center justify-center p-12 mt-6 mx-4 rounded-2xl border border-dashed border-gray-300">
            <FileText className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-gray-400 font-medium text-sm">Notes abhi available nahi hain.</p>
        </div>
    );
  }

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${getThemeClasses()}`}>
      
      {/* --- PRINT STYLES --- */}
      <style>{`
        @media print {
          @page { margin: 20mm; size: auto; }
          body, html, #root { 
            height: auto !important; 
            overflow: visible !important; 
            background-color: white !important;
            display: block !important;
          }
          
          /* Hide everything by default */
          body * { 
            visibility: hidden; 
          }

          /* Show only notebook printable area */
          .notebook-printable, .notebook-printable * { 
            visibility: visible; 
          }

          .notebook-printable { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            color: black !important;
            background: white !important;
            display: block !important;
          }

          .no-print { display: none !important; }
          
          /* Better Typography for Print */
          h1, h2, h3 { 
            color: black !important; 
            page-break-after: avoid; 
            break-after: avoid;
          }
          p, li { 
            color: #000 !important; 
            font-size: 12pt !important; 
            line-height: 1.5 !important; 
            page-break-inside: auto;
            break-inside: auto;
            orphans: 2; 
            widows: 2;
          }
          /* Ensure content isn't cut off */
          div, main, article {
            height: auto !important;
            overflow: visible !important;
            display: block !important;
          }
          
          a { text-decoration: underline; color: black !important; }
          code, pre { white-space: pre-wrap !important; word-break: break-all !important; border: 1px solid #ccc !important; }
        }
      `}</style>

      {/* --- CONTROLS HEADER --- */}
      <div className={`border-b transition-all duration-300 no-print sticky top-0 z-50 ${
        theme === 'dark' ? 'bg-[#121212]/95 border-gray-800' : 'bg-white/95 border-gray-100'
      }`}>
        <div className="px-3 py-2 flex items-center justify-between max-w-4xl mx-auto w-full">
          
          {/* Left Side: Back (Optional) + Audio */}
          <div className="flex items-center gap-2">
             
             {/* ✅ Back Button (Only if onBack prop exists) */}
             {onBack && (
               <button 
                 onClick={onBack}
                 className={`p-2 rounded-full transition-all active:scale-90 ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
               >
                 <ArrowLeft size={20} />
               </button>
             )}

             <button 
               onClick={isSpeaking ? handleStopSpeak : handleSpeak}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                 isSpeaking 
                   ? 'bg-indigo-100 text-indigo-700 animate-pulse' 
                   : theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
               }`}
             >
               {isSpeaking ? (
                 isPaused ? <><Play size={14}/> Resume</> : <><Pause size={14}/> Pause</>
               ) : (
                 <><Play size={14}/> Listen</>
               )}
             </button>
             
             {isSpeaking && (
               <button onClick={handleStopSpeak} className="p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                 <Square size={14} fill="currentColor" />
               </button>
             )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            <button 
               onClick={() => setShowSearch(!showSearch)}
               className={`p-2 rounded-full transition-colors ${showSearch ? 'text-blue-500 bg-blue-500/10' : 'text-gray-400 hover:text-gray-600'}`}
            >
               <Search size={18} />
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all active:scale-90 ${theme === 'dark' ? 'text-yellow-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button 
               onClick={handleExportPDF}
               className={`ml-2 p-2 rounded-full text-gray-400 hover:text-indigo-600 transition-colors bg-gray-50 hover:bg-indigo-50`}
               title="Download PDF"
            >
               {saved ? <Check size={18} className="text-green-600" /> : <Download size={18} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className={`px-3 pb-2 border-t animate-in slide-in-from-top-1 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
            <div className={`flex items-center gap-2 px-3 py-1.5 mt-2 rounded-lg ${
               theme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-gray-100'
            }`}>
               <Search size={14} className="text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search in notes..."
                 className="flex-1 bg-transparent border-none outline-none text-sm text-inherit"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 autoFocus
               />
               {searchQuery && (
                 <button onClick={() => setSearchQuery('')}><X size={14} className="text-gray-400" /></button>
               )}
            </div>
          </div>
        )}
      </div>

      {/* --- CONTENT BODY --- */}
      <main className="max-w-4xl mx-auto w-full notebook-printable">
          <div className={`px-3 py-4 md:p-10 min-h-[80vh] transition-all duration-300 w-full`}>
            
            {/* Print Header */}
            <div className="hidden print:block mb-6 border-b pb-4">
              <h1 className="text-2xl font-bold mb-1 text-black">{title}</h1>
              <p className="text-xs text-gray-500">Downloaded Notes • {new Date().toLocaleDateString()}</p>
            </div>

            {/* MARKDOWN RENDERER */}
            <div className={getProseClasses()}>
              <ReactMarkdown components={markdownComponents}>
                {notesContent}
              </ReactMarkdown>
            </div>

            {/* END MARKER */}
            <div className="mt-12 pt-6 border-t border-gray-500/10 flex flex-col items-center gap-2 text-center opacity-40 no-print">
               <div className="w-1 h-1 rounded-full bg-current"></div>
               <p className="text-[10px] font-bold uppercase tracking-widest">End of Notes</p>
            </div>

          </div>
      </main>
    </div>
  );
};

export default NotebookView;