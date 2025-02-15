import { useEffect, useState } from 'react';

export function useHydrated() {
  const [isHydrated, setIsHydrated] = useState<boolean>(() => {
    // Return true if we're in the browser and not in SSR
    return typeof window !== 'undefined';
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}