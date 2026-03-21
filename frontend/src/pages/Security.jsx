import React from 'react';
import { motion } from 'framer-motion';
import shared from '../styles/Shared.module.css';
import styles from './Legal.module.css';

export default function Security() {
    return (
        <div className={`${shared.container} ${styles.legalContainer}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${shared.card} ${styles.legalCard}`}
            >
                <h1 className={styles.title}>Security</h1>
                <span className={styles.lastUpdated}>Last Updated: March 2026</span>

                <div className={styles.content}>
                    <section className={styles.section}>
                        <h3>1. Infrastructure Security</h3>
                        <p>PhishAI leverages modern cloud infrastructure with isolated environments for AI inference and data processing. All systems are protected by multi-layer firewalls and DDoS mitigation.</p>
                    </section>

                    <section className={styles.section}>
                        <h3>2. Data Protection</h3>
                        <p>Your scan data is encrypted at rest using AES-256 and in transit using TLS 1.3 protocol. We never store raw passwords or sensitive credentials used for authentication.</p>
                    </section>

                    <section className={styles.section}>
                        <h3>3. Vulnerability Management</h3>
                        <p>We conduct regular automated vulnerability scans and manual security audits of our codebase. Our threat intelligence models are constantly updated to detect the latest phishing vectors.</p>
                    </section>

                    <section className={styles.section}>
                        <h3>4. Secure Authentication</h3>
                        <p>PhishAI supports industry-standard OAuth 2.0 and multi-factor authentication to ensure that your account remains protected against unauthorized access.</p>
                    </section>
                </div>
            </motion.div>
        </div>
    );
}
