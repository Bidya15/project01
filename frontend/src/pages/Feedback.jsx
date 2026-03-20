import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageCircle, ThumbsUp, Database, Zap, Activity, ArrowRight, Loader } from 'lucide-react';
import { feedbackService } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import shared from '../styles/Shared.module.css';
import styles from './Feedback.module.css';

export default function Feedback() {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Accuracy');
  const { showToast } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || !message) {
      showToast("Verification failed: Rating and message are required for processing.", "error");
      return;
    }

    setIsSending(true);
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      await feedbackService.submit({
        fullName: user?.fullName || "Community Contributor",
        email: user?.email || "anonymous@phishaident.io",
        username: user?.username || "anonymous",
        message: message,
        rating: rating,
        category: selectedCategory
      });
      showToast("Data ingested: Your feedback has been synchronized with our core engine.", "success");
      setRating(0);
      setMessage('');
    } catch (err) {
      showToast("Transmission error. Please try again later.", "error");
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
        <div className={`${shared.badge} ${shared.badgeInfo}`}>QUALITY ASSURANCE</div>
        <h1 className={styles.title}>Community <span className={shared.gradientText}>Feedback</span></h1>
        <p className={styles.subtitle}>Help us refine our detection engine by sharing your observations and feedback.</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${shared.card} ${styles.feedbackCard}`}
      >
        <div className={styles.ratingSection}>
          <p>Accuracy assessment</p>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star 
                key={s} 
                size={32} 
                strokeWidth={2}
                className={s <= rating ? styles.activeStar : styles.star} 
                onClick={() => setRating(s)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Detailed technical feedback</label>
            <textarea 
              className={shared.inputField} 
              rows="6" 
              placeholder="Your observations..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>
          
          <div className={styles.toggleGroup}>
            {[
              { label: 'Latency', icon: Zap },
              { icon: Database, label: 'Feature Quality' },
              { icon: Activity, label: 'Accuracy' },
              { icon: MessageCircle, label: 'User Interface' }
            ].map(item => (
              <button 
                key={item.label} 
                type="button" 
                className={`${styles.toggleBtn} ${selectedCategory === item.label ? styles.active : ''}`}
                onClick={() => setSelectedCategory(item.label)}
              >
                <item.icon size={16} /> {item.label}
              </button>
            ))}
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
              <>Submit Feedback <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} /></>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
