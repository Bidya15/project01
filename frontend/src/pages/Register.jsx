import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { motion } from 'framer-motion';
import { User, Lock, Mail, ArrowLeft, ShieldPlus, Eye, EyeOff } from 'lucide-react';
import shared from '../styles/Shared.module.css';
import styles from './Auth.module.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.register(username, fullName, email, password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Initialization failed. Retry protocol.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className={`${shared.card} ${styles.authCard}`}
      >
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <ShieldPlus size={32} />
          </div>
          <h2>Create Account</h2>
          <p className={shared.textDim}>Establish your secure analysis credentials</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className={styles.errorBadge}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Full Name</label>
              <div className={styles.inputWrapper}>
                <User size={18} className={styles.inputIcon} />
                <input 
                  type="text" 
                  className={shared.inputField}
                  placeholder="John Doe"
                  style={{ paddingLeft: '3.5rem' }}
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
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
                  placeholder="name@domain.com"
                  style={{ paddingLeft: '3.5rem' }}
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>
          </div>

          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Username</label>
              <div className={styles.inputWrapper}>
                <User size={18} className={styles.inputIcon} />
                <input 
                  type="text" 
                  className={shared.inputField}
                  placeholder="Choose a username"
                  style={{ paddingLeft: '3.5rem' }}
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  required 
                />
              </div>
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.inputIcon} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  className={shared.inputField}
                  placeholder="••••••••"
                  style={{ paddingLeft: '3.5rem', paddingRight: '3.5rem' }}
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
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
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit" 
            className={shared.btnPrimary}
            disabled={loading}
            style={{ marginTop: '1rem', height: '56px', width: '100%', justifyContent: 'center' }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </motion.button>
        </form>

        <div className={styles.authFooter}>
          <Link to="/login" style={{ color: 'var(--text-dim)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={16} /> Already have an account? Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
