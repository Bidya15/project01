import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShieldAlert, Globe, Filter, AlertTriangle, ShieldCheck } from 'lucide-react';
import { reportService } from '../services/api';
import shared from '../styles/Shared.module.css';
import styles from './ThreatIntelligence.module.css';

export default function ThreatIntelligence() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await reportService.getRecent();
        setReports(response.data);
      } catch (err) {
        console.error('Failed to fetch threat intel:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filteredReports = reports.filter(r => 
    r.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const blacklistedSites = reports.filter(r => r.status === 'VERIFIED' || r.status === 'MALICIOUS');
  const communityReports = reports.filter(r => r.status === 'PENDING' || r.status === 'SUSPICIOUS');

  return (
    <div className={`${shared.container} ${styles.threatIntelPage}`}>
      <header className={styles.header}>
        <div className={shared.badge}>Intelligence Network</div>
        <h1 className={styles.title}>Threat Intelligence</h1>
        <p className={shared.textDim}>Real-time global threat tracking and community verified malicious endpoints.</p>
      </header>

      <div className={styles.intelGrid}>
        {/* Global Blacklist Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${shared.card} ${styles.intelCard}`}
        >
          <div className={styles.cardHeader}>
            <h2><ShieldAlert className={shared.textDanger} size={20} /> Verified Blacklist</h2>
            <span className={styles.countBadge}>{blacklistedSites.length} Domains</span>
          </div>
          
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} size={18} />
            <input 
              type="text" 
              placeholder="Search blacklisted domains..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.listContainer}>
            <AnimatePresence>
              {blacklistedSites.map((site, idx) => (
                <motion.div 
                  key={site.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={styles.listItem}
                >
                  <div className={styles.itemInfo}>
                    <span className={styles.domain}>{site.domain}</span>
                    <span className={styles.meta}>Added {new Date(site.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className={`${styles.statusIndicator} ${styles.statusMalicious}`}>Blacklisted</span>
                </motion.div>
              ))}
              {blacklistedSites.length === 0 && !loading && (
                <div className={styles.emptyState}>
                  <ShieldCheck size={48} className={shared.textSuccess} />
                  <p>No active threats in the verified database.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Community Reports Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${shared.card} ${styles.intelCard}`}
        >
          <div className={styles.cardHeader}>
            <h2><Globe className={shared.textPrimary} size={20} /> Community Intel</h2>
            <span className={styles.countBadge}>{communityReports.length} Active</span>
          </div>

          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} size={18} />
            <input 
              type="text" 
              placeholder="Filter community reports..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.listContainer}>
            <AnimatePresence>
              {communityReports.map((report, idx) => (
                <motion.div 
                  key={report.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={styles.listItem}
                >
                  <div className={styles.itemInfo}>
                    <span className={styles.domain}>{report.domain}</span>
                    <span className={styles.meta}>Reported {new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className={`${styles.statusIndicator} ${report.status === 'SUSPICIOUS' ? styles.statusMalicious : styles.statusPending}`}>
                    {report.status}
                  </span>
                </motion.div>
              ))}
              {communityReports.length === 0 && !loading && (
                <div className={styles.emptyState}>
                  <Filter size={48} />
                  <p>No pending community reports found.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
