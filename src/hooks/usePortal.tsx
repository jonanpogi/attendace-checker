import { createPortal } from 'react-dom';
import useHasMounted from './useHasMounted';

export const usePortal = (children: React.ReactNode) => {
  const hasMounted = useHasMounted();
  return hasMounted ? createPortal(children, document.body) : null;
};
