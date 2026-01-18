import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Video, FileText, Trash2, Folder, ChevronRight, ChevronDown, CheckCircle } from 'lucide-react';
import { doc, onSnapshot, updateDoc, setDoc, deleteDoc } from 'firebase/firestore'; 
import { db } from '../../firebase';

const BatchContent = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  
  const [syllabus, setSyllabus] = useState({});
  const [showModal, setShowModal] = useState(false);
  
  // Accordion State
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});

  // Form State
  const [formData, setFormData] = useState({ 
    title: '', type: 'video', url: '', notesUrl: '', 
    subject: '', chapter: '' 
  });

  // Smart Dropdown States
  const [isNewSubject, setIsNewSubject] = useState(false);
  const [isNewChapter, setIsNewChapter] = useState(false);
  const [availableChapters, setAvailableChapters] = useState([]);

  // 1. Fetch Syllabus Realtime
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "batches", batchId), (docSnap) => {
      if (docSnap.exists()) {
        setSyllabus(docSnap.data().syllabus || {});
      }
    });
    return () => unsub();
  }, [batchId]);

  // 2. Handle Subject Change -> Update Chapters List
  const handleSubjectChange = (e) => {
    const val = e.target.value;
    if (val === 'NEW_SUBJECT') {
      setIsNewSubject(true);
      setFormData(prev => ({ ...prev, subject: '' }));
      setAvailableChapters([]);
    } else {
      setIsNewSubject(false);
      setFormData(prev => ({ ...prev, subject: val }));
      // Load chapters for this subject
      const chaps = syllabus[val] ? Object.keys(syllabus[val]) : [];
      setAvailableChapters(chaps);
    }
    // Reset chapter selection
    setIsNewChapter(false);
    setFormData(prev => ({ ...prev, chapter: '' }));
  };

  // 3. Handle Chapter Change
  const handleChapterChange = (e) => {
    const val = e.target.value;
    if (val === 'NEW_CHAPTER') {
      setIsNewChapter(true);
      setFormData(prev => ({ ...prev, chapter: '' }));
    } else {
      setIsNewChapter(false);
      setFormData(prev => ({ ...prev, chapter: val }));
    }
  };

  // 4. Add Content Logic (SECURE SAVE)
  const handleAddContent = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.chapter) return alert("Subject and Chapter are required!");

    const contentId = crypto.randomUUID();

    // --- SECURE VIDEO LOGIC ---
    if (formData.type === 'video') {
        try {
            await setDoc(doc(db, "secure_videos", contentId), {
                url: formData.url,
                batchId: batchId,
                title: formData.title,
                createdAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error securing video:", error);
            alert("Failed to secure video.");
            return;
        }
    }

    const newItem = {
      id: contentId,
      title: formData.title,
      type: formData.type,
      notesUrl: formData.type === 'note' ? formData.notesUrl : '', 
      createdAt: new Date().toISOString()
    };

    const batchRef = doc(db, "batches", batchId);
    
    // Deep Clone & Update
    const updatedSyllabus = { ...syllabus };
    
    if (!updatedSyllabus[formData.subject]) updatedSyllabus[formData.subject] = {};
    if (!updatedSyllabus[formData.subject][formData.chapter]) updatedSyllabus[formData.subject][formData.chapter] = [];
    
    updatedSyllabus[formData.subject][formData.chapter].push(newItem);

    try {
      await updateDoc(batchRef, { syllabus: updatedSyllabus });
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error("Error adding content:", err);
      alert("Failed to update batch.");
    }
  };

  const resetForm = () => {
    setFormData({ title: '', type: 'video', url: '', notesUrl: '', subject: '', chapter: '' });
    setIsNewSubject(false);
    setIsNewChapter(false);
  };

  // 5. Delete Content Logic
  const handleDelete = async (subject, chapter, itemId, type) => {
    if (!window.confirm("Delete this item?")) return;

    if (type === 'video') {
        try { await deleteDoc(doc(db, "secure_videos", itemId)); } catch (e) {}
    }

    const updatedSyllabus = { ...syllabus };
    updatedSyllabus[subject][chapter] = updatedSyllabus[subject][chapter].filter(i => i.id !== itemId);

    if (updatedSyllabus[subject][chapter].length === 0) delete updatedSyllabus[subject][chapter];
    if (Object.keys(updatedSyllabus[subject]).length === 0) delete updatedSyllabus[subject];

    await updateDoc(doc(db, "batches", batchId), { syllabus: updatedSyllabus });
  };

  const toggleSub = (s) => setExpandedSubjects(prev => ({...prev, [s]: !prev[s]}));
  const toggleChap = (c) => setExpandedChapters(prev => ({...prev, [c]: !prev[c]}));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/batches')} className="p-2 hover:bg-gray-200 rounded-full">
            <ArrowLeft size={24}/>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Manage Content</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-lg hover:bg-blue-700">
          <Plus size={20}/> Add Content
        </button>
      </div>

      <div className="space-y-4 max-w-4xl mx-auto">
        {Object.entries(syllabus).length === 0 && (
           <div className="text-center py-20 text-gray-400">No content added yet. Click "Add Content" to start.</div>
        )}
        
        {Object.entries(syllabus).map(([subject, chapters]) => (
          <div key={subject} className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div onClick={() => toggleSub(subject)} className="p-4 bg-gray-50 flex justify-between cursor-pointer font-bold text-lg text-gray-700 hover:bg-gray-100">
              {subject}
              {expandedSubjects[subject] ? <ChevronDown/> : <ChevronRight/>}
            </div>
            
            {expandedSubjects[subject] && (
              <div className="border-t">
                {Object.entries(chapters).map(([chapter, items]) => (
                  <div key={chapter}>
                    <div onClick={() => toggleChap(`${subject}-${chapter}`)} className="px-6 py-3 bg-white flex justify-between cursor-pointer text-sm font-medium text-gray-600 hover:bg-blue-50 border-b">
                       <span className="flex items-center gap-2"><Folder size={16} className="text-yellow-500"/> {chapter}</span>
                       <span className="text-xs bg-gray-100 px-2 py-1 rounded">{items.length} items</span>
                    </div>

                    {expandedChapters[`${subject}-${chapter}`] && (
                      <div className="bg-slate-50 p-4 space-y-2">
                         {items.map((item) => (
                           <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded border shadow-sm hover:shadow-md transition">
                              <div className="flex items-center gap-3">
                                 {item.type === 'video' ? <Video size={18} className="text-red-500"/> : <FileText size={18} className="text-green-500"/>}
                                 <div>
                                   <p className="text-sm font-bold text-gray-800">{item.title}</p>
                                   <p className="text-[10px] text-gray-400 uppercase">{item.type}</p>
                                 </div>
                              </div>
                              <button onClick={() => handleDelete(subject, chapter, item.id, item.type)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition">
                                <Trash2 size={16}/>
                              </button>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Content</h2>
            <form onSubmit={handleAddContent} className="space-y-4">
              
              {/* --- SMART SUBJECT SELECTOR --- */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Subject</label>
                {!isNewSubject ? (
                  <select 
                    className="w-full border p-3 rounded-lg bg-gray-50 focus:ring-2 ring-blue-500 outline-none"
                    value={formData.subject}
                    onChange={handleSubjectChange}
                  >
                    <option value="">-- Select Subject --</option>
                    {Object.keys(syllabus).map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    <option value="NEW_SUBJECT" className="font-bold text-blue-600">+ Create New Subject</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      autoFocus
                      placeholder="Enter New Subject Name" 
                      className="w-full border p-3 rounded-lg ring-2 ring-blue-100 focus:ring-blue-500 outline-none"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    />
                    <button type="button" onClick={() => setIsNewSubject(false)} className="text-red-500 text-sm font-bold px-2">Cancel</button>
                  </div>
                )}
              </div>

              {/* --- SMART CHAPTER SELECTOR --- */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Chapter</label>
                {!isNewChapter ? (
                  <select 
                    className="w-full border p-3 rounded-lg bg-gray-50 focus:ring-2 ring-blue-500 outline-none disabled:opacity-50"
                    value={formData.chapter}
                    onChange={handleChapterChange}
                    disabled={!formData.subject && !isNewSubject}
                  >
                    <option value="">-- Select Chapter --</option>
                    {availableChapters.map(chap => <option key={chap} value={chap}>{chap}</option>)}
                    <option value="NEW_CHAPTER" className="font-bold text-blue-600">+ Create New Chapter</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      autoFocus
                      placeholder="Enter New Chapter Name" 
                      className="w-full border p-3 rounded-lg ring-2 ring-blue-100 focus:ring-blue-500 outline-none"
                      value={formData.chapter}
                      onChange={(e) => setFormData({...formData, chapter: e.target.value})}
                    />
                    <button type="button" onClick={() => setIsNewChapter(false)} className="text-red-500 text-sm font-bold px-2">Cancel</button>
                  </div>
                )}
              </div>

              {/* Title & Type */}
              <input required placeholder="Content Title" className="w-full border p-3 rounded-lg" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})}/>
              
              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                 <button type="button" onClick={() => setFormData({...formData, type: 'video'})} className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${formData.type === 'video' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Video</button>
                 <button type="button" onClick={() => setFormData({...formData, type: 'note'})} className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${formData.type === 'note' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}>Note</button>
              </div>

              {formData.type === 'video' ? (
                 <input required placeholder="YouTube/Video URL" className="w-full border p-3 rounded-lg border-blue-200 bg-blue-50" value={formData.url} onChange={e=>setFormData({...formData, url: e.target.value})}/>
              ) : (
                 <input required placeholder="Google Drive/PDF URL" className="w-full border p-3 rounded-lg border-green-200 bg-green-50" value={formData.notesUrl} onChange={e=>setFormData({...formData, notesUrl: e.target.value})}/>
              )}

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">Save Content</button>
              <button type="button" onClick={() => setShowModal(false)} className="w-full text-gray-500 py-2">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchContent;
