import { RefObject, useEffect } from 'react';

export const useClickInside = (ref: RefObject<HTMLElement>, callback: Function) => {
  const handleClick = (e: React.MouseEvent<HTMLElement> | MouseEvent) => {
    if (ref.current && ref.current.contains(e.target as HTMLElement)) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    }
  }, []);
};