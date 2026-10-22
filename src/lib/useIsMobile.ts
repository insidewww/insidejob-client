import { useSyncExternalStore } from 'react';

// Match Bootstrap's md breakpoint; notify React only when the layout changes.
const desktopQuery = '(min-width: 768px)';
const getSnapshot = () => !window.matchMedia(desktopQuery).matches;
const getServerSnapshot = () => false;
const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(desktopQuery);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
