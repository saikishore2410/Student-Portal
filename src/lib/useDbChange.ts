import { useState, useEffect } from 'react';

/**
 * A custom hook that listens to the centralized real-time Firestore database synchronization event,
 * triggering a component re-render so that local-state reads stay synchronized with server snapshots.
 */
export function useDbChange(): number {
  const [tick, setTick] = useState<number>(0);

  useEffect(() => {
    const handleUpdate = () => {
      setTick(prev => prev + 1);
    };

    window.addEventListener('edtech_db_update', handleUpdate);
    return () => {
      window.removeEventListener('edtech_db_update', handleUpdate);
    };
  }, []);

  return tick;
}
