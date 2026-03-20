import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Scanner from './pages/Scanner';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import About from './pages/About';
import Features from './pages/Features';
import Contact from './pages/Contact';
import Feedback from './pages/Feedback';
import Report from './pages/Report';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import AdminConsole from './pages/AdminConsole';
import { authService } from './services/api';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { NotificationProvider } from './context/NotificationContext';

const GOOGLE_CLIENT_ID = "784994239236-jq5kugvnlf84ns4bnhf5sf04t8anv7ks.apps.googleusercontent.com";

const PrivateRoute = ({ children, user }) => {
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children, user }) => {
  const isAdmin = user && user.email === 'bidyasingrongpi90@gmail.com';
  return isAdmin ? children : <Navigate to="/dashboard" />;
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0a0a0b',
        color: '#ffffff',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>PHISH<span style={{ color: '#3b82f6' }}>AI</span></div>
          <div style={{ fontSize: '0.875rem', opacity: 0.6 }}>Synchronizing secure session...</div>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <NotificationProvider>
        <Router>
          <Layout user={currentUser} onLogout={() => setCurrentUser(null)}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/features" element={<Features />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/report" element={<Report />} />
              <Route path="/login" element={<Login onLoginSuccess={(user) => setCurrentUser(user)} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/scanner" element={<PrivateRoute user={currentUser}><Scanner /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute user={currentUser}><Dashboard /></PrivateRoute>} />
              <Route path="/admin" element={<AdminRoute user={currentUser}><AdminConsole /></AdminRoute>} />
            </Routes>
          </Layout>
        </Router>
      </NotificationProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
