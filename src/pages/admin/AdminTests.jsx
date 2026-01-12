import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { ArrowLeft, Plus, Trash2, FileText, ChevronRight } from 'lucide-react';

const AdminTests = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', duration: '', totalMarks: '' });

  const fetchTests = async () => {
    const q = query(collection(db, "tests"), where("batchId", "==", batchId));
    const snapshot = await getDocs(q);
    setTests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => { fetchTests(); }, [batchId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "tests"), {
      ...formData,
      batchId,
      createdAt: new Date()
    });
    setShowModal(false);
    setFormData({ title: '', duration: '', totalMarks: '' });
    fetchTests();
  };

  const handleDelete = async (id) => {
    if(window.confirm("Delete this test?")) {
      await deleteDoc(doc(db, "tests", id));
      fetchTests();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/batches')} className="p-2 hover:bg-gray-200 rounded-full">
            <ArrowLeft size={24}/>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Batch Tests</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <Plus size={20}/> Create Test
        </button>
      </div>

      <div className="grid gap-4">
        {tests.map(test => (
          <div key={test.id} className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                <FileText size={24}/>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800">{test.title}</h3>
                <p className="text-sm text-gray-500">{test.duration} mins • {test.totalMarks} Marks</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(`/admin/test/${test.id}/questions`)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-sm flex items-center gap-1"
              >
                Add Questions <ChevronRight size={16}/>
              </button>
              <button onClick={() => handleDelete(test.id)} className="p-2 text-gray-400 hover:text-red-600">
                <Trash2 size={20}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New Test</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input required placeholder="Test Title" className="w-full border p-2 rounded" 
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} 
              />
              <div className="flex gap-4">
                <input required type="number" placeholder="Mins" className="w-full border p-2 rounded" 
                  value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} 
                />
                <input required type="number" placeholder="Marks" className="w-full border p-2 rounded" 
                  value={formData.totalMarks} onChange={e => setFormData({...formData, totalMarks: e.target.value})} 
                />
              </div>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">Create</button>
              <button type="button" onClick={() => setShowModal(false)} className="w-full text-gray-500 py-2">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTests;