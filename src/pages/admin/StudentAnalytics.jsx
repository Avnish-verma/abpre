import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Search, Mail, Phone, Plus, User } from 'lucide-react';

const StudentAnalytics = () => {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [batchToAssign, setBatchToAssign] = useState('');

  const fetchData = async () => {
    // 1. Fetch Users
    const usersSnap = await getDocs(collection(db, "users"));
    setStudents(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    // 2. Fetch Batches
    const batchesSnap = await getDocs(collection(db, "batches"));
    setBatches(batchesSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
  };

  useEffect(() => { fetchData(); }, []);

  const handleAssignBatch = async () => {
    if (!selectedStudent || !batchToAssign) return;

    try {
      const userRef = doc(db, "users", selectedStudent.id);
      await updateDoc(userRef, {
        enrolledBatches: arrayUnion(batchToAssign)
      });
      alert("Batch Assigned Successfully!");
      setSelectedStudent(null);
      fetchData(); // Refresh list
    } catch (error) {
      console.error("Error assigning batch:", error);
      alert("Failed to assign batch.");
    }
  };

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 pb-20">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Student Manager</h1>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20}/>
        <input 
          className="w-full pl-10 p-3 rounded-xl border focus:ring-2 ring-blue-500 outline-none"
          placeholder="Search by Name or Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Student List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-sm font-bold text-gray-500">Name</th>
              <th className="p-4 text-sm font-bold text-gray-500 hidden md:table-cell">Contact</th>
              <th className="p-4 text-sm font-bold text-gray-500">Courses</th>
              <th className="p-4 text-sm font-bold text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {student.name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{student.name}</p>
                      <p className="text-xs text-gray-500 md:hidden">{student.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <div className="text-sm text-gray-600">
                    <p className="flex items-center gap-1"><Mail size={12}/> {student.email}</p>
                    <p className="flex items-center gap-1"><Phone size={12}/> {student.phone || 'N/A'}</p>
                  </div>
                </td>
                <td className="p-4">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">
                    {student.enrolledBatches?.length || 0} Enrolled
                  </span>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => setSelectedStudent(student)}
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg text-sm font-bold flex items-center gap-1"
                  >
                    <Plus size={16}/> Assign
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Assign Course to {selectedStudent.name}</h2>
            
            <label className="block text-sm font-bold text-gray-500 mb-2">Select Batch</label>
            <select 
              className="w-full border p-3 rounded-lg mb-4"
              onChange={(e) => setBatchToAssign(e.target.value)}
              value={batchToAssign}
            >
              <option value="">-- Select --</option>
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <button onClick={() => setSelectedStudent(null)} className="flex-1 py-2 text-gray-500">Cancel</button>
              <button onClick={handleAssignBatch} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold">Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAnalytics;