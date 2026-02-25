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
    const initializeTelegram = () => {
      try {
        // Check if we're in Telegram environment
        const isTelegram = typeof window !== 'undefined' && 
          (window as any).Telegram?.WebApp || 
          (window as any).tg?.initDataUnsafe;
        
        if (!isTelegram) {
          console.warn('[Telegram] Not running in Telegram environment');
          // For development: try to get from URL anyway
        }
        
        WebApp.ready();
        setReady(true);
        
        const tgUser = WebApp.initDataUnsafe?.user;
        if (tgUser) {
          setUser(tgUser as TelegramUser);
          console.log('[Telegram] User detected:', tgUser);
        }
        
        // Try multiple ways to get initData
        let initDataValue: string | null = null;
        
        // Method 1: WebApp.initData (standard)
        if (WebApp.initData && WebApp.initData.trim()) {
          initDataValue = WebApp.initData;
          console.log('[Telegram] ✅ initData from WebApp.initData, length:', initDataValue.length);
        }
        // Method 2: WebApp.initDataRaw (alternative)
        else if ((WebApp as any).initDataRaw && (WebApp as any).initDataRaw.trim()) {
          initDataValue = (WebApp as any).initDataRaw;
          console.log('[Telegram] ✅ initData from WebApp.initDataRaw, length:', initDataValue.length);
        }
        // Method 3: From window.Telegram.WebApp.initData (direct access)
        else if ((window as any).Telegram?.WebApp?.initData) {
          initDataValue = (window as any).Telegram.WebApp.initData;
          console.log('[Telegram] ✅ initData from window.Telegram.WebApp.initData, length:', initDataValue.length);
        }
        // Method 4: From URL parameters (tgWebAppData)
        else {
          const urlParams = new URLSearchParams(window.location.search);
          const tgWebAppData = urlParams.get('tgWebAppData') || urlParams.get('_auth');
          if (tgWebAppData) {
            initDataValue = decodeURIComponent(tgWebAppData);
            console.log('[Telegram] ✅ initData from URL parameter, length:', initDataValue.length);
          }
        }
        
        // Method 5: Try to get from window.location.hash (some Telegram versions)
        if (!initDataValue) {
          const hash = window.location.hash;
          if (hash.includes('tgWebAppData=')) {
            const match = hash.match(/tgWebAppData=([^&]+)/);
            if (match) {
              initDataValue = decodeURIComponent(match[1]);
              console.log('[Telegram] ✅ initData from hash, length:', initDataValue.length);
            }
          }
        }
        
        // Method 6: Try to construct from initDataUnsafe (last resort)
        if (!initDataValue && WebApp.initDataUnsafe) {
          try {
            const params = new URLSearchParams();
            if (WebApp.initDataUnsafe.user) {
              params.set('user', JSON.stringify(WebApp.initDataUnsafe.user));
            }
            if (WebApp.initDataUnsafe.auth_date) {
              params.set('auth_date', String(WebApp.initDataUnsafe.auth_date));
            }
            if (WebApp.initDataUnsafe.hash) {
              params.set('hash', WebApp.initDataUnsafe.hash);
            }
            if (WebApp.initDataUnsafe.query_id) {
              params.set('query_id', WebApp.initDataUnsafe.query_id);
            }
            if (params.toString()) {
              initDataValue = params.toString();
              console.log('[Telegram] ⚠️ initData constructed from initDataUnsafe (may not work for auth)');
            }
          } catch (e) {
            // Ignore
          }
        }
        
        setInitData(initDataValue);
        
        if (initDataValue) {
          console.log('[Telegram] ✅ initData available, length:', initDataValue.length);
          console.log('[Telegram] initData preview:', initDataValue.substring(0, 100) + '...');
        } else {
          console.error('[Telegram] ❌ initData is missing!');
          console.error('[Telegram] WebApp object:', {
            initData: WebApp.initData,
            initDataRaw: (WebApp as any).initDataRaw,
            initDataUnsafe: WebApp.initDataUnsafe,
            version: WebApp.version,
            platform: WebApp.platform,
            isExpanded: WebApp.isExpanded,
          });
          console.error('[Telegram] window.Telegram:', (window as any).Telegram);
          console.error('[Telegram] URL:', window.location.href);
          console.error('[Telegram] Make sure:');
          console.error('  1. App is opened from Telegram bot (not browser)');
          console.error('  2. Bot has Web App configured in @BotFather');
          console.error('  3. Web App URL is correct in bot settings');
          console.error('  4. Bot token matches in backend/.env');
        }
        
        // Expand app
        WebApp.expand();
        
        // Set theme (only if supported)
        try {
          WebApp.setHeaderColor('#2481cc');
        } catch (e) {
          // Ignore if not supported
        }
        
        try {
          WebApp.setBackgroundColor('#ffffff');
        } catch (e) {
          // Ignore if not supported
        }
      } catch (err) {
        console.error('[Telegram] Error initializing WebApp:', err);
        setReady(true); // Still set ready to allow error handling
      }
    };
    
    // Wait a bit for Telegram SDK to initialize
    if (typeof window !== 'undefined') {
      if ((window as any).Telegram?.WebApp) {
        initializeTelegram();
      } else {
        // Wait for SDK to load
        const checkInterval = setInterval(() => {
          if ((window as any).Telegram?.WebApp || WebApp.version) {
            clearInterval(checkInterval);
            initializeTelegram();
          }
        }, 100);
        
        // Timeout after 2 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          initializeTelegram();
        }, 2000);
      }
    }
  }, []);

  return {
    ready,
    user,
    initData,
    WebApp,
  };
}
