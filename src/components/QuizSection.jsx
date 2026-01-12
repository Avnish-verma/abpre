import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, Trophy, RefreshCcw, Loader2, Sparkles, Brain, 
  Lightbulb, FileText, Upload 
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sheetService } from '../services/sheetService';

const QuizSection = ({ videoId, videoTitle, user }) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState('selection'); 
  const [quizMode, setQuizMode] = useState('regular'); 
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [savingResult, setSavingResult] = useState(false);
  
  const [previousScore, setPreviousScore] = useState(null);
  const [hint, setHint] = useState("");
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const fileInputRef = useRef(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [infConfig, setInfConfig] = useState({ count: 5, difficulty: 'moderate' });

  // --- Gemini AI Helper ---
  const callGemini = async (prompt, systemInstruction = "", inlineData = null) => {
    if (!apiKey) {
        alert("API Key missing! Check .env file");
        throw new Error("Missing API Key");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use standard model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" }); 
    
    const parts = [{ text: prompt }];
    if (inlineData) parts.push({ inlineData });

    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: parts }],
        });
        const response = await result.response;
        return response.text();
    } catch (err) {
        console.error("Gemini Error:", err);
        throw err;
    }
  };

  // --- Initial Data Load ---
  useEffect(() => {
    const loadInitialData = async () => {
      if (!videoId) return;
      setLoading(true);
      try {
        // Fetch previous result if user exists
        if (user?.uid) {
            // Note: sheetService.getQuizResult might need to be implemented if not already
            // Assuming it returns { score: number } or null
            // For now commenting out if not implemented in sheetService provided earlier
            // const prev = await sheetService.getQuizResult(user.uid, videoTitle); 
            // if (prev) setPreviousScore(prev.score);
        }
        const sheetQs = await sheetService.getQuiz(videoId);
        setQuestions(sheetQs || []);
      } catch (err) { 
          console.error("Initial Load Error:", err); 
      } finally {
          setLoading(false);
      }
    };
    loadInitialData();
  }, [videoId, user?.uid, videoTitle]);

  const handleOptionSelect = (option) => {
    setUserAnswers({ ...userAnswers, [currentIndex]: option });
  };

  const startRegularQuiz = () => {
    if (questions.length > 0) {
      setQuizMode('regular');
      setCurrentIndex(0); setUserAnswers({}); setScore(0); setHint(""); setCurrentStep('playing');
    } else {
      alert("Is video ke liye Sheet mein koi quiz nahi mila.");
    }
  };

  const startInfiniteQuiz = async () => {
    setIsGenerating(true);
    const prompt = `Create ${infConfig.count} multiple-choice questions (MCQs) based on the topic: "${videoTitle}". Difficulty: ${infConfig.difficulty}. 
    Return strictly a JSON array of objects.
    Format: [{ "question": "string", "optionA": "string", "optionB": "string", "optionC": "string", "optionD": "string", "correct": "A" (or B/C/D) }]
    Do not include markdown formatting like \`\`\`json. Just the raw JSON.`;
    
    try {
      const resText = await callGemini(prompt);
      const cleanedJson = resText.replace(/```json|```/g, "").trim();
      const aiQs = JSON.parse(cleanedJson);
      
      if (Array.isArray(aiQs) && aiQs.length > 0) {
          setQuestions(aiQs);
          setQuizMode('infinite');
          setCurrentIndex(0); setUserAnswers({}); setScore(0); setHint(""); setCurrentStep('playing');
      } else {
          throw new Error("Invalid AI response format");
      }
    } catch (err) { 
        console.error(err);
        alert("AI error: Unable to generate quiz. Please try again."); 
    } finally { 
        setIsGenerating(false); 
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadLoading(true);
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = async () => {
      try {
        const base64 = reader.result.split(',')[1];
        const prompt = `Analyze this document and create 5 MCQs. 
        Return strictly a JSON array of objects.
        Format: [{ "question": "string", "optionA": "string", "optionB": "string", "optionC": "string", "optionD": "string", "correct": "A" }]
        No markdown code blocks.`;
        
        const res = await callGemini(prompt, "", { 
            data: base64, 
            mimeType: file.type 
        });
        
        const cleanedJson = res.replace(/```json|```/g, "").trim();
        const aiQs = JSON.parse(cleanedJson);
        
        if (Array.isArray(aiQs) && aiQs.length > 0) {
            setQuestions(aiQs);
            setQuizMode('document');
            setCurrentIndex(0); setUserAnswers({}); setScore(0); setHint(""); setCurrentStep('playing');
        } else {
            alert("Could not extract questions from document.");
        }
      } catch (err) { 
          console.error(err);
          alert("Document error or AI quota exceeded."); 
      } finally { 
          setUploadLoading(false); 
      }
    };
  };

  const fetchHint = async () => {
    if (isHintLoading) return;
    setIsHintLoading(true);
    try {
      const h = await callGemini(`Give a short Hinglish hint for this question: "${questions[currentIndex].question}". Do not reveal the answer directly.`);
      setHint(h);
    } catch (e) { setHint("Think about the key concepts discussed in the video."); }
    finally { setIsHintLoading(false); }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setHint("");
    } else {
      let finalScore = 0;
      questions.forEach((q, idx) => { if (userAnswers[idx] === q.correct) finalScore++; });
      setScore(finalScore);
      setCurrentStep('result');
      
      try {
        const feedback = await callGemini(`I scored ${finalScore}/${questions.length} on a quiz about "${videoTitle}". Give me short encouraging feedback in Hinglish.`);
        setAiFeedback(feedback);
      } catch (e) { setAiFeedback("Excellent attempt! Keep learning."); }
      
      if (quizMode === 'regular' && user) {
          saveToSheet(finalScore);
      }
    }
  };

  const saveToSheet = async (finalScore) => {
    setSavingResult(true);
    try {
      await sheetService.saveQuizScore(
        user?.displayName || 'Student',
        user?.uid || 'anonymous',
        videoTitle,
        finalScore,
        questions.length
      );
    } catch (err) { console.error(err); }
    finally { setSavingResult(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="animate-spin text-blue-500" size={32} />
      <p className="text-xs font-black text-slate-400 uppercase italic tracking-widest">Loading Quiz...</p>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6 space-y-6">
       {currentStep === 'selection' && (
        <div className="space-y-4 animate-in fade-in duration-500">
             {/* Card 1 Regular */}
             <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm relative overflow-hidden group">
               <div className="flex justify-between items-start mb-6">
                 <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter italic"><CheckCircle2 className="text-blue-500" size={20}/> Sheet Quiz</h3>
                 {previousScore !== null && <span className="bg-green-100 text-green-700 text-[9px] font-black px-3 py-1 rounded-full uppercase border border-green-200">Done</span>}
               </div>
               <button onClick={startRegularQuiz} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-transform">Start Assessment</button>
             </div>

             {/* Card 2 Upload */}
             <div className="bg-white p-6 rounded-[2rem] border-2 border-dashed border-indigo-200 shadow-sm relative overflow-hidden group text-center">
                <input type="file" ref={fileInputRef} onChange={handleDocumentUpload} className="hidden" accept="image/*,application/pdf" />
                <button onClick={() => fileInputRef.current.click()} disabled={uploadLoading} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
                    {uploadLoading ? <><Loader2 className="animate-spin" size={16}/> Analyzing...</> : <><Upload size={16}/> Upload Notes for Quiz</>}
                </button>
             </div>

             {/* Card 3 Infinite */}
             <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
               <h3 className="font-black text-lg uppercase italic mb-4">AI Practice</h3>
               <button disabled={isGenerating} onClick={startInfiniteQuiz} className="w-full bg-white text-indigo-700 py-4 rounded-2xl font-black text-xs uppercase shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-transform">
                 {isGenerating ? <Loader2 className="animate-spin" size={18}/> : <><Brain size={18}/> Generate Set</>}
               </button>
             </div>
        </div>
       )}

       {currentStep === 'playing' && questions[currentIndex] && (
         <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-50 shadow-2xl">
             <div className="flex justify-between items-center mb-6">
                <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 uppercase">Q {currentIndex + 1} / {questions.length}</span>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{quizMode} Mode</span>
             </div>
             <h3 className="text-xl font-black mb-6 text-slate-800 leading-tight">{questions[currentIndex].question}</h3>
             <div className="space-y-3">
                 {['A', 'B', 'C', 'D'].map(key => (
                     <button key={key} onClick={() => handleOptionSelect(key)} className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${userAnswers[currentIndex] === key ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-100'}`}>
                        <span className="font-bold mr-2 opacity-50">{key}.</span> {questions[currentIndex][`option${key}`]}
                     </button>
                 ))}
             </div>
             <div className="mt-8 flex justify-between items-center">
                <button onClick={fetchHint} disabled={isHintLoading} className="text-xs font-bold text-amber-600 flex gap-1 items-center bg-amber-50 px-3 py-2 rounded-lg hover:bg-amber-100 transition-colors">
                    {isHintLoading ? <Loader2 size={14} className="animate-spin"/> : <Lightbulb size={14}/>} Hint
                </button>
                <button onClick={handleNext} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase shadow-lg hover:bg-slate-800 transition-colors">
                    {currentIndex === questions.length - 1 ? "Finish" : "Next"}
                </button>
             </div>
             {hint && <div className="mt-4 p-4 bg-amber-50 text-amber-800 text-xs rounded-2xl border border-amber-100 animate-in fade-in slide-in-from-top-2">💡 {hint}</div>}
         </div>
       )}

       {currentStep === 'result' && (
         <div className="bg-white p-12 rounded-[4rem] text-center border-4 border-slate-50 shadow-2xl animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy size={48} className="text-yellow-500 drop-shadow-sm"/>
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-2">{score}/{questions.length}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Final Score</p>
            <div className="bg-indigo-50 p-6 rounded-3xl mb-8">
                <p className="text-sm text-indigo-900 font-medium leading-relaxed">"{aiFeedback}"</p>
            </div>
            <button onClick={() => setCurrentStep('selection')} className="w-full bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2">
                <RefreshCcw size={16}/> Play Again
            </button>
         </div>
       )}
    </div>
  );
};
export default QuizSection;