import React from 'react';
import { motion } from 'framer-motion';
import shared from '../styles/Shared.module.css';
import styles from './Legal.module.css';

export default function PrivacyPolicy() {
  return (
    <div className={`${shared.container} ${styles.legalContainer}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${shared.card} ${styles.legalCard}`}
      >
        <h1 className={styles.title}>Privacy Policy</h1>
        <span className={styles.lastUpdated}>Last Updated: March 2026</span>
        
        <div className={styles.content}>
          <section className={styles.section}>
            <h3>1. Collective Intelligence</h3>
            <p>PhishAI utilizes aggregated threat feeds and anonymized scan data to improve global phishing detection models. Your personal URLs are never shared in an identifiable format.</p>
          </section>
          
          <section className={styles.section}>
            <h3>2. Data Retention</h3>
            <p>Scan metadata is retained for historical analysis and threat tracking. You may request deletion of your individual scan history through the user dashboard.</p>
          </section>
          
          <section className={styles.section}>
            <h3>3. Encryption</h3>
            <p>All data transmitted to PhishAI nodes is secured using industry-standard TLS encryption.</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
