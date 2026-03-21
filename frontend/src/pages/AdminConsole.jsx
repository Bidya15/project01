import React, { useState, useEffect } from 'react';
import { adminService, reportService, authService, feedbackService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Activity, Flag, ShieldAlert, CheckCircle, XCircle, Search, Trash2, UserPlus, Server, Globe, ShieldCheck, Terminal, MessageSquare, Star } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import shared from '../styles/Shared.module.css';
import styles from './AdminConsole.module.css';

export default function AdminConsole() {
  const currentUser = authService.getCurrentUser();
  const mobileNavRef = React.useRef(null);
  const mobileNavScrollRef = React.useRef(null);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    pendingReports: 0,
    totalFeedback: 0,
    totalScans: 0,
    activeAdmins: 0
  });


  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);
  const [error, setError] = useState(null);
  const [confirmPurgeId, setConfirmPurgeId] = useState(null);
  const { showToast } = useNotification();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsRes = await adminService.getStats();
        setStats(statsRes.data);
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
        setError("Access Denied: You do not have permission to view system metrics.");
      }

      try {
        const usersRes = await adminService.getUsers();
        setUsers(usersRes.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
        setError("Access Denied: User directory is restricted.");
      }

      try {
        const reportsRes = await reportService.getRecent();
        setReports(reportsRes.data);
      } catch (err) {
        console.error("Failed to fetch reports", err);
      }

      try {
        const auditRes = await adminService.getAuditLogs();
        setAuditLogs(auditRes.data);
      } catch (err) {
        console.error("Failed to fetch audit logs", err);
      }

      try {
        const feedbackRes = await feedbackService.getAll();
        setFeedback(feedbackRes.data);
      } catch (err) {
        console.error("Failed to fetch feedback", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);


  const handleVerify = async (id) => {
    try {
      await reportService.verify(id);
      const reportsRes = await reportService.getRecent();
      setReports(reportsRes.data);
      showToast("Domain verified and promoted to global blacklist.", "success");
    } catch (err) {
      showToast("Verification failed.", "error");
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminService.approveUser(id);
      const usersRes = await adminService.getUsers();
      setUsers(usersRes.data);
      showToast("Account activated successfully.", "success");
    } catch (err) {
      showToast("Activation failed.", "error");
    }
  };

  const handleReject = (id) => {
    setConfirmPurgeId(id);
  };

  const executePurge = async () => {
    const id = confirmPurgeId;
    setConfirmPurgeId(null);
    try {
      await adminService.rejectUser(id);
      const usersRes = await adminService.getUsers();
      setUsers(usersRes.data);
      showToast("User record purged from system.", "info");
    } catch (err) {
      const msg = err.response?.data?.message || "Purge failed.";
      showToast(msg, "error");
    }
  };

  const handleBlock = async (id) => {
    try {
      await adminService.blockUser(id);
      const usersRes = await adminService.getUsers();
      setUsers(usersRes.data);
      showToast("Access privileges revoked.", "info");
    } catch (err) {
      const msg = err.response?.data?.message || "Blocking failed.";
      showToast(msg, "error");
    }
  };

  const handleUnblock = async (id) => {
    try {
      await adminService.unblockUser(id);
      const usersRes = await adminService.getUsers();
      setUsers(usersRes.data);
      showToast("Access privileges restored.", "success");
    } catch (err) {
      const msg = err.response?.data?.message || "Unblocking failed.";
      showToast(msg, "error");
    }
  };

  const handleChangeRole = async (id, role) => {
    try {
      await adminService.changeRole(id, role);
      const usersRes = await adminService.getUsers();
      setUsers(usersRes.data);
      showToast(`User promoted to ${role}.`, "success");
    } catch (err) {
      showToast("Delegation failed.", "error");
    }
  };

  const handleDeleteReport = async (id) => {
    try {
      await reportService.delete(id);
      const reportsRes = await reportService.getRecent();
      setReports(reportsRes.data);
      showToast("Threat record discarded.", "info");
    } catch (err) {
      showToast("Deletion failed.", "error");
    }
  };

  const handleDeleteFeedback = async (id) => {
    try {
      await feedbackService.delete(id);
      setFeedback(feedback.filter(f => f.id !== id));
      showToast('User inquiry purged.', 'info');
    } catch (err) {
      showToast('Purge protocol failure.', 'error');
    }
  };

  const handleToggleFeature = async (id) => {
    try {
      const res = await feedbackService.toggleFeature(id);
      setFeedback(feedback.map(f => f.id === id ? { ...f, featured: res.data.featured } : f));
      showToast(res.data.message, 'success');
    } catch (err) {
      showToast('Feature toggle failed.', 'error');
    }
  };

  if (loading) return (
    <div className={shared.container} style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className={shared.badge}>INITIALIZING SECURE CMS...</div>
    </div>
  );

  return (
    <div className={`${shared.container} ${styles.adminPage}`}>
      <header className={styles.adminHeader}>
        <div>
          {error && (
            <div className={`${shared.badge} ${shared.badgeDanger}`} style={{ marginBottom: '1rem', width: 'fit-content' }}>
              <ShieldAlert size={14} style={{ marginRight: '0.5rem' }} /> {error}
            </div>
          )}
          <div className={`${shared.badge} ${shared.badgeDanger}`} style={{ marginBottom: '1rem' }}>
            Restricted: System Administrator
          </div>
          <h1 className={styles.title}>System CMS</h1>
          <p className={shared.textDim}>Global node management and threat governance console.</p>
        </div>
        <div className={styles.serverStatus}>
          <Server size={18} />
          <span>Core Nodes: Operational</span>
        </div>
      </header>

      {/* Mobile-only Tab Bar — sits outside the grid, now draggable */}
      <div className={styles.mobileTabBar} ref={mobileNavRef}>
        <div
          className={styles.mobileTabScrollItems}
          ref={mobileNavScrollRef}
        >
          <button className={`${styles.mobileTab} ${activeView === 'overview' ? styles.mobileTabActive : ''}`} onClick={() => setActiveView('overview')}>
            <Activity size={16} /><span>Overview</span>
          </button>
          <button className={`${styles.mobileTab} ${activeView === 'users' ? styles.mobileTabActive : ''}`} onClick={() => setActiveView('users')}>
            <Users size={16} /><span>Users</span>
          </button>
          <button className={`${styles.mobileTab} ${activeView === 'reports' ? styles.mobileTabActive : ''}`} onClick={() => setActiveView('reports')}>
            <Flag size={16} /><span>Threats</span>
          </button>
          <button className={`${styles.mobileTab} ${activeView === 'feedback' ? styles.mobileTabActive : ''}`} onClick={() => setActiveView('feedback')}>
            <MessageSquare size={16} /><span>Inquiries</span>
          </button>
          <button className={`${styles.mobileTab} ${activeView === 'audit' ? styles.mobileTabActive : ''}`} onClick={() => setActiveView('audit')}>
            <Terminal size={16} /><span>Audit Termination</span>
          </button>
        </div>
      </div>

      <div className={styles.adminGrid}>
        <aside className={styles.sidebar}>
          <button className={`${styles.navBtn} ${activeView === 'overview' ? styles.active : ''}`} onClick={() => setActiveView('overview')}>
            <Activity size={18} /> Overview
          </button>
          <button className={`${styles.navBtn} ${activeView === 'users' ? styles.active : ''}`} onClick={() => setActiveView('users')}>
            <Users size={18} /> User Directory
          </button>
          <button className={`${styles.navBtn} ${activeView === 'reports' ? styles.active : ''}`} onClick={() => setActiveView('reports')}>
            <Flag size={18} /> Global Threats
          </button>
          <button className={`${styles.navBtn} ${activeView === 'feedback' ? styles.active : ''}`} onClick={() => setActiveView('feedback')}>
            <MessageSquare size={18} /> User Inquiries
          </button>
          <button className={`${styles.navBtn} ${activeView === 'audit' ? styles.active : ''}`} onClick={() => setActiveView('audit')}>
            <Terminal size={18} /> Audit Terminal
          </button>
        </aside>

        <main className={styles.content}>
          <AnimatePresence mode="wait">
            {activeView === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={styles.viewContainer}
              >
                <div className={styles.statsRow}>
                  <div className={styles.miniCard}>
                    <div className={styles.miniLabel}>Total Users</div>
                    <div className={styles.miniValue}>{stats.totalUsers}</div>
                    <div className={styles.miniIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
                      <Users size={16} />
                    </div>
                  </div>
                  <div className={styles.miniCard}>
                    <div className={styles.miniLabel}>Scan Analyses</div>
                    <div className={styles.miniValue}>{stats.totalScans}</div>
                    <div className={styles.miniIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                      <Activity size={16} />
                    </div>
                  </div>
                  <div className={styles.miniCard}>
                    <div className={styles.miniLabel}>User Inquiries</div>
                    <div className={styles.miniValue}>{stats.totalFeedback}</div>
                    <div className={styles.miniIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                      <MessageSquare size={16} />
                    </div>
                  </div>
                </div>

                <div className={styles.statsRow}>
                  <div className={styles.miniCard}>
                    <div className={styles.miniLabel}>Global Reports</div>
                    <div className={styles.miniValue}>{stats.totalReports}</div>
                    <div className={styles.miniIcon} style={{ background: 'rgba(147, 51, 234, 0.1)', color: 'var(--secondary)' }}>
                      <Globe size={16} />
                    </div>
                  </div>
                  <div className={styles.miniCard}>
                    <div className={styles.miniLabel}>Pending Intel</div>
                    <div className={styles.miniValue}>{stats.pendingReports}</div>
                    <div className={styles.miniIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                      <ShieldAlert size={16} />
                    </div>
                  </div>
                  <div className={styles.miniCard}>
                    <div className={styles.miniLabel}>System Admins</div>
                    <div className={styles.miniValue}>{stats.activeAdmins}</div>
                    <div className={styles.miniIcon} style={{ background: 'rgba(71, 85, 105, 0.1)', color: '#475569' }}>
                      <Shield size={16} />
                    </div>
                  </div>
                </div>

                <div className={styles.systemHealth}>
                  <h3>Network Integrity</h3>
                  <div className={styles.healthBar}>
                    <div className={styles.healthFill} style={{ width: '98%' }} />
                  </div>
                  <p>System is operating within optimal parameters. All heuristic nodes synchronized.</p>
                </div>

                <div className={styles.systemHealth} style={{ borderLeft: '4px solid var(--danger)' }}>
                  <h3>Security Override</h3>
                  <div className={styles.searchBox} style={{ width: '100%', marginBottom: '1rem' }}>
                    <ShieldAlert size={16} />
                    <input
                      type="text"
                      placeholder="Add domain to high-priority blacklist..."
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          try {
                            await adminService.manualBlacklist(e.currentTarget.value);
                            showToast("Domain blacklisted via admin override.", "success");
                            e.currentTarget.value = '';
                          } catch (err) {
                            showToast("Override failed.", "error");
                          }
                        }
                      }}
                    />
                  </div>
                  <p className={shared.textDim} style={{ fontSize: '0.8rem' }}>Press [Enter] to inject threat intelligence directly into the global core.</p>
                </div>
              </motion.div>
            )}

            {activeView === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={styles.viewContainer}
              >
                <div className={styles.tableHeaderSection}>
                  <h3>User Directory</h3>
                  <div className={styles.searchBox}>
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Filter users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.tableWrapper}>
                  <table className={styles.adminTable}>
                    <thead>
                      <tr>
                        <th>Identifier</th>
                        <th>Account Status</th>
                        <th>Privilege</th>
                        <th style={{ textAlign: 'right' }}>Management</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(u => u.username.includes(searchTerm)).map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className={styles.userName}>{user.username}</div>
                            <div className={styles.userEmail}>{user.email}</div>
                          </td>
                          <td>
                            {user.enabled ? (
                              <span className={`${styles.roleBadge} ${styles.roleUser}`} style={{ background: '#e6f4ea', color: 'var(--success)' }}>
                                ACTIVE
                              </span>
                            ) : (
                              <span className={`${styles.roleBadge}`} style={{ background: '#fef2f2', color: 'var(--danger)' }}>
                                BLOCKED
                              </span>
                            )}
                          </td>
                          <td>
                            <select
                              className={styles.roleSelector}
                              value={user.role}
                              onChange={(e) => handleChangeRole(user.id, e.target.value)}
                            >
                              <option value="ROLE_USER">User</option>
                              <option value="ROLE_ADMIN">Admin</option>
                            </select>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                              {user.email === 'bidyasingrongpi90@gmail.com' || (currentUser && currentUser.username === user.username) ? (
                                <span className={styles.confirmedLabel} style={{ color: '#64748b' }}>
                                  <ShieldCheck size={14} /> {user.email === 'bidyasingrongpi90@gmail.com' ? 'SYSTEM CORE' : 'CURRENT SESSION'}
                                </span>
                              ) : (
                                <>
                                  {user.role !== 'ROLE_ADMIN' && (
                                    <>
                                      {user.enabled ? (
                                        <button className={`${styles.actionBtn} ${styles.actionBtnBlock}`} onClick={() => handleBlock(user.id)}>
                                          Block
                                        </button>
                                      ) : (
                                        <button className={styles.verifyBtn} onClick={() => handleUnblock(user.id)}>
                                          Unblock
                                        </button>
                                      )}
                                      <button className={styles.actionBtnDelete} onClick={() => handleReject(user.id)}>
                                        <Trash2 size={16} />
                                      </button>
                                    </>
                                  )}
                                  {user.role === 'ROLE_ADMIN' && (
                                    <button className={`${styles.actionBtn} ${styles.actionBtnBlock}`} onClick={() => handleBlock(user.id)}>
                                      Block
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeView === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={styles.viewContainer}
              >
                <div className={styles.tableHeaderSection}>
                  <h3>Global Threat Queue</h3>
                  <span className={styles.headerCount}>{reports.filter(r => r.status === 'PENDING').length} Actions Required</span>
                </div>
                <div className={styles.reportGrid}>
                  {reports.map((report) => (
                    <div key={report.id} className={styles.reportCard}>
                      <div className={styles.reportMain}>
                        <div className={styles.reportDomain}>{report.domain}</div>
                        <div className={styles.reportMeta}>
                          {report.status} • Reported {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={styles.reportActions}>
                        {report.status === 'PENDING' ? (
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className={styles.verifyBtn} onClick={() => handleVerify(report.id)}>
                              <ShieldCheck size={14} /> Verify
                            </button>
                            <button className={styles.actionBtnDelete} onClick={() => handleDeleteReport(report.id)}>
                              <XCircle size={16} />
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <span className={styles.confirmedLabel}><CheckCircle size={14} /> Confirmed</span>
                            <button className={styles.actionBtnDelete} onClick={() => handleDeleteReport(report.id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeView === 'feedback' && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={styles.viewContainer}
              >
                <div className={styles.tableHeaderSection}>
                  <h3>Community Feedback Repository</h3>
                  <div className={styles.searchBox}>
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Filter inquiries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.feedbackGrid}>
                  {feedback.filter(f =>
                    f.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    f.message?.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((item) => (
                    <div key={item.id} className={styles.feedbackCard}>
                      <div className={styles.feedbackHeader}>
                        <div className={styles.userInfo}>
                          <div className={styles.userName}>{item.fullName || 'Guest Contributor'}</div>
                          <div className={styles.userEmail}>{item.username && item.username !== 'anonymous' ? `@${item.username}` : 'System Visitor'}</div>
                        </div>
                        <div className={styles.categoryBadge}>{item.category || 'General'}</div>
                      </div>

                      <div className={styles.ratingRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            fill={s <= item.rating ? "#ffc107" : "none"}
                            stroke={s <= item.rating ? "#ffc107" : "#cbd5e1"}
                          />
                        ))}
                        <span className={styles.timestamp}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className={styles.feedbackMessage}>
                        {item.message}
                      </div>

                      <div className={styles.feedbackFooter}>
                        <button
                          className={item.featured ? styles.verifyBtn : styles.actionBtn}
                          onClick={() => handleToggleFeature(item.id)}
                          title={item.featured ? 'Remove from homepage' : 'Feature on homepage'}
                        >
                          <Star size={14} fill={item.featured ? 'currentColor' : 'none'} />
                          {item.featured ? 'Featured ✓' : 'Feature'}
                        </button>
                        <button
                          className={styles.actionBtnDelete}
                          onClick={() => handleDeleteFeedback(item.id)}
                          style={{ marginLeft: 'auto' }}
                        >
                          <Trash2 size={16} /> Purge
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeView === 'audit' && (
              <motion.div
                key="audit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={styles.viewContainer}
              >
                <div className={styles.terminalContainer}>
                  <div className={styles.terminalHeader}>
                    <div className={styles.terminalTitle}>
                      <Terminal size={20} /> SYSTEM AUDIT LOG REPOSITORY
                    </div>
                    <div className={styles.liveIndicator}>
                      <div className={styles.dotPulse} />
                      ENCRYPTED FEED ACTIVE
                    </div>
                  </div>
                  {auditLogs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                      NO ADMINISTRATIVE EVENTS RECORDED IN CURRENT EPOCH
                    </div>
                  ) : (
                    auditLogs.map((log) => (
                      <div key={log.id} className={styles.logEntry}>
                        <span className={styles.logTimestamp}>[{new Date(log.createdAt).toLocaleString()}]</span>
                        <span className={styles.logAction}>{log.action}</span>
                        <span className={styles.logAdmin}>{log.user?.username || 'ANONYMOUS'}</span>
                        <span className={styles.logDetails}>{log.details}</span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {confirmPurgeId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalOverlay}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={styles.modal}
            >
              <div className={styles.modalTitle}>
                <ShieldAlert size={48} color="#ef4444" />
                CRITICAL SYSTEM ACTION
              </div>
              <p className={styles.modalText}>
                You are about to permanently <strong>PURGE</strong> this user account and all associated master records. This action is irreversible and will bypass standard archival protocols.
              </p>
              <div className={styles.modalActions}>
                <button className={styles.modalCancel} onClick={() => setConfirmPurgeId(null)}>
                  ABORT OPERATION
                </button>
                <button className={styles.modalConfirm} onClick={executePurge}>
                  CONFIRM PURGE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


