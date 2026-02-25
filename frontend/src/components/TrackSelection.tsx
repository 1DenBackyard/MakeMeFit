import React from 'react';
import { TrackType } from '../api/requests';
import { theme } from '../styles/theme';

interface TrackSelectionProps {
  onSelect: (track: TrackType) => void;
}

export function TrackSelection({ onSelect }: TrackSelectionProps) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>MakeMeFit</h1>
        <p style={styles.subtitle}>Choose your path to better health</p>
      </div>
      
      <div style={styles.tracks}>
        <button
          style={styles.trackButton}
          onClick={() => onSelect('supplements')}
        >
          <div style={styles.icon}>💊</div>
          <h2 style={styles.trackTitle}>Supplements</h2>
          <p style={styles.trackDescription}>
            Personalized supplement recommendations
          </p>
        </button>
        
        <button
          style={styles.trackButton}
          onClick={() => onSelect('workouts')}
        >
          <div style={styles.icon}>🏋️</div>
          <h2 style={styles.trackTitle}>Workouts</h2>
          <p style={styles.trackDescription}>
            Custom workout plans tailored to you
          </p>
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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  header: {
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
    margin: 0,
  },
  tracks: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
  },
  trackButton: {
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    background: theme.colors.background,
    cursor: 'pointer',
    textAlign: 'left',
    transition: theme.transitions.normal,
    boxShadow: theme.shadows.sm,
  },
  icon: {
    fontSize: '48px',
    marginBottom: theme.spacing.md,
    lineHeight: 1,
  },
  trackTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  trackDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    margin: 0,
    lineHeight: theme.typography.lineHeight.relaxed,
  },
};
