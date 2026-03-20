import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { motion } from 'framer-motion';
import { Mail, User, Lock, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import shared from '../styles/Shared.module.css';
import styles from './Auth.module.css';

export default function ForgotPassword() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await authService.resetPassword(username, email, newPassword);
      setMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed. Verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`${shared.card} ${styles.authCard}`}
      >
        <div className={styles.header}>
          <div className={styles.iconWrapper} style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#10b981' }}>
            <ShieldCheck size={32} />
          </div>
          <h2>Reset Password</h2>
          <p className={shared.textDim}>Verify your identity to update your password</p>
        </div>

        {error && <div className={styles.errorBadge}>{error}</div>}
        {message && <div className={styles.successBadge} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem', borderRadius: '12px', fontSize: '0.875rem', textAlign: 'center', marginBottom: '1.5rem', fontWeight: 600 }}>{message}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Username</label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input 
                type="text" 
                className={shared.inputField}
                placeholder="Your username"
                style={{ paddingLeft: '3.5rem' }}
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input 
                type="email" 
                className={shared.inputField}
                placeholder="Your registered email"
                style={{ paddingLeft: '3.5rem' }}
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>New Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input 
                type={showPassword ? "text" : "password"} 
                className={shared.inputField}
                placeholder="Enter new password"
                style={{ paddingLeft: '3.5rem', paddingRight: '3.5rem' }}
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                required 
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit" 
            className={shared.btnPrimary}
            disabled={loading}
            style={{ marginTop: '1rem', height: '56px', width: '100%', justifyContent: 'center' }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </motion.button>
        </form>

        <div className={styles.authFooter}>
          <Link to="/login" style={{ color: 'var(--text-dim)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
