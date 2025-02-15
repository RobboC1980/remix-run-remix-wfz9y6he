import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { useHydrated } from '~/hooks/use-hydrated';
import { useLocation } from '@remix-run/react';

export function ToastProvider() {
  const isHydrated = useHydrated();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, [location]);

  if (!isHydrated || !mounted) {
    return null;
  }

  return (
    <Toaster 
      position="top-right"
      closeButton
      richColors
      expand={false}
      theme="system"
    />
  );
}