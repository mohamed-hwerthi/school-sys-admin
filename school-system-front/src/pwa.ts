/**
 * Register the service worker for PWA support.
 * Called once from main.tsx on application load.
 */
export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);
        })
        .catch((error) => {
          console.warn('SW registration failed:', error);
        });
    });
  }
}
