import React, { useEffect, useReducer, useRef, useCallback } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { authTelegram, authDevMock } from '../api/auth';
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

  // Skip auth completely - go directly to track selection
  useEffect(() => {
    if (!ready) {
      console.log('[App] Waiting for Telegram WebApp to be ready...');
      return;
    }

    // No auth needed - backend will use mock user automatically
    console.log('[App] Skipping authentication, going to track selection');
    dispatch({ type: 'AUTH_SUCCESS' });
  }, [ready]);

  const handleUnlock = useCallback(async () => {
    if (state.type !== 'demo' && state.type !== 'paywall') return;

    try {
      dispatch({ type: 'UNLOCK_START' });
      if (WebApp?.MainButton) {
        WebApp.MainButton.showProgress();
      }

      const request = state.type === 'demo' || state.type === 'paywall' ? state.request : null;
      if (!request) return;

      console.log('[Unlock] Generating full answer for request:', request.id);
      const answer = await generateFullAnswer(request.id);
      console.log('[Unlock] ✅ Full answer generated:', { 
        request_id: answer.request_id,
        has_pdf: !!answer.pdf_url,
      });
      
      if (WebApp?.MainButton) {
        WebApp.MainButton.hideProgress();
      }

      dispatch({ type: 'UNLOCK_SUCCESS', answer });
      setToast({ message: 'Полный план разблокирован!', type: 'success' });
    } catch (err) {
      if (WebApp?.MainButton) {
        WebApp.MainButton.hideProgress();
      }
      console.error('[Unlock] ❌ Failed to unlock:', err);
      let errorMessage = 'Не удалось разблокировать полный план';
      if (err instanceof Error) {
        errorMessage = err.message;
        if (err.message.includes('payment') || err.message.includes('Payment')) {
          errorMessage = 'Требуется оплата для разблокировки полного плана.';
        }
      }
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
        mainButton.setText('Разблокировать полный план');
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
      
      console.log('[Form] Submitting form:', {
        track: state.track,
        normalizedDataKeys: Object.keys(normalizedData),
        normalizedDataPreview: JSON.stringify(normalizedData).substring(0, 200) + '...',
      });

      // Create request
      const requestPayload = {
        track: state.track,
        form_data: normalizedData as Record<string, unknown>,
      };
      
      console.log('[Form] Request payload:', {
        track: requestPayload.track,
        form_data_keys: Object.keys(requestPayload.form_data),
      });
      
      const request = await createRequest(requestPayload);
      console.log('[Form] ✅ Request created:', { id: request.id, status: request.status });
      currentRequestRef.current = request;

      // Get demo answer
      console.log('[Form] Fetching demo for request:', request.id);
      const demo = await getDemo(request.id);
      console.log('[Form] ✅ Demo received:', { 
        request_id: demo.request_id, 
        requires_payment: demo.requires_payment,
        message: demo.message,
      });
      
      if (WebApp?.MainButton) {
        WebApp.MainButton.hideProgress();
      }

      dispatch({ type: 'SUBMIT_FORM_SUCCESS', request, demo });
      setToast({ message: 'Запрос успешно создан!', type: 'success' });
    } catch (err) {
      if (WebApp?.MainButton) {
        WebApp.MainButton.hideProgress();
      }
      
      console.error('[Form] ❌ Form submission failed:', err);
      
      let errorMessage = 'Не удалось создать запрос';
      if (err instanceof Error) {
        errorMessage = err.message;
        // Handle anti-fraud rejection
        if (err.message.includes('rejected') || err.message.includes('anti-fraud')) {
          errorMessage = 'Запрос отклонен системой проверки. Пожалуйста, проверьте заполненные данные.';
        } else if (err.message.includes('demo') && err.message.includes('limit')) {
          errorMessage = 'Вы уже использовали бесплатный демо для этого направления. Разблокируйте полный план.';
        } else if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          errorMessage = 'Ошибка авторизации. Пожалуйста, перезагрузите приложение.';
        }
      }
      
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
            <h2 className="text-2xl font-bold text-error mb-4">Ошибка аутентификации</h2>
            <p className="text-text-secondary mb-6">{state.error || 'Что-то пошло не так'}</p>
            <div className="space-y-3">
              <Button onClick={() => window.location.reload()}>Повторить</Button>
              <div className="text-xs text-text-light mt-4 p-3 bg-surface rounded">
                <p className="font-semibold mb-1">Решение проблем:</p>
                <ul className="text-left space-y-1 list-disc list-inside">
                  <li>Убедитесь, что открыли приложение из Telegram</li>
                  <li>Проверьте, что токен бота настроен правильно</li>
                  <li>Попробуйте закрыть и открыть приложение заново</li>
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
            <h2 className="text-2xl font-bold text-error mb-4">Упс!</h2>
            <p className="text-text-secondary mb-6">{state.message}</p>
            <div className="flex gap-3">
              {state.canRetry && (
                <Button onClick={handleGoBack}>Назад</Button>
              )}
              <Button variant="outline" onClick={() => dispatch({ type: 'RESET' })}>
                Начать заново
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
              ← Назад
            </Button>
            <h1 className="text-lg font-semibold flex-1">
              {state.track === 'supplements' ? 'Добавки' : 'Тренировки'}
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
            <h1 className="text-lg font-semibold flex-1">Демо-план</h1>
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
            <h1 className="text-lg font-semibold flex-1">Ваш план</h1>
            <Button variant="ghost" size="sm" onClick={handleShowHistory}>
              История
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
            <h1 className="text-lg font-semibold flex-1">История</h1>
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
              <h1 className="text-lg font-semibold flex-1">Подбор тренера</h1>
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
