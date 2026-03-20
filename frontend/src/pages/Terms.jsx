import React from 'react';
import { motion } from 'framer-motion';
import shared from '../styles/Shared.module.css';
import styles from './Legal.module.css';

export default function TermsOfService() {
  return (
    <div className={`${shared.container} ${styles.legalContainer}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${shared.card} ${styles.legalCard}`}
      >
        <h1 className={styles.title}>Terms of Service</h1>
        <span className={styles.lastUpdated}>Last Updated: March 2026</span>
        
        <div className={styles.content}>
          <section className={styles.section}>
            <h3>1. Fair Use</h3>
            <p>API access is subject to rate limiting as defined in your subscription tier. Automated scanning that bypasses these limits is strictly prohibited.</p>
          </section>
          
          <section className={styles.section}>
            <h3>2. Classification Disclaimer</h3>
            <p>PhishAI provides probability-based phishing detection. While our accuracy is high, we are not responsible for false negatives or positives. Always exercise caution.</p>
          </section>
          
          <section className={styles.section}>
            <h3>3. Acceptable Use</h3>
            <p>PhishAI must not be used to test or refine malicious payloads for offensive purposes.</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
