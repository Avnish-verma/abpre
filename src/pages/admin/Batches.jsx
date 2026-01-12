import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { Plus, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Batches = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', thumbnail: '', demoVideo: '', subject: 'General'
  });

  const fetchBatches = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "batches"));
      setBatches(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchBatches(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return alert("Name/Price required!");

    try {
      await addDoc(collection(db, "batches"), {
        ...formData,
        createdAt: new Date(),
        price: Number(formData.price),
        syllabus: {} // Initialize empty syllabus structure
      });
      setShowModal(false);
      setFormData({ name: '', description: '', price: '', thumbnail: '', demoVideo: '', subject: 'General' });
      fetchBatches();
    } catch (err) { alert("Error creating batch"); }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Batches</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold">
          <Plus size={20}/> New Batch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map(batch => (
          <div key={batch.id} className="bg-white rounded-xl shadow-sm border p-4 flex flex-col">
            <h3 className="font-bold text-lg mb-2">{batch.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 mb-4">{batch.description}</p>
            <div className="mt-auto flex gap-2">
              <button onClick={() => navigate(`/admin/batch/${batch.id}/content`)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded font-bold text-sm hover:bg-gray-200">
                Manage Content
              </button>
              <button className="flex-1 border border-blue-200 text-blue-600 py-2 rounded font-bold text-sm">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Create New Batch</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input required placeholder="Batch Name" className="w-full border p-2 rounded" 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
              />
              <textarea placeholder="Description" className="w-full border p-2 rounded h-24" 
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} 
              />
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <IndianRupee size={16} className="absolute left-3 top-3 text-gray-400"/>
                  <input required type="number" placeholder="Price" className="w-full border p-2 pl-8 rounded" 
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} 
                  />
                </div>
                <input placeholder="Subject Tag" className="flex-1 border p-2 rounded" 
                  value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} 
                />
              </div>
              <input placeholder="Thumbnail URL" className="w-full border p-2 rounded" 
                value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} 
              />
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">Create Batch</button>
              <button type="button" onClick={() => setShowModal(false)} className="w-full text-gray-500 py-2">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Batches;