import React from 'react';
import { DemoResponse } from '../api/requests';
import { theme } from '../styles/theme';

interface DemoAnswerProps {
  demo: DemoResponse;
  onUnlock: () => void;
}

export function DemoAnswer({ demo, onUnlock }: DemoAnswerProps) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Your Demo Recommendation</h2>
        <p style={styles.subtitle}>Preview of your personalized plan</p>
      </div>
      
      <div style={styles.answerBox}>
        <div style={styles.answer}>{demo.demo_answer}</div>
      </div>

      <div style={styles.paywall}>
        <div style={styles.paywallIcon}>🔒</div>
        <p style={styles.paywallText}>{demo.message}</p>
        <button style={styles.unlockButton} onClick={onUnlock}>
          Unlock Full Plan + PDF + History
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    padding: theme.spacing.lg,
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: theme.colors.background,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    margin: 0,
  },
  answerBox: {
    background: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    border: `1px solid ${theme.colors.borderLight}`,
  },
  answer: {
    fontSize: theme.typography.fontSize.base,
    lineHeight: theme.typography.lineHeight.relaxed,
    whiteSpace: 'pre-wrap',
    color: theme.colors.text,
  },
  paywall: {
    textAlign: 'center',
    padding: theme.spacing.xl,
    background: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.lg,
    border: `2px solid ${theme.colors.primary}`,
  },
  paywallIcon: {
    fontSize: '32px',
    marginBottom: theme.spacing.sm,
  },
  paywallText: {
    fontSize: theme.typography.fontSize.base,
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeight.relaxed,
  },
  unlockButton: {
    width: '100%',
    padding: theme.spacing.md,
    background: theme.colors.primary,
    color: '#ffffff',
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: theme.transitions.normal,
    boxShadow: theme.shadows.md,
  },
};
