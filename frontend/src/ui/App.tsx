import React, { useEffect, useState } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { authTelegram } from '../api/auth';
import { TrackSelection } from '../components/TrackSelection';
import { SupplementsForm } from '../components/SupplementsForm';
import { WorkoutsForm } from '../components/WorkoutsForm';
import { DemoAnswer } from '../components/DemoAnswer';
import { FullAnswer } from '../components/FullAnswer';
import { createRequest, getDemo, generateFullAnswer, getHistory, RequestResponse, TrackType, FullAnswerResponse } from '../api/requests';
import { theme } from '../styles/theme';

type AppState = 
  | 'loading'
  | 'auth'
  | 'track_selection'
  | 'form'
  | 'demo'
  | 'paywall'
  | 'full_answer'
  | 'history'
  | 'error';

export const App: React.FC = () => {
  const { ready, initData, WebApp } = useTelegram();
  const [state, setState] = useState<AppState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<TrackType | null>(null);
  const [currentRequest, setCurrentRequest] = useState<RequestResponse | null>(null);
  const [demoResponse, setDemoResponse] = useState<any>(null);
  const [fullAnswer, setFullAnswer] = useState<{ full_answer: string; pdf_url?: string } | null>(null);
  const [history, setHistory] = useState<RequestResponse[]>([]);

  // Auth on mount
  useEffect(() => {
    if (!ready || !initData) return;

    const authenticate = async () => {
      try {
        await authTelegram(initData);
        setState('track_selection');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setState('error');
      }
    };

    authenticate();
  }, [ready, initData]);

  const handleTrackSelect = (track: TrackType) => {
    setSelectedTrack(track);
    setState('form');
  };

  const handleFormSubmit = async (formData: Record<string, unknown>) => {
    if (!selectedTrack) return;

    try {
      WebApp.MainButton.showProgress();
      const request = await createRequest({
        track: selectedTrack,
        form_data: formData,
      });
      setCurrentRequest(request);

      // Get demo answer
      const demo = await getDemo(request.id);
      setDemoResponse(demo);
      setState('demo');
      WebApp.MainButton.hideProgress();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create request');
      setState('error');
      WebApp.MainButton.hideProgress();
    }
  };

  const handleUnlock = async () => {
    if (!currentRequest) return;

    try {
      WebApp.MainButton.showProgress();
      const full: FullAnswerResponse = await generateFullAnswer(currentRequest.id);
      setFullAnswer({
        full_answer: full.full_answer,
        pdf_url: full.pdf_url,
      });
      setState('full_answer');
      WebApp.MainButton.hideProgress();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setState('error');
      WebApp.MainButton.hideProgress();
    }
  };

  // Render based on state
  if (state === 'loading') {
    return (
      <div style={styles.container}>
        <div style={styles.loader}>Loading...</div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <h2 style={styles.errorTitle}>Oops!</h2>
          <p style={styles.errorText}>{error || 'Something went wrong'}</p>
          <button style={styles.button} onClick={() => setState('track_selection')}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (state === 'track_selection') {
    return (
      <div style={styles.app}>
        <TrackSelection onSelect={handleTrackSelect} />
      </div>
    );
  }

  if (state === 'form') {
    return (
      <div style={styles.app}>
        {selectedTrack === 'supplements' ? (
          <SupplementsForm onSubmit={handleFormSubmit} />
        ) : (
          <WorkoutsForm onSubmit={handleFormSubmit} />
        )}
      </div>
    );
  }

  if (state === 'demo' && demoResponse) {
    return (
      <div style={styles.app}>
        <DemoAnswer demo={demoResponse} onUnlock={handleUnlock} />
      </div>
    );
  }

  if (state === 'full_answer' && fullAnswer) {
    return (
      <div style={styles.app}>
        <FullAnswer 
          answer={fullAnswer} 
          onTrainerReferral={() => {
            // TODO: Implement trainer referral
            WebApp.showAlert('Trainer referral coming soon!');
          }}
        />
      </div>
    );
  }

  return null;
};

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: '100vh',
    backgroundColor: theme.colors.background,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.text,
  },
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    fontFamily: theme.typography.fontFamily,
  },
  loader: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
  },
  errorBox: {
    textAlign: 'center',
    maxWidth: '400px',
    padding: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.md,
    color: theme.colors.error,
  },
  errorText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: theme.typography.lineHeight.relaxed,
  },
  button: {
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    backgroundColor: theme.colors.primary,
    color: '#ffffff',
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: theme.transitions.normal,
  },
};
