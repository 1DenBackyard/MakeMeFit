/** Demo answer display component. */
import { DemoResponse } from '../api/requests';

interface DemoAnswerProps {
  demo: DemoResponse;
  onUnlock: () => void;
}

export function DemoAnswer({ demo, onUnlock }: DemoAnswerProps) {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Your Demo Recommendation</h2>
      
      <div style={styles.answerBox}>
        <p style={styles.answer}>{demo.demo_answer}</p>
      </div>

      <div style={styles.paywall}>
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
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  answerBox: {
    background: '#f5f5f5',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '24px',
  },
  answer: {
    fontSize: '16px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    margin: 0,
  },
  paywall: {
    textAlign: 'center',
    padding: '24px',
    background: '#fff3cd',
    borderRadius: '12px',
    border: '2px solid #ffc107',
  },
  paywallText: {
    fontSize: '16px',
    marginBottom: '16px',
    color: '#856404',
  },
  unlockButton: {
    padding: '16px 32px',
    background: '#2481cc',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};
