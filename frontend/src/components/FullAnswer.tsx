import React from 'react';
import { theme } from '../styles/theme';

interface FullAnswerProps {
  answer: { full_answer: string; pdf_url?: string };
  onTrainerReferral: () => void;
}

export function FullAnswer({ answer, onTrainerReferral }: FullAnswerProps) {
  const handleDownloadPDF = () => {
    if (answer.pdf_url) {
      window.open(answer.pdf_url, '_blank');
    }
  };

  // Convert markdown-like formatting to HTML
  const formatAnswer = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('# ')) {
          return `<h3 style="margin-top: 24px; margin-bottom: 12px; font-size: 20px; font-weight: 600;">${line.slice(2)}</h3>`;
        }
        if (line.startsWith('## ')) {
          return `<h4 style="margin-top: 16px; margin-bottom: 8px; font-size: 18px; font-weight: 600;">${line.slice(3)}</h4>`;
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return `<li style="margin-left: 20px; margin-bottom: 8px;">${line.slice(2)}</li>`;
        }
        if (line.trim() === '') {
          return '<br>';
        }
        return `<p style="margin-bottom: 12px;">${line}</p>`;
      })
      .join('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Your Complete Plan</h2>
        <p style={styles.subtitle}>Your personalized recommendations</p>
      </div>
      
      <div style={styles.answerBox}>
        <div 
          style={styles.answer} 
          dangerouslySetInnerHTML={{ __html: formatAnswer(answer.full_answer) }} 
        />
      </div>

      {answer.pdf_url && (
        <button style={styles.pdfButton} onClick={handleDownloadPDF}>
          📄 Download PDF
        </button>
      )}

      <div style={styles.referralSection}>
        <div style={styles.referralIcon}>👨‍🏫</div>
        <h3 style={styles.referralTitle}>Want Personalized Guidance?</h3>
        <p style={styles.referralText}>
          Connect with a certified trainer who can provide personalized coaching
        </p>
        <button style={styles.referralButton} onClick={onTrainerReferral}>
          Find a Trainer
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
    color: theme.colors.text,
  },
  pdfButton: {
    width: '100%',
    padding: theme.spacing.md,
    background: theme.colors.success,
    color: '#ffffff',
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    marginBottom: theme.spacing.lg,
    transition: theme.transitions.normal,
    boxShadow: theme.shadows.sm,
  },
  referralSection: {
    textAlign: 'center',
    padding: theme.spacing.xl,
    background: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.lg,
    border: `2px solid ${theme.colors.primary}`,
  },
  referralIcon: {
    fontSize: '32px',
    marginBottom: theme.spacing.sm,
  },
  referralTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  referralText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: theme.typography.lineHeight.relaxed,
  },
  referralButton: {
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
    boxShadow: theme.shadows.sm,
  },
};
