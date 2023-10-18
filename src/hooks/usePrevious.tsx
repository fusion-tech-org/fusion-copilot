import { useRef, useEffect } from 'react';

export const usePrevious = (value: unknown) => {
  const ref = useRef<unknown>();

  useEffect(() => {
    ref.current = value;
  }, []);

  return ref.current;
};