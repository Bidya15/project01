import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Zap, BarChart3, Globe, ArrowRight, CheckCircle2, Search, Mail, MessageSquare, Terminal, FileText, Link as LinkIcon, Quote, Star } from 'lucide-react';
import shared from '../styles/Shared.module.css';
import styles from './Home.module.css';
import { authService, statsService, feedbackService } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] }
  }
};

export default function Home() {
  const [url, setUrl] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('url');
  const [feedbacks, setFeedbacks] = React.useState([]);
  const navigate = useNavigate();

  const scanTypes = [
    { id: 'url', label: 'URL', icon: LinkIcon, placeholder: 'Enter URL to scan for phishing...' },
    { id: 'email', label: 'Email', icon: Mail, placeholder: 'Paste email headers or content...' },
    { id: 'message', label: 'Message', icon: MessageSquare, placeholder: 'Paste suspicious message or SMS...' },
    { id: 'content', label: 'Files', icon: FileText, placeholder: 'Analyze file links or metadata...' },
  ];

  const [stats, setStats] = React.useState([
    { label: 'Detection Rate', value: '...', icon: CheckCircle2 },
    { label: 'Latency', value: '...', icon: Zap },
    { label: 'Threats Blocked', value: '0', icon: Shield },
    { label: 'Data Nodes', value: '...', icon: Globe }
  ]);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsService.getGlobalStats();
        const data = response.data;
        setStats([
          { label: 'Detection Rate', value: data.detectionRate, icon: CheckCircle2 },
          { label: 'Latency', value: data.latency, icon: Zap },
          { label: 'Threats Blocked', value: data.threatsBlocked, icon: Shield },
          { label: 'Data Nodes', value: data.dataNodes, icon: Globe }
        ]);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    const fetchFeedbacks = async () => {
      try {
        const response = await feedbackService.getPublic();
        setFeedbacks(response.data);
      } catch (error) {
        console.error('Error fetching feedback:', error);
      }
    };

    fetchStats();
    fetchFeedbacks();
    const interval = setInterval(fetchStats, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const { showToast } = useNotification();

  const handleScan = (e) => {
    e.preventDefault();
    const user = authService.getCurrentUser();

    if (!user) {
      showToast('Please sign in to access deep intelligence scanning.', 'info');
      navigate('/login');
      return;
    }

    if (url) {
      navigate(`/scanner?url=${encodeURIComponent(url)}&type=${activeTab}`);
    }
  };

  const containerRef = React.useRef(null);
  const scrollRef = React.useRef(null);
  const [constraints, setConstraints] = React.useState({ left: 0, right: 0 });

  React.useEffect(() => {
    const updateConstraints = () => {
      if (containerRef.current && scrollRef.current) {
        const parentWidth = containerRef.current.offsetWidth;
        const contentWidth = scrollRef.current.scrollWidth;
        setConstraints({ left: -(contentWidth - parentWidth), right: 0 });
      }
    };

    const observer = new ResizeObserver(updateConstraints);
    if (containerRef.current) observer.observe(containerRef.current);
    if (scrollRef.current) observer.observe(scrollRef.current);

    updateConstraints();
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.homeWrapper}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={styles.heroContent}
        >
          <motion.div variants={itemVariants} className={`${shared.badge} ${shared.badgeSuccess}`}>
            <Zap size={14} fill="currentColor" /> Enterprise Intelligence v4.0 Active
          </motion.div>

          <motion.h1 variants={itemVariants} className={styles.title}>
            The AI engine for <br />
            <span className={styles.primaryText}>Phishing Detection</span>
          </motion.h1>

          <motion.p variants={itemVariants} className={styles.description}>
            The industry standard for real-time URL analysis. Powered by collective neural intelligence
            to identify malicious intent with 99.9% accuracy.
          </motion.p>

          <motion.div variants={itemVariants} className={styles.searchContainer}>
            <div className={styles.tabGroup} ref={containerRef}>
              <motion.div
                className={styles.tabScrollItems}
                drag="x"
                dragConstraints={constraints}
                dragListener={true}
                ref={scrollRef}
                dragElastic={0.1}
                dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                whileTap={{ cursor: 'grabbing' }}
              >
                {scanTypes.map(type => (
                  <button
                    key={type.id}
                    className={`${styles.tabBtn} ${activeTab === type.id ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab(type.id)}
                  >
                    <type.icon size={16} />
                    {type.label}
                  </button>
                ))}
              </motion.div>
            </div>

            <div className={styles.searchWrapper}>
              <form onSubmit={handleScan} className={styles.searchBar}>
                <Search className={styles.searchIcon} size={24} />
                <input
                  type="text"
                  placeholder={scanTypes.find(t => t.id === activeTab)?.placeholder}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className={styles.searchInput}
                />
                <button type="submit" className={styles.searchBtn}>
                  Scan Now
                </button>
              </form>
              <div className={styles.searchMeta}>
                <p className={styles.searchHint}>
                  {activeTab === 'url' ? 'e.g., https://secure-login-phish.com' : 'Advanced AI scanning active'}
                </p>
                <div className={styles.aiStatus}>
                  <Terminal size={12} /> Hybrid Engine v4.0.2
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        {stats.map((stat, i) => (
          <div key={i} className={styles.statItem}>
            <stat.icon size={20} className={styles.statIcon} />
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Engineered for <span className={styles.primaryText}>Certainty</span></h2>
          <p className={shared.textDim}>Enterprise-grade security infrastructure powered by multi-layered AI models.</p>
        </div>

        <div className={styles.featuresGrid}>
          {[
            {
              title: 'Neural Link Analysis',
              desc: 'Deep inspection of URL redirect chains and malicious payload staging areas.',
              icon: Zap
            },
            {
              title: 'Global Intelligence',
              desc: 'Aggregated threat feeds from 50+ vendors synced every 60 seconds.',
              icon: Globe
            },
            {
              title: 'Predictive Defense',
              desc: 'Proprietary ML identifies zero-day threats before they reach your inbox.',
              icon: BarChart3
            }
          ].map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8 }}
              className={`${shared.card} ${styles.featureCard}`}
            >
              <div className={styles.featureIcon}>
                <f.icon size={24} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feedback Section - real-time from backend */}
      <section className={styles.feedbackSection}>
        <div className={styles.sectionHeader}>
          <div className={`${shared.badge} ${shared.badgeInfo}`} style={{ marginBottom: '1rem' }}>Community Verified</div>
          <h2 className={styles.sectionTitle}>Trusted by <span className={styles.primaryText}>Millions</span></h2>
          <p className={shared.textDim}>See what the global security community is saying about our intelligence engine.</p>
        </div>

        {feedbacks.length > 0 ? (
          <div className={styles.feedbackGrid}>
            {feedbacks.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={styles.feedbackCard}
              >
                <Quote className={styles.quoteIcon} size={32} />
                <p className={styles.feedbackMessage}>"{f.message}"</p>
                <div className={styles.feedbackUser}>
                  <div className={styles.userAvatar}>{f.fullName.charAt(0)}</div>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{f.fullName}</span>
                    <div className={styles.rating}>
                      {[...Array(f.rating)].map((_, idx) => <Star key={idx} size={12} fill="currentColor" />)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyFeedback}>
            <MessageSquare size={40} style={{ opacity: 0.3 }} />
            <p>Be the first to share your experience with the community.</p>
          </div>
        )}
      </section>
    </div>
  );
}
