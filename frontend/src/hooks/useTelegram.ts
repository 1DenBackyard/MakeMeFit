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
    WebApp.ready();
    setReady(true);
    
    const tgUser = WebApp.initDataUnsafe?.user;
    if (tgUser) {
      setUser(tgUser as TelegramUser);
    }
    
    setInitData(WebApp.initData || null);
    
    // Expand app
    WebApp.expand();
    
    // Set theme
    WebApp.setHeaderColor('#2481cc');
    WebApp.setBackgroundColor('#ffffff');
  }, []);

  return {
    ready,
    user,
    initData,
    WebApp,
  };
}
