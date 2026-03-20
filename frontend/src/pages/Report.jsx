import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Flag, ShieldAlert, Loader } from 'lucide-react';
import { reportService } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import shared from '../styles/Shared.module.css';
import styles from './Report.module.css';

export default function Report() {
  const [formData, setFormData] = useState({ domain: '', classification: 'PHISHING / SOCIAL ENGINEERING', notes: '' });
  const [isCommitting, setIsCommitting] = useState(false);
  const { showToast } = useNotification();

  const handleCommit = async (e) => {
    e.preventDefault();
    if (!formData.domain) {
      showToast("Identification protocol failed: Domain target is required.", "error");
      return;
    }

    setIsCommitting(true);
    try {
      await reportService.submit(formData);
      showToast("Intelligence committed: Domain added to the neutralization queue.", "success");
      setFormData({ domain: '', classification: 'PHISHING / SOCIAL ENGINEERING', notes: '' });
    } catch (err) {
      const msg = err.response?.data?.message || "Communication protocol failure. Please try again.";
      showToast(msg, "error");
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={shared.container}
    >
      <header className={styles.header}>
        <div className={shared.badge}>THREAT INTERCEPTION</div>
        <h1 className={styles.title}>Submit <span className={shared.gradientText}>Intelligence</span></h1>
        <p className={styles.subtitle}>Contribute to the collective perimeter by reporting verified malicious domains for cluster-wide neutralization.</p>
      </header>

      <div className={styles.content}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className={`${shared.glass} ${styles.infoBox}`}
        >
          <div className={styles.iconCircle}>
            <ShieldAlert size={28} color="var(--primary)" strokeWidth={1.5} />
          </div>
          <p>
            Submission protocol: Verified domains are added to the distributed analysis queue. 
            High-confidence results trigger instant synchronization across the global defense grid.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${shared.glass} ${styles.formCard}`}
        >
          <form className={styles.form} onSubmit={handleCommit}>
            <div className={styles.inputGroup}>
              <label>Suspected Malicious Origin</label>
              <div className={styles.inputWithIcon}>
                <Globe size={20} style={{ color: '#444' }} />
                <input 
                  type="text" 
                  className={shared.inputField} 
                  style={{ paddingLeft: '4rem', height: '70px' }} 
                  placeholder="https://malicious-domain.staging..." 
                  value={formData.domain}
                  onChange={(e) => setFormData({...formData, domain: e.target.value})}
                />
              </div>
            </div>
            
            <div className={styles.inputGroup}>
              <label>Threat Classification</label>
              <select 
                className={shared.inputField} 
                style={{ height: '70px', padding: '0 2rem' }}
                value={formData.classification}
                onChange={(e) => setFormData({...formData, classification: e.target.value})}
              >
                <option value="PHISHING / SOCIAL ENGINEERING">PHISHING / SOCIAL ENGINEERING</option>
                <option value="MALWARE PRE-STAGING">MALWARE PRE-STAGING</option>
                <option value="SCAM / CRYPTO FRAUD">SCAM / CRYPTO FRAUD</option>
                <option value="SUSPICIOUS ENTROPY / DGAs">SUSPICIOUS ENTROPY / DGAs</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Evidence / Technical Notes</label>
              <textarea 
                className={shared.inputField} 
                rows="6" 
                placeholder="Document suspicious technical markers..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              ></textarea>
            </div>

            <button 
              type="submit" 
              className={shared.btnPrimary} 
              style={{ background: 'linear-gradient(135deg, var(--danger), #be123c)', height: '70px', justifyContent: 'center' }}
              disabled={isCommitting}
            >
              {isCommitting ? (
                <>PROCESSING COMMIT... <Loader className={shared.spin} size={20} /></>
              ) : (
                <>COMMIT REPORT <Flag size={20} /></>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
