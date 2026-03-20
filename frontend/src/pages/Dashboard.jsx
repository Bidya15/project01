import { useState, useEffect } from 'react';
import { scannerService, reportService, statsService } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, ShieldCheck, History, Clock, ArrowUpRight, Globe, Cpu, Crown, Flag, ShieldX, Search, Filter, LayoutDashboard } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import shared from '../styles/Shared.module.css';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [history, setHistory] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState([]);
  const [globalStats, setGlobalStats] = useState({ totalAnalysesCount: 0, threatsDetectedCount: 0, domainsClearedCount: 0 });
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotification();

  const handleQuickAction = async (url, type) => {
    try {
      const trimmedUrl = url.trim();
      let normalizedUrl = trimmedUrl;
      if (!trimmedUrl.includes('://')) {
        normalizedUrl = 'https://' + trimmedUrl;
      }

      let domain;
      try {
        domain = new URL(normalizedUrl).hostname;
      } catch (e) {
        domain = trimmedUrl.split('/')[0].split('?')[0];
      }

      if (!domain) {
        showToast('Invalid domain format.', 'error');
        return;
      }

      await reportService.submit(domain);
      showToast(`${type === 'blacklist' ? 'Blacklisted' : 'Reported'} domain: ${domain}`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Action failed. Please try again.', 'error');
    }
  };

  const handleVerify = async (id) => {
    try {
      await reportService.verify(id);
      const reportsRes = await reportService.getRecent();
      setReports(reportsRes.data);
      showToast('Domain verified and promoted to global blacklist.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Verification failed.', 'error');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, reportsRes, statsRes] = await Promise.all([
          scannerService.getHistory(),
          reportService.getRecent(),
          statsService.getGlobalStats()
        ]);

        setHistory(historyRes.data);
        setReports(reportsRes.data);
        setGlobalStats(statsRes.data);

        const counts = historyRes.data.reduce((acc, scan) => {
          acc[scan.classification] = (acc[scan.classification] || 0) + 1;
          return acc;
        }, {});

        setStats([
          { name: 'Malicious', value: counts['PHISHING'] || 0, color: '#ef4444' },
          { name: 'Neutralized', value: counts['SAFE'] || 0, color: '#10b981' },
          { name: 'Suspicious', value: counts['SUSPICIOUS'] || 0, color: '#f59e0b' },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className={shared.container} style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className={shared.badge}>ANALYZING GLOBAL THREATS...</div>
  </div>;

  return (
    <div className={`${shared.container} ${styles.dashboardPage}`}>
      <header className={styles.dashboardHeader}>
        <div>
          <div className={`${shared.badge} ${shared.badgeInfo}`} style={{ marginBottom: '1rem' }}>
            Sentinel Command Center
          </div>
          <h1 className={styles.title}>Analysis Dashboard</h1>
          <p className={shared.textDim}>Global threat intelligence overview and neural heuristic history.</p>
        </div>
        <div className={shared.badge}>
          <div style={{ width: 8, height: 8, background: 'var(--success)', borderRadius: '50%' }} />
          LIVE MONITORING ACTIVE
        </div>
      </header>

      <div className={styles.tabsHeader}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <LayoutDashboard size={18} /> Overview
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'intel' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('intel')}
        >
          <Globe size={18} /> Threat Intelligence
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          <div className={styles.statsGrid}>
            {[
              { label: 'Total Analyses', value: globalStats.totalAnalysesCount, icon: Activity, color: 'var(--primary)' },
              { label: 'Intelligence Nodes', value: 'Active', icon: Globe, color: 'var(--secondary)' },
              { label: 'Threats Detected', value: globalStats.threatsDetectedCount, icon: ShieldAlert, color: 'var(--danger)' },
              { label: 'Domains Cleared', value: globalStats.domainsClearedCount, icon: ShieldCheck, color: 'var(--success)' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`${shared.card} ${styles.statCard}`}
              >
                <div className={styles.statLabel}>{stat.label}</div>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statIconWrapper} style={{ background: `${stat.color}10`, color: stat.color }}>
                  <stat.icon size={18} />
                </div>
              </motion.div>
            ))}
          </div>

          <div className={styles.chartsGrid}>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${shared.card} ${styles.chartCard}`}
            >
              <div className={styles.cardHeader}>
                <h3>Classification Distribution</h3>
              </div>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={stats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%" cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    stroke="none"
                  >
                    {stats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid var(--card-border)', borderRadius: '0.75rem', boxShadow: 'var(--shadow-lg)' }}
                    itemStyle={{ color: 'var(--text)', fontWeight: 700 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${shared.card} ${styles.chartCard} ${styles.mapCard}`}
            >
              <div className={styles.cardHeader}>
                <h3><Globe size={18} /> Tactical Intelligence Grid</h3>
                <div className={styles.livePulse}>
                  <div className={styles.pulseDot} />
                  LIVE THREAT MONITOR
                </div>
              </div>
              <div className={styles.mapContainer}>
                <svg viewBox="0 0 1000 500" className={styles.mapSvg}>
                  {/* Stylized Simplified World Map */}
                  <path
                    d="M150,150 L200,100 L300,120 L350,180 L300,250 L200,280 L150,220 Z M450,100 L550,80 L650,120 L680,200 L600,280 L500,250 L450,180 Z M200,350 L280,320 L350,380 L320,450 L220,430 Z M700,300 L800,280 L880,350 L850,450 L750,430 L700,380 Z"
                    fill="var(--surface)"
                    stroke="var(--card-border)"
                    strokeWidth="1"
                  />
                  {/* Dynamic Threat Nodes */}
                  {[
                    { x: 220, y: 180, delay: 0 },
                    { x: 550, y: 150, delay: 1.2 },
                    { x: 300, y: 380, delay: 2.5 },
                    { x: 780, y: 350, delay: 0.8 },
                    { x: 600, y: 220, delay: 3.1 }
                  ].map((node, i) => (
                    <g key={i}>
                      <circle className={styles.threatPulse} cx={node.x} cy={node.y} r="15" fill="var(--danger)" opacity="0.2">
                        <animate attributeName="r" from="5" to="25" dur="3s" begin={`${node.delay}s`} repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.4" to="0" dur="3s" begin={`${node.delay}s`} repeatCount="indefinite" />
                      </circle>
                      <circle cx={node.x} cy={node.y} r="4" fill="var(--danger)" />
                    </g>
                  ))}
                  {/* Connection Lines (Tactical Look) */}
                  <path
                    d="M220,180 Q400,100 550,150 M550,150 Q650,150 780,350 M300,380 Q500,300 600,220"
                    stroke="var(--primary)"
                    strokeWidth="0.5"
                    fill="none"
                    strokeDasharray="4 4"
                    opacity="0.3"
                  />
                </svg>
                <div className={styles.mapOverlay}>
                  <div className={styles.overlayItem}>
                    <span>Active Nodes</span>
                    <span>124.8k</span>
                  </div>
                  <div className={styles.overlayItem}>
                    <span>Neutralized</span>
                    <span className={styles.successColor}>89.2%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className={styles.tableSection}>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${shared.card} ${styles.tableCard}`}
            >
              <div className={styles.cardHeader}>
                <h3><History size={18} /> Analysis History</h3>
                <span className={styles.headerCount}>{history.length} Scans</span>
              </div>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.tableHeader}>
                    <th>Scan Target</th>
                    <th style={{ textAlign: 'right' }}>Security Score</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 8).map((scan, idx) => (
                    <tr key={scan.id} className={styles.tableRow}>
                      <td className={styles.tableCell}>
                        <div className={styles.urlCell}>{scan.url}</div>
                        <span className={styles.cellDate}>{new Date(scan.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className={styles.tableCell} style={{ textAlign: 'right' }}>
                        <span className={`${styles.riskBadge} ${scan.classification === 'PHISHING' ? styles.badgeDanger : styles.badgeSuccess}`}>
                          {scan.riskScore.toFixed(0)}% Risk
                        </span>
                      </td>
                      <td className={`${styles.tableCell} ${styles.actionCell}`} style={{ textAlign: 'right' }}>
                        <div className={styles.actionIcons}>
                          <div
                            className={`${styles.actionIcon} ${styles.iconReport}`}
                            onClick={() => handleQuickAction(scan.url, 'report')}
                            title="Report Threat"
                          >
                            <Flag size={18} />
                          </div>
                          <div
                            className={`${styles.actionIcon} ${styles.iconBlacklist}`}
                            onClick={() => handleQuickAction(scan.url, 'blacklist')}
                            title="Add to Blacklist"
                          >
                            <ShieldX size={18} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${shared.card} ${styles.tableCard}`}
            >
              <div className={styles.cardHeader}>
                <h3><Globe size={18} /> Community Intel</h3>
                <span className={styles.headerCount}>{reports.length} Reports</span>
              </div>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.tableHeader}>
                    <th>Domain Origin</th>
                    <th style={{ textAlign: 'right' }}>Analysis State</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.slice(0, 8).map((report, idx) => (
                    <tr key={report.id} className={styles.tableRow}>
                      <td className={styles.tableCell}>
                        <div className={styles.urlCell}>{report.domain}</div>
                        <span className={styles.cellDate}>Community Verified</span>
                      </td>
                      <td className={styles.tableCell} style={{ textAlign: 'right' }}>
                        <span className={styles.statusBadge}>
                          {report.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        </>
      ) : (
        <div className={styles.intelContainer}>
          <div className={styles.intelGrid}>
            {/* Blacklist Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${shared.card} ${styles.intelCard}`}
            >
              <div className={styles.cardHeader}>
                <h3><ShieldAlert size={18} /> Verified Blacklist</h3>
                <div className={styles.cardSearch}>
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search domains..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.intelList}>
                {reports.filter(r => (r.status === 'VERIFIED' || r.status === 'MALICIOUS') && r.domain.includes(searchTerm)).map((site, idx) => (
                  <div key={site.id} className={styles.intelItem}>
                    <div className={styles.itemMain}>
                      <span className={styles.domainText}>{site.domain}</span>
                      <span className={styles.itemMeta}>Confirmed {new Date(site.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className={`${styles.statusBadgeSmall} ${styles.statusDanger}`}>Blocked</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Community Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${shared.card} ${styles.intelCard}`}
            >
              <div className={styles.cardHeader}>
                <h3><Flag size={18} /> Community Reports</h3>
                <span className={styles.headerCount}>{reports.filter(r => r.status === 'PENDING').length} Pending</span>
              </div>
              <div className={styles.intelList}>
                {reports.filter(r => r.status === 'PENDING' && r.domain.includes(searchTerm)).map((report, idx) => (
                  <div key={report.id} className={styles.intelItem}>
                    <div className={styles.itemMain}>
                      <span className={styles.domainText}>{report.domain}</span>
                      <span className={styles.itemMeta}>Reported {new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.itemActions}>
                      <span className={`${styles.statusBadgeSmall} ${styles.statusWarn}`}>Pending</span>
                      <button
                        className={styles.verifyBtn}
                        onClick={() => handleVerify(report.id)}
                        title="Promote to Blacklist"
                      >
                        <ShieldCheck size={14} /> Verify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
