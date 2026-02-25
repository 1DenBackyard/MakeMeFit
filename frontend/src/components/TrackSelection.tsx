/** Track selection component. */
import { TrackType } from '../api/requests';

interface TrackSelectionProps {
  onSelect: (track: TrackType) => void;
}

export function TrackSelection({ onSelect }: TrackSelectionProps) {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Choose Your Track</h1>
      <p style={styles.subtitle}>Select what you'd like help with</p>
      
      <div style={styles.tracks}>
        <button
          style={styles.trackButton}
          onClick={() => onSelect('supplements')}
        >
          <div style={styles.trackIcon}>💊</div>
          <h2 style={styles.trackTitle}>Supplements</h2>
          <p style={styles.trackDescription}>
            Get personalized supplement recommendations based on your goals
          </p>
        </button>
        
        <button
          style={styles.trackButton}
          onClick={() => onSelect('workouts')}
        >
          <div style={styles.trackIcon}>🏋️</div>
          <h2 style={styles.trackTitle}>Workouts</h2>
          <p style={styles.trackDescription}>
            Get a custom workout plan tailored to your fitness level
          </p>
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '32px',
    textAlign: 'center',
  },
  tracks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  trackButton: {
    border: '2px solid #2481cc',
    borderRadius: '12px',
    padding: '24px',
    background: '#fff',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  trackIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  trackTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  trackDescription: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
  },
};
