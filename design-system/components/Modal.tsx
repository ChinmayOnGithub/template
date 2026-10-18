/*
 * Modal.tsx
 * Accessible modal dialog overlay wrapper with backdrop and escape dismissal.
 * Composes Radix dialog primitives to guarantee focus trapping and screen reader compliance.
 */

"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./Dialog";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = "md" }) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent size={size}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="p-5 overflow-y-auto flex-1 text-sm text-[var(--foreground)]">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};
