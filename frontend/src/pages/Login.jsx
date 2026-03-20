import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import shared from '../styles/Shared.module.css';
import styles from './Auth.module.css';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await authService.login(username, password);
      if (onLoginSuccess) onLoginSuccess(user);
      navigate('/scanner');
    } catch (err) {
      setError('Invalid credentials. Access denied.');
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
            <ShieldCheck size={32} />
          </div>
          <h2 className={styles.brandName}>Sign In</h2>
          <p className={shared.textDim}>Secure login to your analysis dashboard</p>
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
          <div className={styles.inputGroup}>
            <label className={styles.label}>Username</label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input 
                type="text" 
                className={shared.inputField}
                placeholder="Enter your username"
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
            <div className={styles.forgotLinkWrapper} style={{ marginTop: '0.25rem', textAlign: 'right' }}>
              <Link to="/forgot-password" className={styles.forgotLink} style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                Forgot Password?
              </Link>
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
            {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>

          <div className={styles.divider}>
            <span>OR CONTINUE WITH</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '0.5rem' }}>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                setLoading(true);
                try {
                  const user = await authService.googleLogin(credentialResponse.credential);
                  if (onLoginSuccess) onLoginSuccess(user);
                  navigate('/scanner');
                } catch (err) {
                  setError('Google verification failed on server.');
                } finally {
                  setLoading(false);
                }
              }}
              onError={() => setError('Google login failed')}
              useOneTap
            />
          </div>
        </form>

        <div className={styles.authFooter}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Create Account <ArrowRight size={14} style={{ marginLeft: '0.25rem' }} /></Link>
        </div>
      </motion.div>
    </div>
  );
}
