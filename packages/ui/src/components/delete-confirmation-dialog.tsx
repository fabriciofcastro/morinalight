"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "../lib/cn";
import { Button } from "./button";
import {
    Modal,
    ModalContent,
    ModalDescription,
    ModalFooter,
    ModalHeader,
    ModalTitle,
} from "./modal";

export interface DeleteConfirmationDialogProps {
  /** Visibility state */
  open: boolean;
  /** Callback for closing/canceling */
  onClose: () => void;
  /** Callback for confirming deletion */
  onConfirm: () => void;
  /** Primary title of the dialog */
  title?: string;
  /** Detailed description or context */
  description?: string;
  /** Name of the item being deleted for specific warning underline */
  itemName?: string;
  /** Whether the confirm operation is in progress */
  isLoading?: boolean;
}

/**
 * DeleteConfirmationDialog - Reusable futuristic HUD-style warning modal
 */
export function DeleteConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirmar Exclusão",
  description,
  itemName,
  isLoading = false,
}: DeleteConfirmationDialogProps) {
  return (
    <Modal open={open} onOpenChange={(val) => !val && onClose()}>
      <ModalContent className="max-w-md bg-zinc-950/90 border-red-500/30 backdrop-blur-2xl p-0 overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.15)]">
        {/* HUD Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          {/* HUD Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
          
          {/* Top scanning line (Danger themed) */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
          
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-500/50" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-500/50" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-500/50" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-500/50" />
        </div>

        {/* Header with Icon */}
        <ModalHeader className="pt-8 px-6 pb-2 border-none">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <ModalTitle className="text-xl font-bold tracking-tight text-white uppercase">
                {title}
              </ModalTitle>
              <div className="h-[2px] w-12 bg-red-600 mt-1" />
            </div>
          </div>
        </ModalHeader>

        {/* Content */}
        <div className="px-6 py-4 relative">
          <ModalDescription className="text-zinc-400 text-sm leading-relaxed">
            {description || (
              <>
                Você está prestes a excluir permanentemente{" "}
                {itemName ? (
                  <span className="text-white font-bold bg-white/5 px-1 rounded mx-0.5 border border-white/10 decoration-red-500 decoration-2 underline-offset-4 underline">
                    {itemName}
                  </span>
                ) : (
                  "este item"
                )}
                . Esta ação não pode ser desfeita.
              </>
            )}
          </ModalDescription>
          
          {/* Aesthetic mini HUD label */}
          <div className="mt-4 flex items-center gap-2 opacity-50">
            <span className="text-[10px] font-mono text-red-500/70 border border-red-500/20 px-1.5 py-0.5 uppercase tracking-tighter">
              Warning::Destructive_Action
            </span>
            <div className="flex-1 h-px bg-red-500/20" />
          </div>
        </div>

        {/* Actions */}
        <ModalFooter className="mt-2 bg-red-500/[0.03] p-6 border-none gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 font-mono uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
          >
            Abortar
          </Button>
          <Button
            variant="ghost"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
               "flex-1 font-mono uppercase tracking-widest bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border-red-600/30 transition-all shadow-[0_0_20px_rgba(220,38,38,0.1)]",
               isLoading && "opacity-80"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Confirmar Exclusão"
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
