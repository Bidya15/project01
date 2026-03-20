import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Cpu, BarChart, Bell, Globe, ArrowRight } from 'lucide-react';
import shared from '../styles/Shared.module.css';
import styles from './Features.module.css';

export default function Features() {
  const features = [
    { icon: Cpu, title: "Neural feature extraction", desc: "Analyzes 150+ high-entropy URL signals and metadata fingerprints in real-time." },
    { icon: Zap, title: "Sub-second inference", desc: "Enterprise-grade verdicts in under 200ms using optimized PyTorch core models." },
    { icon: Shield, title: "Predictive heuristics", desc: "Identifies 0-day metamorphic phishing variants before they hit global blacklists." },
    { icon: BarChart, title: "Quantitative analytics", desc: "Detailed risk indices powered by multi-factor Bayesian probability models." },
    { icon: Bell, title: "Operational awareness", desc: "Continuous perimeter surveillance and immediate tactical notifications." },
    { icon: Globe, title: "Sovereign intelligence", desc: "Federated threat feeds from 50+ sovereign security clusters globally." },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={shared.container}
    >
      <div className={styles.header}>
        <div className={`${shared.badge} ${shared.badgeInfo}`}>PLATFORM CAPABILITIES</div>
        <h1 className={styles.title}>Enterprise <span className={shared.gradientText}>Infrastructure</span></h1>
        <p className={styles.subtitle}>Sophisticated cybersecurity layers engineered for high-availability enterprise defense.</p>
      </div>

      <div className={styles.grid}>
        {features.map((f, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -5 }}
            className={`${shared.card} ${styles.featureRow}`}
          >
            <div className={styles.iconBox}>
              <f.icon size={26} color="var(--primary)" strokeWidth={2} />
            </div>
            <div className={styles.content}>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
