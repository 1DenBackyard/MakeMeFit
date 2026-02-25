/** Telegram WebApp SDK hook. */
import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export function useTelegram() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [initData, setInitData] = useState<string | null>(null);

  useEffect(() => {
    try {
      WebApp.ready();
      setReady(true);
      
      const tgUser = WebApp.initDataUnsafe?.user;
      if (tgUser) {
        setUser(tgUser as TelegramUser);
        console.log('[Telegram] User detected:', tgUser);
      }
      
      const initDataValue = WebApp.initData || null;
      setInitData(initDataValue);
      
      if (initDataValue) {
        console.log('[Telegram] initData available, length:', initDataValue.length);
      } else {
        console.warn('[Telegram] initData is missing! This may cause authentication to fail.');
        console.warn('[Telegram] Make sure the app is opened from Telegram, not directly in browser.');
      }
      
      // Expand app
      WebApp.expand();
      
      // Set theme
      WebApp.setHeaderColor('#2481cc');
      WebApp.setBackgroundColor('#ffffff');
    } catch (err) {
      console.error('[Telegram] Error initializing WebApp:', err);
      setReady(true); // Still set ready to allow error handling
    }
  }, []);

  return {
    ready,
    user,
    initData,
    WebApp,
  };
}
