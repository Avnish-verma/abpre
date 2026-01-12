import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { MessageCircle, Send, CheckCircle, UserCircle } from 'lucide-react';

const AdminDoubts = () => {
  const [doubts, setDoubts] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sirf wahi fetch karo jo 'doubt' type hain
    const q = query(
      collection(db, "interactions"),
      where("type", "==", "doubt"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setDoubts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleReply = async (doubtId) => {
    const text = replyText[doubtId];
    if (!text?.trim()) return;

    try {
      await updateDoc(doc(db, "interactions", doubtId), {
        reply: text,
        repliedAt: new Date()
      });
      // Clear input
      setReplyText(prev => ({ ...prev, [doubtId]: '' }));
    } catch (err) {
      console.error("Reply failed", err);
      alert("Failed to send reply");
    }
  };

  return (
    <div className="p-6 pb-20 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <MessageCircle className="text-blue-600"/> Student Doubts
      </h1>

      {loading ? <p>Loading...</p> : doubts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed text-gray-400">
          No doubts found. Good job! 🎉
        </div>
      ) : (
        <div className="space-y-4">
          {doubts.map((doubt) => (
            <div key={doubt.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
              
              {/* Question Part */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                      <UserCircle className="text-gray-400" size={20}/>
                      <span className="font-bold text-gray-700">{doubt.userName || 'Student'}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {doubt.videoTitle ? `Video: ${doubt.videoTitle}` : 'General'}
                      </span>
                   </div>
                   {doubt.reply && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold flex items-center gap-1"><CheckCircle size={12}/> Solved</span>}
                </div>
                <p className="text-gray-800 font-medium ml-7">{doubt.text}</p>
                <p className="text-xs text-gray-400 ml-7 mt-1">
                  {doubt.createdAt?.seconds ? new Date(doubt.createdAt.seconds * 1000).toLocaleString() : ''}
                </p>
              </div>

              {/* Reply Part */}
              <div className="p-4 bg-white">
                {doubt.reply ? (
                  <div className="ml-7 bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                    <p className="text-xs font-bold text-green-700 mb-1">YOUR REPLY</p>
                    <p className="text-gray-700 text-sm">{doubt.reply}</p>
                  </div>
                ) : (
                  <div className="ml-7 flex gap-2">
                    <input 
                      className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-blue-500"
                      placeholder="Type answer here..."
                      value={replyText[doubt.id] || ''}
                      onChange={(e) => setReplyText({...replyText, [doubt.id]: e.target.value})}
                    />
                    <button 
                      onClick={() => handleReply(doubt.id)}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      <Send size={18}/>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDoubts;