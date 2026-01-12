import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchEnrolled = async () => {
      if (!user) return;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const batchIds = userDoc.data().enrolledBatches || [];
        // Fetch each batch details
        const batchPromises = batchIds.map(id => getDoc(doc(db, "batches", id)));
        const batchDocs = await Promise.all(batchPromises);
        setCourses(batchDocs.map(d => ({id: d.id, ...d.data()})));
      }
      setLoading(false);
    };
    fetchEnrolled();
  }, [user]);

  return (
    <div className="p-4 md:p-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Enrolled Courses</h1>
      {loading ? <p>Loading...</p> : courses.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
           <p>You haven't enrolled in any courses yet.</p>
           <button onClick={() => navigate('/student/home')} className="mt-4 text-blue-600 font-bold underline">Explore Courses</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(batch => (
            <div key={batch.id} onClick={() => navigate(`/student/course/${batch.id}`)} className="bg-white p-4 rounded-xl border shadow-sm cursor-pointer hover:border-blue-500">
              <h3 className="font-bold text-lg">{batch.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{batch.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">Active</span>
                <span className="text-blue-600 text-sm font-bold">Continue Learning &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;