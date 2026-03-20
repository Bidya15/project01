import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Shield, Award } from 'lucide-react';
import shared from '../styles/Shared.module.css';
import styles from './About.module.css';

export default function About() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={shared.container}
    >
      <header className={styles.header}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${shared.badge} ${shared.badgeInfo}`}
        >
          OUR MISSION & VISION
        </motion.div>
        <h1 className={styles.title}>Securing the <span className={shared.gradientText}>Digital World</span></h1>
        <p className={styles.subtitle}>Democratizing advanced cybersecurity intelligence through transparent AI orchestration and expert analysis.</p>
      </header>

      <div className={styles.grid}>
        {[
          { icon: Target, title: "Our Mission", desc: "Automated, AI-driven threat detection that stays ahead of evolving phishing tactics.", color: "var(--primary)" },
          { icon: Users, title: "Operations", desc: "A global team of security researchers and engineers dedicated to web safety.", color: "var(--secondary)" },
          { icon: Shield, title: "Core Protocol", desc: "Transparency, speed, and unyielding protection of user privacy across every scan.", color: "var(--success)" },
          { icon: Award, title: "Elite Standard", desc: "Setting the benchmark for precision and accuracy in machine learning inference.", color: "var(--primary)" }
        ].map((item, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -8 }}
            className={`${shared.card} ${styles.card}`}
          >
            <div className={styles.iconBox} style={{ color: item.color }}>
              <item.icon size={28} strokeWidth={2} />
            </div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className={styles.story}
      >
        <div className={`${shared.badge} ${shared.badgeInfo}`}>THE ORIGIN</div>
        <h2>The PhishAI Story</h2>
        <p>
          Founded on the principle that digital security is a fundamental right, PhishAI was engineered to 
          transform reactive defense into predictive intelligence. We didn't just build a scanner; we built 
          an enterprise-grade neural guardian that adapts to the evolving threat landscape in real-time.
        </p>
      </motion.section>
    </motion.div>
  );
}
