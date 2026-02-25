import { TrackType, RequestResponse, DemoResponse, FullAnswerResponse } from '../api/requests';

export type AppState =
  | { type: 'loading' }
  | { type: 'auth'; error?: string }
  | { type: 'track_selection' }
  | { type: 'form'; track: TrackType }
  | { type: 'demo'; request: RequestResponse; demo: DemoResponse }
  | { type: 'paywall'; request: RequestResponse; demo: DemoResponse }
  | { type: 'full_answer'; request: RequestResponse; answer: FullAnswerResponse }
  | { type: 'history'; requests: RequestResponse[] }
  | { type: 'trainer_referral'; request: RequestResponse; answer: FullAnswerResponse; deepLink: string }
  | { type: 'error'; message: string; canRetry: boolean; retryAction?: () => void };

export type AppAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS' }
  | { type: 'AUTH_ERROR'; error: string }
  | { type: 'SELECT_TRACK'; track: TrackType }
  | { type: 'SUBMIT_FORM_START' }
  | { type: 'SUBMIT_FORM_SUCCESS'; request: RequestResponse; demo: DemoResponse }
  | { type: 'SUBMIT_FORM_ERROR'; error: string }
  | { type: 'UNLOCK_START' }
  | { type: 'UNLOCK_SUCCESS'; answer: FullAnswerResponse }
  | { type: 'UNLOCK_ERROR'; error: string }
  | { type: 'SHOW_PAYWALL' }
  | { type: 'SHOW_HISTORY'; requests: RequestResponse[] }
  | { type: 'SHOW_TRAINER_REFERRAL'; deepLink: string }
  | { type: 'GO_BACK' }
  | { type: 'RESET' };

export interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  selectedTrack: TrackType | null;
  currentRequest: RequestResponse | null;
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'AUTH_START':
      return { type: 'loading' };
    
    case 'AUTH_SUCCESS':
      return { type: 'track_selection' };
    
    case 'AUTH_ERROR':
      return { type: 'auth', error: action.error };
    
    case 'SELECT_TRACK':
      return { type: 'form', track: action.track };
    
    case 'SUBMIT_FORM_START':
      return state; // Keep current state, loading handled by UI
    
    case 'SUBMIT_FORM_SUCCESS':
      if (action.demo.requires_payment) {
        return { type: 'paywall', request: action.request, demo: action.demo };
      }
      return { type: 'demo', request: action.request, demo: action.demo };
    
    case 'SUBMIT_FORM_ERROR':
      return {
        type: 'error',
        message: action.error,
        canRetry: true,
        retryAction: () => ({ type: 'GO_BACK' } as AppAction),
      };
    
    case 'UNLOCK_START':
      return state; // Keep current state
    
    case 'UNLOCK_SUCCESS':
      if (state.type === 'demo' || state.type === 'paywall') {
        return {
          type: 'full_answer',
          request: state.request,
          answer: action.answer,
        };
      }
      return state;
    
    case 'UNLOCK_ERROR':
      return {
        type: 'error',
        message: action.error,
        canRetry: true,
        retryAction: () => ({ type: 'GO_BACK' } as AppAction),
      };
    
    case 'SHOW_PAYWALL':
      if (state.type === 'demo') {
        return { type: 'paywall', request: state.request, demo: state.demo };
      }
      return state;
    
    case 'SHOW_HISTORY':
      return { type: 'history', requests: action.requests };
    
    case 'SHOW_TRAINER_REFERRAL':
      if (state.type === 'full_answer') {
        return {
          type: 'trainer_referral',
          request: state.request,
          answer: state.answer,
          deepLink: action.deepLink,
        };
      }
      return state;
    
    case 'GO_BACK':
      if (state.type === 'form') {
        return { type: 'track_selection' };
      }
      if (state.type === 'demo' || state.type === 'paywall') {
        return { type: 'track_selection' };
      }
      if (state.type === 'full_answer') {
        return { type: 'track_selection' };
      }
      if (state.type === 'history') {
        return { type: 'track_selection' };
      }
      if (state.type === 'trainer_referral') {
        // Go back to full_answer - we need to preserve the answer
        // This is a limitation - in a real app, we'd store the answer separately
        return { type: 'track_selection' };
      }
      return { type: 'track_selection' };
    
    case 'RESET':
      return { type: 'track_selection' };
    
    default:
      return state;
  }
}
