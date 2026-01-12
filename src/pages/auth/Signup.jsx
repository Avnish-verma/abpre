import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Update Display Name
      await updateProfile(user, { displayName: formData.name });

      // 3. Create User Document
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: 'student',
        enrolledBatches: [],
        createdAt: new Date()
      });

      alert("Account Created! Redirecting...");
      navigate('/student/home');
    } catch (err) {
      setError(err.message.replace('Firebase:', ''));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Create Account</h2>
        
        {error && <p className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">{error}</p>}

        <form onSubmit={handleSignup} className="space-y-4">
          <input required placeholder="Full Name" className="w-full border p-3 rounded-lg" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <input required placeholder="Phone Number" className="w-full border p-3 rounded-lg" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          <input required type="email" placeholder="Email" className="w-full border p-3 rounded-lg" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <input required type="password" placeholder="Password" className="w-full border p-3 rounded-lg" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />

          <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;