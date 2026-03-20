import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, MapPin, ArrowRight, Loader } from 'lucide-react';
import { feedbackService } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import shared from '../styles/Shared.module.css';
import styles from './Contact.module.css';

export default function Contact() {
  const [formData, setFormData] = useState({ fullName: '', email: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const { showToast } = useNotification();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.message) {
      showToast("Identification required: Please complete all fields.", "error");
      return;
    }

    setIsSending(true);
    try {
      await feedbackService.submit(formData);
      showToast("Transmission successful. Our experts have received your inquiry.", "success");
      setFormData({ fullName: '', email: '', message: '' });
    } catch (err) {
      const msg = err.response?.data?.message || "Transmission interrupted. Please try again.";
      showToast(msg, "error");
    } finally {
      setIsSending(false);
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
        <div className={`${shared.badge} ${shared.badgeInfo}`}>GET IN TOUCH</div>
        <h1 className={styles.title}>Reach <span className={shared.gradientText}>Out</span></h1>
        <p className={styles.subtitle}>Our security experts are ready to help you with platform integration and enterprise inquiry.</p>
      </header>

      <div className={styles.grid}>
        <div className={styles.contactInfo}>
          {[
            { icon: Mail, label: "EMAIL SUPPORT", value: "phishai@gmail.com" },
            { icon: MessageSquare, label: "PHONE ENQUIRY", value: "+91 60.......97" },
            { icon: MapPin, label: "OFFICE LOCATION", value: "AEC, Jalukbari, Guwahati, Assam, India" },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ x: 8 }}
              className={`${shared.card} ${styles.infoCard}`}
            >
              <div className={styles.iconBox} style={{ color: "var(--primary)" }}>
                <item.icon size={20} />
              </div>
              <div>
                <div className={styles.infoLabel}>{item.label}</div>
                <div className={styles.infoValue}>{item.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${shared.card} ${styles.formCard}`}
        >
          <form className={styles.form} onSubmit={handleSendMessage}>
            <div className={styles.inputGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Full Name</label>
                <input
                  type="text"
                  className={shared.inputField}
                  placeholder="Your Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  type="email"
                  className={shared.inputField}
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Your Message</label>
              <textarea
                className={shared.inputField}
                rows="5"
                placeholder="How can we help you?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              ></textarea>
            </div>
            <button
              type="submit"
              className={shared.btnPrimary}
              style={{ height: '56px', justifyContent: 'center' }}
              disabled={isSending}
            >
              {isSending ? (
                <>Processing... <Loader className={shared.spin} size={18} style={{ marginLeft: '0.5rem' }} /></>
              ) : (
                <>Send Message <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} /></>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
