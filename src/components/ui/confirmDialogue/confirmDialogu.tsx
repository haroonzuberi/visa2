"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  triggerText?: string;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export default function ConfirmDialog({
  title = "Are you sure?",
  description = "This action cannot be undone.",
  onConfirm,
  onCancel,
  triggerText = "Delete",
  isOpen,
  setIsOpen,
}: ConfirmDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const openState = isOpen ?? internalOpen;
  const setOpenState = setIsOpen ?? setInternalOpen;

  return (
    <>
  

      <AlertDialog open={openState} onOpenChange={setOpenState}>
        <AlertDialogContent className="bg-white rounded-lg shadow-lg p-6 max-w-md">
          <AlertDialogHeader className="text-center">
            <AlertDialogTitle className="text-lg font-semibold text-gray-800 font-jakarta">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 mt-2 font-jakarta">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end space-x-3 mt-4 ">
            <AlertDialogCancel
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition font-jakarta"
              onClick={() => {
                setOpenState(false);
                onCancel?.();
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-jakarta"
              onClick={() => {
                onConfirm();
                setOpenState(false);
              }}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
