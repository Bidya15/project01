import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import { Shield, LayoutDashboard, Search, LogOut, ChevronRight, Settings, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import shared from '../styles/Shared.module.css';
import styles from './Layout.module.css';

export default function Layout({ children, user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    authService.logout();
    if (onLogout) onLogout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },

  ];

  const appLinks = [
    { name: 'Scanner', path: '/scanner', icon: Search },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ];

  if (user && user.email === 'bidyasingrongpi90@gmail.com') {
    appLinks.push({ name: 'Admin Console', path: '/admin', icon: Settings });
  }

  return (
    <div className={styles.layoutWrapper}>
      {/* Global Aesthetics */}
      <div className={shared.bgSurface} />
      <div className={shared.bgDots} />

      {/* Navigation Layer */}
      <nav className={`${styles.navbar} ${isScrolled ? styles.navbarScrolled : ''}`}>
        <div className={`${shared.container} ${styles.navContent}`}>
          <Link to="/" className={styles.brand}>
            <div className={styles.logoIcon}>
              <Shield size={20} fill="currentColor" />
            </div>
            <span className={styles.brandName}>PHISH<span className={styles.brandAccent}>AI</span></span>
          </Link>

          <div className={styles.navGroup}>
            <ul className={styles.desktopNav}>
              {navLinks.map(link => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`${styles.navItem} ${location.pathname === link.path ? styles.active : ''}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className={styles.navDivider} />

            <div className={styles.actionGroup}>
              {user ? (
                <>
                  <div className={styles.internalLinks}>
                    {appLinks.map(link => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`${styles.appLink} ${location.pathname === link.path ? styles.appActive : ''}`}
                      >
                        <link.icon size={16} />
                        {link.name}
                      </Link>
                    ))}
                  </div>
                  <button onClick={handleLogout} className={styles.logoutBtn}>
                    <LogOut size={16} />
                  </button>
                </>
              ) : (
                <div className={styles.authGroup}>
                  <Link to="/login" className={styles.loginBtn}>Sign In</Link>
                  <Link to="/register" className={shared.btnPrimary}>
                    Get Started <ChevronRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Hamburger */}
          <button className={styles.hamburger} onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={styles.mobileMenu}
          >
            <div className={styles.mobileMenuInner}>
              <div className={styles.mobileNav}>
                <p className={styles.mobileSection}>Navigation</p>
                {navLinks.map(link => (
                  <Link key={link.path} to={link.path} className={`${styles.mobileNavItem} ${location.pathname === link.path ? styles.mobileNavActive : ''}`}>
                    {link.name}
                  </Link>
                ))}
              </div>
              {user && (
                <div className={styles.mobileNav}>
                  <p className={styles.mobileSection}>App</p>
                  {appLinks.map(link => (
                    <Link key={link.path} to={link.path} className={`${styles.mobileNavItem} ${location.pathname === link.path ? styles.mobileNavActive : ''}`}>
                      <link.icon size={18} /> {link.name}
                    </Link>
                  ))}
                </div>
              )}
              <div className={styles.mobileActions}>
                {user ? (
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className={`${shared.btnSecondary} ${styles.mobileFullBtn}`}>
                    <LogOut size={16} /> Sign Out
                  </button>
                ) : (
                  <>
                    <Link to="/login" className={`${shared.btnSecondary} ${styles.mobileFullBtn}`} onClick={() => setMobileOpen(false)}>Sign In</Link>
                    <Link to="/register" className={`${shared.btnPrimary} ${styles.mobileFullBtn}`} onClick={() => setMobileOpen(false)}>Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Orchestration */}
      <main className={styles.mainContent}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Enterprise Footer */}
      <footer className={styles.footer}>
        <div className={shared.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerInfo}>
              <Link to="/" className={styles.brand} style={{ marginBottom: '1.5rem' }}>
                <div className={styles.logoIcon}>
                  <Shield size={18} fill="currentColor" />
                </div>
                <span className={styles.brandName}>PHISH<span className={styles.brandAccent}>AI</span></span>
              </Link>
              <p className={styles.footerDesc}>
                Protecting the digital perimeter with collective AI intelligence and
                next-generation heuristic analytics.
              </p>
            </div>

            <div className={styles.linkStack}>
              <h5>Product</h5>
              <Link to="/features">Platform</Link>
              <Link to="/scanner">Scanner</Link>
              <Link to="/dashboard">Console</Link>
              <Link to="/dashboard">Console</Link>
            </div>

            <div className={styles.linkStack}>
              <h5>Legal</h5>
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
              <Link to="/cookies">Cookies</Link>
              <Link to="/security">Security</Link>
            </div>

            <div className={styles.linkStack}>
              <h5>Support</h5>
              <Link to="/contact">Contact</Link>
              <Link to="/feedback">Feedback</Link>
              <Link to="/report">Threat Report</Link>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <div className={styles.copyright}>
              © 2026 PhishAI Defense. All rights reserved.
            </div>
            <div className={styles.footerStatus}>
              <div className={styles.statusPing} />
              SYSTEM OPERATIONAL
              <span className={styles.version}>v4.0.2-LST</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
