'use client';

import React, { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, description, children, footer }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </>
  );
}
