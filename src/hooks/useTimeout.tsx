import { useEffect, useRef } from 'react';

export const useTimeout = (callback: VoidFunction, delay: number) => {
  const savedCB = useRef<VoidFunction>();

  useEffect(() => {
    savedCB.current = callback;
  }, [callback]);


  useEffect(() => {
    const tick = () => {
      savedCB.current?.();
    };

    if (delay !== null) {
      const id = setTimeout(tick, delay);

      return () => clearTimeout(id)
    }
  }, [delay]);
};