/** Full answer display component. */
import { FullAnswerResponse } from '../api/requests';

interface FullAnswerProps {
  answer: FullAnswerResponse;
  onTrainerReferral: () => void;
}

export function FullAnswer({ answer, onTrainerReferral }: FullAnswerProps) {
  const handleDownloadPDF = () => {
    if (answer.pdf_url) {
      window.open(answer.pdf_url, '_blank');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Your Complete Plan</h2>
      
      <div style={styles.answerBox}>
        <div style={styles.answer} dangerouslySetInnerHTML={{ __html: answer.full_answer.replace(/\n/g, '<br>') }} />
      </div>

      {answer.pdf_url && (
        <button style={styles.pdfButton} onClick={handleDownloadPDF}>
          📄 Download PDF
        </button>
      )}

      <div style={styles.referralSection}>
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
  },
  pdfButton: {
    width: '100%',
    padding: '16px',
    background: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '24px',
  },
  referralSection: {
    textAlign: 'center',
    padding: '24px',
    background: '#e7f3ff',
    borderRadius: '12px',
    border: '2px solid #2481cc',
  },
  referralTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '12px',
  },
  referralText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
  },
  referralButton: {
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
