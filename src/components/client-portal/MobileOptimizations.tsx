
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const MobileOptimizations: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Handle app installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      setShowInstallBanner(false);
      toast({
        title: "App Installed",
        description: "ISP Portal has been installed on your device",
      });
    });

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          toast({
            title: "Notifications Enabled",
            description: "You'll receive updates about your service",
          });
        }
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [toast]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  // Add viewport meta tag for mobile optimization
  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    }

    // Add theme color meta tag
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (!themeColor) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#2563eb';
      document.head.appendChild(meta);
    }

    // Add mobile web app capable (updated from deprecated apple-mobile-web-app-capable)
    const mobileWebApp = document.querySelector('meta[name="mobile-web-app-capable"]');
    if (!mobileWebApp) {
      const meta = document.createElement('meta');
      meta.name = 'mobile-web-app-capable';
      meta.content = 'yes';
      document.head.appendChild(meta);
    }

    // Add apple mobile web app status bar style
    const appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!appleStatusBar) {
      const meta = document.createElement('meta');
      meta.name = 'apple-mobile-web-app-status-bar-style';
      meta.content = 'default';
      document.head.appendChild(meta);
    }
  }, []);

  if (showInstallBanner) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Install ISP Portal</p>
            <p className="text-sm opacity-90">Get quick access to your account</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowInstallBanner(false)}
              className="px-3 py-1 text-sm bg-blue-700 rounded"
            >
              Later
            </button>
            <button
              onClick={handleInstallClick}
              className="px-3 py-1 text-sm bg-white text-blue-600 rounded"
            >
              Install
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MobileOptimizations;
