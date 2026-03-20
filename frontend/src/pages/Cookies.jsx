import React from 'react';
import { motion } from 'framer-motion';
import shared from '../styles/Shared.module.css';
import styles from './Legal.module.css';

export default function CookiePolicy() {
  return (
    <div className={`${shared.container} ${styles.legalContainer}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${shared.card} ${styles.legalCard}`}
      >
        <h1 className={styles.title}>Cookie Policy</h1>
        <span className={styles.lastUpdated}>Last Updated: March 2026</span>
        
        <div className={styles.content}>
          <section className={styles.section}>
            <h3>1. Auth Tokens</h3>
            <p>We use secure http-only cookies to store JSON Web Tokens (JWT) for session persistence. These are essential for application functionality.</p>
          </section>
          
          <section className={styles.section}>
            <h3>2. Aesthetic Preferences</h3>
            <p>Local storage is used to remember your UI preferences, such as sidebar state and dashboard layout configurations.</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
