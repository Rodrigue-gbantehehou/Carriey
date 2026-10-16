'use client';

import React from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  isLoading = false,
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <div className="w-10 h-10 rounded-full bg-danger-bg text-danger-text flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-10 h-10 rounded-full bg-warning-bg text-warning-text flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      case 'primary':
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-primary-subtle text-primary flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
        );
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'danger';
      case 'warning':
      case 'primary':
      default:
        return 'primary';
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="sm"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={getButtonVariant()}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-4 pt-1">
        {getIcon()}
        <div className="space-y-1.5 flex-1">
          <h3 className="text-ui-base font-semibold text-text-primary leading-tight">
            {title}
          </h3>
          <div className="text-ui-sm text-text-secondary leading-relaxed">
            {description}
          </div>
        </div>
      </div>
    </Dialog>
  );
};
