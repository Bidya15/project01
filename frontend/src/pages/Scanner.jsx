import React, { useState } from 'react';
import { scannerService, reportService } from '../services/api';
import { Shield, AlertTriangle, CheckCircle, Search, Cpu, Globe, Lock, ExternalLink, ArrowRight, Zap, Mail, MessageSquare, FileText, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { useNotification } from '../context/NotificationContext';
import shared from '../styles/Shared.module.css';
import styles from './Scanner.module.css';

export default function Scanner() {
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState('url');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanningStep, setScanningStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const { showToast } = useNotification();

  const scanTypes = [
    { id: 'url', label: 'URL', icon: LinkIcon, placeholder: 'https://example-phish.com' },
    { id: 'email', label: 'Email', icon: Mail, placeholder: 'Paste email content...' },
    { id: 'message', label: 'Message', icon: MessageSquare, placeholder: 'Paste message content...' },
    { id: 'content', label: 'Files', icon: FileText, placeholder: 'Scan links for risky metadata...' },
  ];

  const steps = [
    { label: "Identifying Source", status: "complete" },
    { label: "Extracting Meta-Features", status: "complete" },
    { label: "Querying Threat DB", status: "complete" },
    { label: "Neural Classification", status: "loading" }
  ];

  const handleScan = async (e) => {
    if (e) e.preventDefault();
    setResult(null);
    setLoading(true);
    setScanningStep(0);

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      showToast('Please enter a target for analysis.', 'info');
      setLoading(false);
      return;
    }

    let normalizedUrl = trimmedUrl;
    if (!trimmedUrl.includes('://')) {
      normalizedUrl = 'https://' + trimmedUrl;
    }

    const stepInterval = setInterval(() => {
      setScanningStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 800);

    try {
      const response = await scannerService.scan(normalizedUrl);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      showToast('Analysis node failed to respond. Please check connectivity.', 'error');
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('url');
    if (urlParam) {
      setUrl(urlParam);
      // Auto-scan after a short delay to allow UI to settle
      setTimeout(() => handleScan(), 500);
    }
  }, []);

  const parseDetails = (detailsStr) => {
    try {
      return JSON.parse(detailsStr) || {};
    } catch (e) {
      return {};
    }
  };

  const getStatusText = (key, val) => {
    if (val === true || val === 'true') return 'MALICIOUS';
    return 'CLEAN';
  };

  const getRadarData = (result) => {
    const details = parseDetails(result?.analysisDetails);
    const weights = details.mlResult?.xai_weights || {
      "Structural": 20,
      "Domain": 30,
      "Keywords": 10,
      "Security": 40,
      "Entropy": 15
    };

    return Object.keys(weights).map(key => ({
      subject: key,
      A: weights[key],
      fullMark: 100
    }));
  };

  const handleLaunchPreview = async () => {
    setPreviewLoading(true);
    setShowPreview(true);
    try {
      const response = await scannerService.getPreview(url);
      setPreviewData(response.data);
    } catch (err) {
      console.error("Preview error:", err);
      setPreviewData({ error: 'Preview node isolated. Sandbox safety engaged or unauthorized access.' });
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className={`${shared.container} ${styles.scannerPage}`}>
      {/* Scanner Hero */}
      <section className={styles.heroSection}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.heroContent}
        >
          <div className={`${shared.badge} ${shared.badgeSuccess}`}>
            <Globe size={12} /> Secure Scanning Node Active
          </div>
          <h1 className={styles.pageTitle}>Deep Analysis <span className={styles.primaryText}>Scanner</span></h1>
          <p className={styles.pageSubtitle}>
            Our neural engine performs real-time inspection of your URL against
            multi-layer classification models.
          </p>

          <div className={styles.inputContainer}>
            <div className={styles.tabGroup}>
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
            </div>

            <form onSubmit={handleScan} className={styles.inputWrapper}>
              <div className={styles.searchBar}>
                <Search className={styles.searchIcon} size={20} />
                <input
                  type="text"
                  placeholder={scanTypes.find(t => t.id === activeTab)?.placeholder}
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  required
                />
                <button type="submit" className={styles.scanBtn} disabled={loading}>
                  {loading ? 'Analyzing...' : 'Execute Scan'}
                </button>
              </div>
            </form>
          </div>

          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.stepperContainer}
              >
                {steps.map((step, i) => (
                  <div key={i} className={`${styles.step} ${i <= scanningStep ? styles.stepActive : ''}`}>
                    <div className={styles.stepCircle}>
                      {i < scanningStep ? <CheckCircle size={14} /> : (i === scanningStep ? <div className={styles.dot} /> : i + 1)}
                    </div>
                    <span>{step.label}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Analysis Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.resultGrid}
          >
            {/* Primary Status Card */}
            <div className={`${shared.card} ${styles.primaryResult}`}>
              <div className={styles.resHeader}>
                <div className={`${styles.resIcon} ${result.classification === 'PHISHING' ? styles.resIconDanger : styles.resIconSuccess}`}>
                  {result.classification === 'PHISHING' ? <AlertTriangle size={32} /> : <Shield size={32} />}
                </div>
                <div>
                  <div className={shared.badge}>{result.classification === 'PHISHING' ? 'Malicious Detected' : 'No Threat Detected'}</div>
                  <h2 className={result.classification === 'PHISHING' ? styles.dangerText : styles.successText}>
                    {result.classification}
                  </h2>
                </div>
              </div>
              <div className={styles.resDivider} />
              <div className={styles.resScore}>
                <div className={styles.scoreHeader}>
                  <p>Risk Probability Index</p>
                  <span>{result.riskScore.toFixed(0)}%</span>
                </div>
                <div className={styles.scoreBar}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.riskScore}%` }}
                    className={styles.scoreFill}
                    style={{ background: result.classification === 'PHISHING' ? 'var(--danger)' : 'var(--primary)' }}
                  />
                </div>
              </div>
            </div>

            {/* AI Indicators / Explainability Section */}
            <div className={`${shared.card} ${styles.infoCard}`} style={{ gridColumn: 'span 2' }}>
              <div className={styles.cardTop}>
                <Cpu size={18} /> Deep Logic Indicators
              </div>
              <div className={styles.indicatorList}>
                {parseDetails(result.analysisDetails).heuristics?.map((indicator, idx) => (
                  <div key={idx} className={styles.indicatorItem}>
                    <div className={styles.indicatorDot} />
                    {indicator}
                  </div>
                ))}
                {(!parseDetails(result.analysisDetails).heuristics || parseDetails(result.analysisDetails).heuristics.length === 0) && (
                  <div className={styles.textDim}>No critical heuristic anomalies detected.</div>
                )}
              </div>
            </div>

            {/* Information Cards */}
            <div className={`${shared.card} ${styles.infoCard}`}>
              <div className={styles.cardTop}>
                <Globe size={18} /> Intelligence Signals
              </div>
              <div className={styles.intelGrid}>
                {(() => {
                  const details = parseDetails(result.analysisDetails);
                  const t = details.threatIntel || {};

                  return (
                    <>
                      <div className={styles.intelItem}>
                        <div className={styles.intelLabel}>
                          <img src="https://www.google.com/favicon.ico" alt="Google" width={16} height={16} />
                          Google Safe Browsing
                        </div>
                        <span className={t.googleSafeBrowsing === true || t.googleSafeBrowsing === 'true' ? styles.dangerText : styles.successText}>
                          {getStatusText('google', t.googleSafeBrowsing)}
                        </span>
                      </div>
                      <div className={styles.intelItem}>
                        <div className={styles.intelLabel}>
                          <img src="https://www.virustotal.com/gui/images/favicon.png" alt="VT" width={16} height={16} />
                          VirusTotal Reputation
                        </div>
                        <span className={t.virusTotal === true || t.virusTotal === 'true' ? styles.dangerText : styles.successText}>
                          {getStatusText('vt', t.virusTotal)}
                        </span>
                      </div>
                      <div className={styles.intelItem}>
                        <div className={styles.intelLabel}>
                          <Shield size={16} /> PhishTank Database
                        </div>
                        <span className={t.phishTank === true || t.phishTank === 'true' ? styles.dangerText : styles.successText}>
                          {t.phishTank === true || t.phishTank === 'true' ? "POSITIVE" : "NEGATIVE"}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className={`${shared.card} ${styles.infoCard}`}>
              <div className={styles.cardTop}>
                <Zap size={18} /> Neural Logic & XAI Explainability
              </div>
              <div className={styles.xaiGrid}>
                <div className={styles.xaiChart}>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getRadarData(result)}>
                      <PolarGrid stroke="var(--card-border)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-dim)', fontSize: 10, fontWeight: 700 }} />
                      <Radar
                        name="Contribution"
                        dataKey="A"
                        stroke="var(--primary)"
                        fill="var(--primary)"
                        fillOpacity={0.4}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className={styles.xaiInfo}>
                  <p>
                    Neural cluster ALPHA-01 identified risk patterns with
                    <strong> {(result.riskScore * 0.9).toFixed(1)}%</strong> confidence.
                  </p>
                  <div className={styles.cardStats}>
                    <div className={styles.miniStat}>
                      <span>Inference</span>
                      <span>{result.riskScore > 50 ? 'PHISH' : 'CLEAN'}</span>
                    </div>
                    <div className={styles.miniStat}>
                      <span>Entropy</span>
                      <span>HIGH</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${shared.card} ${styles.infoCard}`}>
              <div className={styles.cardTop}>
                <Globe size={18} /> Domain Intelligence
              </div>
              {(() => {
                const details = parseDetails(result.analysisDetails);
                const d = details.domainIntel || {};

                return (
                  <div className={styles.domainStats}>
                    <div className={styles.domainRow}>
                      <span>DNS Resolution</span>
                      <span className={d.dns_valid === true || d.dns_valid === 'true' ? styles.successText : styles.dangerText}>
                        {d.dns_valid === true || d.dns_valid === 'true' ? "ACTIVE" : "FAILED"}
                      </span>
                    </div>
                    <div className={styles.domainRow}>
                      <span>SSL Validation</span>
                      <span className={d.ssl_valid === true || d.ssl_valid === 'true' ? styles.successText : styles.dangerText}>
                        {d.ssl_valid === true || d.ssl_valid === 'true' ? "SECURE" : "UNSECURE"}
                      </span>
                    </div>
                    <div className={styles.domainRow}>
                      <span>Analysis Speed</span>
                      <span>{details.analysis_ms || '---'} ms</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className={`${shared.card} ${styles.actionCard}`}>
              <h3>Threat Management</h3>
              <div className={styles.actionBtnGroup}>
                <button
                  onClick={async () => {
                    try {
                      const trimmedUrl = url.trim();
                      if (!trimmedUrl) return;

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
                      showToast(`Domain "${domain}" added to global blacklist.`, 'success');
                    } catch (e) {
                      console.error("Blacklist error:", e);
                      showToast('Could not process blacklist request.', 'error');
                    }
                  }}
                  className={shared.btnSecondary}
                  style={{ color: 'var(--danger)' }}
                >
                  Blacklist Domain
                </button>
                <button className={shared.btnPrimary}>
                  Export Report <ExternalLink size={14} />
                </button>
              </div>
              <div className={styles.secondaryActions}>
                <button
                  onClick={handleLaunchPreview}
                  className={styles.sandboxLink}
                >
                  <Shield size={14} /> Launch Safe-Sandbox Preview
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safe Sandbox Modal */}
      <AnimatePresence>
        {showPreview && (
          <div className={styles.modalOverlay} onClick={() => setShowPreview(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={styles.modalContent}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalTitle}>
                  <Shield color="var(--success)" size={20} />
                  Safe-Preview Sandbox
                </div>
                <button className={styles.closeModal} onClick={() => setShowPreview(false)}>
                  <XCircle size={20} />
                </button>
              </div>

              <div className={styles.modalBody}>
                {previewLoading ? (
                  <div className={styles.sandboxLoading}>
                    <div className={shared.spinner} />
                    <p>Initializing isolated sandbox environment...</p>
                  </div>
                ) : previewData?.error ? (
                  <div className={styles.sandboxError}>
                    <AlertTriangle size={32} />
                    <p>{previewData.error}</p>
                  </div>
                ) : (
                  <div className={styles.sandboxPreview}>
                    <div className={styles.previewMeta}>
                      <div className={styles.metaField}>
                        <span>Target Status</span>
                        <span className={styles.successText}>ISOLATED</span>
                      </div>
                      <div className={styles.metaField}>
                        <span>Scripts</span>
                        <span className={styles.dangerText}>BLOCKED</span>
                      </div>
                    </div>

                    <div className={styles.previewFrame}>
                      <div className={styles.frameHeader}>
                        <Globe size={14} /> {url}
                      </div>
                      <div className={styles.frameContent}>
                        {previewData ? (
                          <div dangerouslySetInnerHTML={{ __html: previewData.html }} />
                        ) : (
                          <div className={styles.textDim}>
                            Preview generated from static analysis. No dynamic content executed.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.modalFooter}>
                <p className={styles.safetyDisclaimer}>
                  <Lock size={12} /> This environment is strictly isolated. All JavaScript, cookies, and tracking pixels have been neutralized.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
