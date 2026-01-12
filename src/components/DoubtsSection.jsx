import React, { useState, useEffect } from 'react';
import { Send, UserCircle } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy } from 'firebase/firestore';

const DoubtsSection = ({ videoId, videoTitle }) => {
  const [doubts, setDoubts] = useState([]);
  const [newDoubt, setNewDoubt] = useState('');
  
  const user = auth.currentUser;

  useEffect(() => {
    if (!videoId) return; 

    const q = query(
      collection(db, "interactions"),
      where("videoId", "==", videoId), 
      where("type", "==", "doubt"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDoubts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [videoId]);

  const handlePostDoubt = async (e) => {
    e.preventDefault();
    if (!newDoubt.trim()) return;

    await addDoc(collection(db, "interactions"), {
      type: 'doubt',
      text: newDoubt,
      videoId,
      videoTitle,
      userId: user.uid,
      userName: user.displayName || 'Student',
      createdAt: new Date(),
      reply: null
    });
    setNewDoubt('');
  };

  return (
    <div className="pb-20">
      <div className="space-y-4">
        {doubts.length === 0 ? (
          <p className="text-center text-gray-400 py-4 text-sm">No doubts asked yet. Be the first!</p>
        ) : (
          doubts.map((doubt) => (
            <div key={doubt.id} className="bg-white p-3 rounded-xl border shadow-sm">
              <div className="flex gap-2 mb-2">
                <UserCircle size={20} className="text-gray-400"/>
                <div>
                  <p className="text-xs font-bold text-gray-700">{doubt.userName}</p>
                  <p className="text-sm text-gray-800">{doubt.text}</p>
                </div>
              </div>
              {doubt.reply && (
                <div className="ml-6 bg-green-50 p-2 rounded-lg border-l-4 border-green-500">
                  <p className="text-xs font-bold text-green-700">Teacher's Reply</p>
                  <p className="text-sm text-gray-700">{doubt.reply}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handlePostDoubt} className="mt-4 flex gap-2">
        <input
          className="flex-1 border rounded-full px-4 py-2 text-sm outline-none focus:ring-2 ring-blue-500"
          placeholder="Ask a doubt..."
          value={newDoubt}
          onChange={(e) => setNewDoubt(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default DoubtsSection;