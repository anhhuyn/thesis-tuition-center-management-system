// Tạo file ModalPortal.tsx
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

interface ModalPortalProps {
  children: ReactNode;
  isOpen: boolean;
}

export const ModalPortal: React.FC<ModalPortalProps> = ({ children, isOpen }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    children,
    document.body
  );
};