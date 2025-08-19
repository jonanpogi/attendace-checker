'use client';

import { usePortal } from '@/hooks/usePortal';
import CloseButton from '../CloseButton';
import { ReactNode } from 'react';
import ButtonPrimary from '../ButtonPrimary';

type Props = {
  isOpen: boolean;
  title: string | ReactNode;
  description?: string;
  confirmText?: string;
  onConfirm?: () => void;
  onClose: () => void;
};

const Dialog = ({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  onConfirm,
  onClose,
}: Props) => {
  const portal = usePortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-lg bg-slate-900 p-6 shadow-lg transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton onClose={() => onClose()} />
        {typeof title === 'string' ? (
          <h3 className="mb-2 text-lg font-semibold text-gray-50">{title}</h3>
        ) : (
          title
        )}
        {description && (
          <p className="mb-4 text-sm text-gray-400">{description}</p>
        )}
        {confirmText && (
          <div className="flex justify-end gap-2">
            <ButtonPrimary
              onClick={() => {
                onConfirm?.();
                onClose();
              }}
            >
              {confirmText}
            </ButtonPrimary>
          </div>
        )}
      </div>
    </div>,
  );
  if (!isOpen) return null;

  return portal;
};

export default Dialog;
