import React, { useState, useEffect } from 'react';
// ❌ Removed direct GoogleGenerativeAI import
import { sheetService } from '../../services/sheetService';
import { generateNotesFromAI } from '../../services/geminiService'; // ✅ Import new function
import { db } from '../../firebase'; 
import { collection, getDocs } from 'firebase/firestore'; 
import { Save, FileText, Video, Loader2, Sparkles } from 'lucide-react';

const AdminUpload = () => {
  // Dropdown States
  const [batches, setBatches] = useState([]);
  const [videosList, setVideosList] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);

  // AI & Upload States
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // 1. Fetch Batches
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const snapshot = await getDocs(collection(db, "batches"));
        setBatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching batches:", error);
      }
    };
    fetchBatches();
  }, []);

  // 2. Fetch Videos when Batch Selected
  useEffect(() => {
    if (!selectedBatchId) return;
    const batch = batches.find(b => b.id === selectedBatchId);
    if (batch?.syllabus) {
      let vids = [];
      try {
        Object.values(batch.syllabus).forEach(chapters => {
          if (typeof chapters === 'object') {
            Object.values(chapters).forEach(contents => {
              if (Array.isArray(contents)) {
                contents.forEach(item => {
                  if (item.type === 'video') vids.push(item);
                });
              }
            });
          }
        });
      } catch (err) {
        console.error("Error parsing syllabus:", err);
      }
      setVideosList(vids);
    } else {
      setVideosList([]);
    }
  }, [selectedBatchId, batches]);

  // 3. Handle File Selection
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setImagePreview(URL.createObjectURL(selected));
    }
  };

  // 4. Generate AI Notes (✅ Using Rotation Service)
  const generateNotes = async () => {
    if (!file) return alert("Please upload an image first.");

    setLoading(true);

    try {
      // Convert Image to Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1];
        
        try {
            // ✅ Calling the rotation-enabled service
            const notes = await generateNotesFromAI(base64Data, file.type);
            setGeneratedNotes(notes);
        } catch (err) {
            alert(`AI Error: ${err.message || "Quota Exceeded on all keys."}`);
        }
        setLoading(false);
      };
    } catch (error) {
      console.error(error);
      alert("Error reading file.");
      setLoading(false);
    }
  };

  // 5. Save to Google Sheet
  const handleSaveToSheet = async () => {
    if (!selectedVideo || !generatedNotes) return alert("Select a video and generate notes first.");
    
    setSaving(true);
    
    const success = await sheetService.saveNote({
      videoId: selectedVideo.id,
      videoTitle: selectedVideo.title,
      content: generatedNotes 
    });

    if (success) {
      alert("Notes Saved Successfully! ✅");
      setGeneratedNotes("");
      setFile(null);
      setImagePreview(null);
    } else {
      alert("Failed to save to Sheet. Check console or Sheet URL.");
    }
    setSaving(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto min-h-screen pb-20">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Sparkles className="text-indigo-600"/> AI Note Generator (Multi-Key)
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Step 1: Select Context */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold mb-3 text-gray-700 text-sm uppercase tracking-wider">1. Select Target Video</h3>
            <select 
              className="w-full border bg-gray-50 p-3 rounded-xl mb-3 outline-none focus:ring-2 ring-indigo-500 text-sm"
              onChange={(e) => setSelectedBatchId(e.target.value)}
            >
              <option value="">-- Select Batch --</option>
              {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            
            <select 
              className="w-full border bg-gray-50 p-3 rounded-xl disabled:opacity-50 outline-none focus:ring-2 ring-indigo-500 text-sm"
              disabled={!selectedBatchId}
              onChange={(e) => {
                const vid = videosList.find(v => v.id === e.target.value);
                setSelectedVideo(vid);
              }}
            >
              <option value="">-- Select Video --</option>
              {videosList.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
            </select>

            {selectedVideo && (
              <div className="mt-3 p-3 bg-indigo-50 text-indigo-800 text-xs rounded-xl border border-indigo-100 flex items-center gap-2 animate-in fade-in">
                <Video size={14}/> Linked to: <b>{selectedVideo.title}</b>
              </div>
            )}
          </div>

          {/* Step 2: Upload Image */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold mb-3 text-gray-700 text-sm uppercase tracking-wider">2. Upload Board Image</h3>
            <label className="block w-full cursor-pointer">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden"/>
              <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition">
                 {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-32 mx-auto object-contain rounded-lg"/>
                 ) : (
                    <div className="text-gray-400 text-xs">
                      <FileText className="mx-auto mb-2" size={24}/>
                      <p>Click to Upload Image</p>
                    </div>
                 )}
              </div>
            </label>
            
            <button 
              onClick={generateNotes} 
              disabled={loading || !file}
              className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
            >
              {loading ? <><Loader2 className="animate-spin" size={18}/> Analyzing (Multi-Key)...</> : "Generate Notes"}
            </button>
          </div>
        </div>

        {/* Step 3: Preview & Save */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
          <h3 className="font-bold mb-3 text-gray-700 text-sm uppercase tracking-wider">3. Preview & Save</h3>
          <textarea 
            value={generatedNotes}
            onChange={(e) => setGeneratedNotes(e.target.value)}
            placeholder="AI generated notes will appear here..."
            className="flex-1 w-full p-4 bg-gray-50 border rounded-xl font-mono text-xs resize-none focus:ring-2 ring-indigo-500 outline-none mb-4 leading-relaxed"
          />
          
          <button 
            onClick={handleSaveToSheet} 
            disabled={!generatedNotes || saving}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-green-200"
          >
            {saving ? "Saving..." : <><Save size={18}/> Save to App</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUpload;