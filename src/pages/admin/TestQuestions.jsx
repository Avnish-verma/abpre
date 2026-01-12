import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, writeBatch } from 'firebase/firestore';
import { generateQuizFromAI } from '../../services/geminiService';
import { ArrowLeft, Trash2, CheckCircle, Sparkles, Upload, Plus, Save, Loader2 } from 'lucide-react';

const TestQuestions = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'ai'
  
  // States
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [qData, setQData] = useState({
    question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'optionA'
  });

  // --- 1. FETCH QUESTIONS ---
  const fetchQuestions = async () => {
    try {
      const q = query(collection(db, "questions"), where("testId", "==", testId));
      const snapshot = await getDocs(q);
      setQuestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchQuestions(); }, [testId]);

  // --- 2. MANUAL ADD ---
  const handleAddManual = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "questions"), { ...qData, testId, createdAt: new Date() });
      setQData({ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'optionA' });
      fetchQuestions();
    } catch (err) { alert("Failed to save"); }
  };

  // --- 3. AI GENERATE (IMAGE) ---
  const handleAIUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAiLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1];
        const generatedQs = await generateQuizFromImage(base64Data, file.type);

        // Firestore Batch upload (saare questions ek saath save karo)
        const batch = writeBatch(db);
        generatedQs.forEach((item) => {
          const docRef = doc(collection(db, "questions"));
          batch.set(docRef, { ...item, testId, createdAt: new Date() });
        });
        
        await batch.commit();
        alert(`Successfully added ${generatedQs.length} questions via AI!`);
        fetchQuestions();
      };
    } catch (error) {
      alert("AI could not generate questions. Make sure the image has clear text.");
    }
    setAiLoading(false);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete question?")) return;
    await deleteDoc(doc(db, "questions", id));
    fetchQuestions();
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition">
            <ArrowLeft size={24}/>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Build Quiz</h1>
            <p className="text-xs text-gray-500">Test ID: {testId}</p>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-1 flex gap-1 shadow-sm">
           <button onClick={() => setActiveTab('manual')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${activeTab === 'manual' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
             Manual
           </button>
           <button onClick={() => setActiveTab('ai')} className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition ${activeTab === 'ai' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
             <Sparkles size={14}/> AI Magic
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT: Creation Tool */}
        <div className="space-y-6">
          
          {activeTab === 'manual' ? (
            <div className="bg-white p-6 rounded-2xl border shadow-sm animate-in fade-in slide-in-from-left-4">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus size={18} className="text-blue-600"/> Add Question Manually
              </h2>
              <form onSubmit={handleAddManual} className="space-y-4">
                <textarea 
                  required placeholder="Enter Question text..."
                  className="w-full border p-3 rounded-xl text-sm focus:ring-2 ring-blue-500 outline-none min-h-[100px]"
                  value={qData.question} onChange={e => setQData({...qData, question: e.target.value})}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['A', 'B', 'C', 'D'].map(opt => (
                    <input key={opt} required placeholder={`Option ${opt}`} className="border p-2.5 rounded-lg text-sm" value={qData[`option${opt}`]} onChange={e => setQData({...qData, [`option${opt}`]: e.target.value})}/>
                  ))}
                </div>
                <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Correct Answer</label>
                   <select className="w-full border p-2.5 rounded-lg text-sm bg-gray-50" value={qData.correctOption} onChange={e => setQData({...qData, correctOption: e.target.value})}>
                     <option value="optionA">Option A</option>
                     <option value="optionB">Option B</option>
                     <option value="optionC">Option C</option>
                     <option value="optionD">Option D</option>
                   </select>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
                  <Save size={18}/> Save Question
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white p-10 rounded-2xl border border-dashed border-purple-300 shadow-sm text-center animate-in fade-in slide-in-from-right-4">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                {aiLoading ? <Loader2 className="text-purple-600 animate-spin" size={32}/> : <Upload className="text-purple-600" size={32}/>}
              </div>
              <h2 className="font-bold text-gray-800 text-lg">AI Quiz Generator</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                Upload a photo of your notes, book, or board. AI will instantly create 5 MCQs for you.
              </p>
              
              <label className={`block w-full ${aiLoading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}>
                <input type="file" accept="image/*" className="hidden" onChange={handleAIUpload}/>
                <div className="bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-100 transition">
                  {aiLoading ? "Reading Image..." : "Upload Image & Generate"}
                </div>
              </label>
            </div>
          )}
        </div>

        {/* RIGHT: Questions List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
             <h2 className="font-bold text-gray-700">Test Questions ({questions.length})</h2>
          </div>

          {loading ? (
             <div className="p-10 text-center text-gray-400">Loading...</div>
          ) : questions.length === 0 ? (
             <div className="bg-gray-100/50 p-20 rounded-3xl border-2 border-dashed text-center text-gray-400">
               No questions added yet.
             </div>
          ) : (
            <div className="space-y-4 h-[70vh] overflow-y-auto no-scrollbar pb-10">
              {questions.map((q, idx) => (
                <div key={q.id} className="bg-white p-5 rounded-2xl border shadow-sm relative group hover:border-blue-200 transition">
                  <button onClick={() => handleDelete(q.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                    <Trash2 size={18}/>
                  </button>
                  <p className="font-bold text-gray-800 text-sm mb-4 leading-relaxed pr-8">
                    <span className="text-blue-600">Q{idx+1}.</span> {q.question}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {['optionA', 'optionB', 'optionC', 'optionD'].map(key => (
                      <div key={key} className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${q.correctOption === key ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                        <span>{q[key]}</span>
                        {q.correctOption === key && <CheckCircle size={14}/>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TestQuestions;