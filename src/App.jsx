import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout'; // ✅ FIX: Added missing import

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Student Pages
import StudentHome from './pages/student/StudentHome';
import MyCourses from './pages/student/MyCourses';
import CourseDetail from './pages/student/CourseDetail';
import WatchVideo from './pages/student/WatchVideo';
import ViewNotes from './pages/student/ViewNotes';
import Downloads from './pages/student/Downloads';
import Profile from './pages/student/Profile';
import TestPlayer from './pages/student/TestPlayer';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Batches from './pages/admin/Batches';
import BatchContent from './pages/admin/BatchContent';
import AdminUpload from './pages/admin/AdminUpload';
import AdminDoubts from './pages/admin/AdminDoubts';
import AdminNotices from './pages/admin/AdminNotices';
import AdminTests from './pages/admin/AdminTests';
import TestQuestions from './pages/admin/TestQuestions';
import StudentAnalytics from './pages/admin/StudentAnalytics';
import AdminQuizzes from './pages/admin/AdminQuizzes';

// --- GUARDS ---
const RequireAuth = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  return currentUser ? children : <Navigate to="/login" />;
};

const RequireAdmin = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();
  if (loading) return <div className="p-10 text-center">Checking Permissions...</div>;
  if (!currentUser || userRole !== 'admin') return <Navigate to="/student/home" />;
  return children;
};

const RedirectIfLoggedIn = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? <Navigate to="/student/home" /> : children;
};

function App() {
  return (
    <Routes>
      {/* AUTH ROUTES */}
      <Route path="/login" element={<RedirectIfLoggedIn><Login /></RedirectIfLoggedIn>} />
      <Route path="/signup" element={<RedirectIfLoggedIn><Signup /></RedirectIfLoggedIn>} />
      
      {/* ROOT REDIRECT */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* STUDENT ROUTES */}
      <Route path="/student/*" element={
        <RequireAuth>
          {/* ✅ Layout passes "role" prop to show correct Sidebar */}
          <Layout role="student">
            <Routes>
              <Route path="home" element={<StudentHome />} />
              <Route path="my-courses" element={<MyCourses />} />
              <Route path="downloads" element={<Downloads />} />
              <Route path="profile" element={<Profile />} />
              
              <Route path="course/:id" element={<CourseDetail />} />
              <Route path="watch/:videoId" element={<WatchVideo />} />
              <Route path="view-pdf" element={<ViewNotes />} />
              <Route path="test/:testId" element={<TestPlayer />} />
              
              <Route path="*" element={<Navigate to="home" />} />
            </Routes>
          </Layout>
        </RequireAuth>
      } />

      {/* ADMIN ROUTES */}
      <Route path="/admin/*" element={
        <RequireAdmin>
          <Layout role="admin">
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="batches" element={<Batches />} />
              <Route path="batch/:batchId/content" element={<BatchContent />} />
              <Route path="batch/:batchId/tests" element={<AdminTests />} />
              <Route path="batch/:batchId/notices" element={<AdminNotices />} />
              <Route path="test/:testId/questions" element={<TestQuestions />} />
              <Route path="quizzes" element={<AdminQuizzes />} />
              <Route path="upload" element={<AdminUpload />} />
              <Route path="doubts" element={<AdminDoubts />} />
              <Route path="students" element={<StudentAnalytics />} />
              
              <Route path="*" element={<Navigate to="dashboard" />} />
            </Routes>
          </Layout>
        </RequireAdmin>
      } />
      
      {/* GLOBAL 404 */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;