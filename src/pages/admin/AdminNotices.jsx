import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { ArrowLeft, Trash2, Send, Bell } from 'lucide-react';

const AdminNotices = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch Notices
  const fetchNotices = async () => {
    try {
      const q = query(
        collection(db, "notices"), 
        where("batchId", "==", batchId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      setNotices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchNotices(); }, [batchId]);

  // Add Notice
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title || !message) return;

    await addDoc(collection(db, "notices"), {
      batchId,
      title,
      message,
      createdAt: new Date()
    });
    setTitle('');
    setMessage('');
    fetchNotices();
  };

  // Delete Notice
  const handleDelete = async (id) => {
    if(!window.confirm("Delete this notice?")) return;
    await deleteDoc(doc(db, "notices", id));
    fetchNotices();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen bg-gray-50">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/batches')} className="p-2 hover:bg-gray-200 rounded-full">
          <ArrowLeft size={24}/>
        </button>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Bell className="text-blue-600"/> Batch Notices
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Create Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border h-fit">
          <h2 className="font-bold text-lg mb-4">Post New Notice</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <input 
              placeholder="Notice Title" 
              className="w-full border p-3 rounded-lg focus:ring-2 ring-blue-500 outline-none"
              value={title} onChange={e => setTitle(e.target.value)}
              required
            />
            <textarea 
              placeholder="Message details..." 
              className="w-full border p-3 rounded-lg h-32 focus:ring-2 ring-blue-500 outline-none resize-none"
              value={message} onChange={e => setMessage(e.target.value)}
              required
            />
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
              <Send size={18}/> Post Notice
            </button>
          </form>
        </div>

        {/* List */}
        <div className="space-y-4">
          <h2 className="font-bold text-lg text-gray-700">Recent Notices</h2>
          {loading ? <p>Loading...</p> : notices.length === 0 ? (
            <p className="text-gray-400 text-center py-10">No notices yet.</p>
          ) : (
            notices.map(notice => (
              <div key={notice.id} className="bg-white p-4 rounded-xl border shadow-sm relative group">
                <button 
                  onClick={() => handleDelete(notice.id)}
                  className="absolute top-3 right-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 size={18}/>
                </button>
                <h3 className="font-bold text-gray-800">{notice.title}</h3>
                <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">{notice.message}</p>
                <p className="text-xs text-gray-400 mt-2 text-right">
                  {notice.createdAt?.seconds ? new Date(notice.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotices;