import React, { useEffect, useReducer, useRef, useCallback } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { authTelegram } from '../api/auth';
import { createRequest, getDemo, generateFullAnswer, getHistory, RequestResponse } from '../api/requests';
import { matchTrainer, createLead } from '../api/trainers';
import { appReducer, AppState, AppAction } from '../state/appState';
import { normalizeFormData } from '../utils/formData';
import { TrackSelection } from '../components/TrackSelection';
import { SupplementsForm } from '../components/SupplementsForm';
import { WorkoutsForm } from '../components/WorkoutsForm';
import { DemoAnswer } from '../components/DemoAnswer';
import { FullAnswer } from '../components/FullAnswer';
import { HistoryScreen } from '../components/HistoryScreen';
import { TrainerReferral } from '../components/TrainerReferral';
import { Screen } from '../components/ui/Screen';
import { Loader } from '../components/ui/Loader';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';

const initialState: AppState = { type: 'loading' };

export default function App() {
  const { ready, initData, WebApp } = useTelegram();
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const currentRequestRef = useRef<RequestResponse | null>(null);

  // Auth on mount
  useEffect(() => {
    if (!ready) {
      console.log('[Auth] Waiting for Telegram WebApp to be ready...');
      return;
    }

    if (!initData) {
      console.error('[Auth] initData is missing!');
      const errorMessage = 'Telegram authentication data is missing. Please open this app from Telegram.';
      dispatch({ type: 'AUTH_ERROR', error: errorMessage });
      setToast({ message: errorMessage, type: 'error' });
      return;
    }

    const authenticate = async () => {
      try {
        console.log('[Auth] Starting authentication...');
        dispatch({ type: 'AUTH_START' });
        
        const response = await authTelegram(initData);
        console.log('[Auth] Authentication successful', response);
        
        dispatch({ type: 'AUTH_SUCCESS' });
      } catch (err) {
        console.error('[Auth] Authentication failed:', err);
        
        let errorMessage = 'Authentication failed';
        if (err instanceof Error) {
          errorMessage = err.message;
          // Try to extract more details from error
          if (err.message.includes('401') || err.message.includes('Invalid')) {
            errorMessage = 'Invalid Telegram authentication. Please check bot token configuration.';
          } else if (err.message.includes('Network') || err.message.includes('fetch')) {
            errorMessage = 'Cannot connect to server. Please check your connection.';
          }
        }
        
        dispatch({ type: 'AUTH_ERROR', error: errorMessage });
        setToast({ message: errorMessage, type: 'error' });
      }
    };

    authenticate();
  }, [ready, initData]);

  const handleUnlock = useCallback(async () => {
    if (state.type !== 'demo' && state.type !== 'paywall') return;

    try {
      dispatch({ type: 'UNLOCK_START' });
      if (WebApp?.MainButton) {
        WebApp.MainButton.showProgress();
      }

      const request = state.type === 'demo' || state.type === 'paywall' ? state.request : null;
      if (!request) return;

      const answer = await generateFullAnswer(request.id);
      
      if (WebApp?.MainButton) {
        WebApp.MainButton.hideProgress();
      }

      dispatch({ type: 'UNLOCK_SUCCESS', answer });
      setToast({ message: 'Full plan unlocked!', type: 'success' });
    } catch (err) {
      if (WebApp?.MainButton) {
        WebApp.MainButton.hideProgress();
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to unlock full plan';
      dispatch({ type: 'UNLOCK_ERROR', error: errorMessage });
      setToast({ message: errorMessage, type: 'error' });
    }
  }, [state, WebApp]);

  // Configure Telegram MainButton based on state
  useEffect(() => {
    if (!WebApp?.MainButton) return;

    const mainButton = WebApp.MainButton;
    
    // Create stable handler
    const unlockHandler = () => {
      handleUnlock();
    };
    
    switch (state.type) {
      case 'form':
        // Form submission is handled by form's submit button
        mainButton.hide();
        break;
      case 'demo':
      case 'paywall':
        mainButton.setText('Unlock Full Plan');
        mainButton.show();
        mainButton.onClick(unlockHandler);
        break;
      default:
        mainButton.hide();
    }
    
    return () => {
      mainButton.offClick(unlockHandler);
    };
  }, [state.type, WebApp, handleUnlock]);

  const handleTrackSelect = (track: 'supplements' | 'workouts') => {
    dispatch({ type: 'SELECT_TRACK', track });
  };

  const handleFormSubmit = async (formData: Record<string, unknown>) => {
    if (state.type !== 'form') return;

    try {
      dispatch({ type: 'SUBMIT_FORM_START' });
      if (WebApp?.MainButton) {
        WebApp.MainButton.showProgress();
      }

      // Normalize form data
      const normalizedData = normalizeFormData(state.track, formData);

      // Create request
      const request = await createRequest({
        track: state.track,
        form_data: normalizedData as Record<string, unknown>,
      });
      currentRequestRef.current = request;

      // Get demo answer
      const demo = await getDemo(request.id);
      
      if (WebApp?.MainButton) {
        WebApp.MainButton.hideProgress();
      }

      dispatch({ type: 'SUBMIT_FORM_SUCCESS', request, demo });
    } catch (err) {
      if (WebApp?.MainButton) {
        WebApp.MainButton.hideProgress();
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to create request';
      dispatch({ type: 'SUBMIT_FORM_ERROR', error: errorMessage });
      setToast({ message: errorMessage, type: 'error' });
    }
  };


  const handleShowHistory = async () => {
    try {
      const requests = await getHistory();
      dispatch({ type: 'SHOW_HISTORY', requests });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load history';
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleTrainerReferral = async () => {
    if (state.type !== 'full_answer') return;

    try {
      const request = state.request;
      
      // Match trainer
      const trainer = await matchTrainer(request.id);
      
      // Create lead
      const lead = await createLead({
        trainer_id: trainer.id,
        request_id: request.id,
      });
      
      if (state.type === 'full_answer') {
        dispatch({ type: 'SHOW_TRAINER_REFERRAL', deepLink: lead.deep_link });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to find trainer';
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleGoBack = () => {
    dispatch({ type: 'GO_BACK' });
  };

  // Render based on state
  if (state.type === 'loading') {
    return (
      <Screen>
        <div className="flex items-center justify-center min-h-screen">
          <Loader size="lg" />
        </div>
      </Screen>
    );
  }

  if (state.type === 'auth') {
    return (
      <Screen>
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-error mb-4">Authentication Failed</h2>
            <p className="text-text-secondary mb-6">{state.error || 'Something went wrong'}</p>
            <div className="space-y-3">
              <Button onClick={() => window.location.reload()}>Retry</Button>
              <div className="text-xs text-text-light mt-4 p-3 bg-surface rounded">
                <p className="font-semibold mb-1">Troubleshooting:</p>
                <ul className="text-left space-y-1 list-disc list-inside">
                  <li>Make sure you opened this app from Telegram</li>
                  <li>Check that bot token is configured correctly</li>
                  <li>Try closing and reopening the app</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Screen>
    );
  }

  if (state.type === 'error') {
    return (
      <Screen>
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-error mb-4">Oops!</h2>
            <p className="text-text-secondary mb-6">{state.message}</p>
            <div className="flex gap-3">
              {state.canRetry && (
                <Button onClick={handleGoBack}>Go Back</Button>
              )}
              <Button variant="outline" onClick={() => dispatch({ type: 'RESET' })}>
                Start Over
              </Button>
            </div>
          </div>
        </div>
      </Screen>
    );
  }

  if (state.type === 'track_selection') {
    return (
      <Screen>
        <TrackSelection onSelect={handleTrackSelect} />
      </Screen>
    );
  }

  if (state.type === 'form') {
    return (
      <Screen
        header={
          <div className="px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleGoBack}>
              ← Back
            </Button>
            <h1 className="text-lg font-semibold flex-1">
              {state.track === 'supplements' ? 'Supplements' : 'Workouts'}
            </h1>
          </div>
        }
      >
        {state.track === 'supplements' ? (
          <SupplementsForm onSubmit={handleFormSubmit} />
        ) : (
          <WorkoutsForm onSubmit={handleFormSubmit} />
        )}
      </Screen>
    );
  }

  if (state.type === 'demo' || state.type === 'paywall') {
    return (
      <Screen
        header={
          <div className="px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleGoBack}>
              ← Back
            </Button>
            <h1 className="text-lg font-semibold flex-1">Demo Plan</h1>
          </div>
        }
      >
        <DemoAnswer
          demo={state.demo}
          onUnlock={handleUnlock}
          requiresPayment={state.type === 'paywall'}
        />
      </Screen>
    );
  }

  if (state.type === 'full_answer') {
    return (
      <Screen
        header={
          <div className="px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleGoBack}>
              ← Back
            </Button>
            <h1 className="text-lg font-semibold flex-1">Your Plan</h1>
            <Button variant="ghost" size="sm" onClick={handleShowHistory}>
              History
            </Button>
          </div>
        }
      >
        <FullAnswer
          answer={state.answer}
          onTrainerReferral={handleTrainerReferral}
        />
      </Screen>
    );
  }

  if (state.type === 'history') {
    return (
      <Screen
        header={
          <div className="px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleGoBack}>
              ← Back
            </Button>
            <h1 className="text-lg font-semibold flex-1">History</h1>
          </div>
        }
      >
        <HistoryScreen requests={state.requests} />
      </Screen>
    );
  }

  if (state.type === 'trainer_referral') {
    return (
      <>
        <Screen
          header={
            <div className="px-4 py-3 flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleGoBack}>
                ← Back
              </Button>
              <h1 className="text-lg font-semibold flex-1">Trainer Match</h1>
            </div>
          }
        >
          <TrainerReferral deepLink={state.deepLink} />
        </Screen>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </>
    );
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
