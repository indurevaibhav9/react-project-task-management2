// DeleteProjectConfirmation.jsx
import React from "react";
import { AlertCircle } from 'lucide-react';

export default function DeleteProjectConfirmation({ isOpen, onClose, onConfirmDelete, projectName }) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (onConfirmDelete) {
        await onConfirmDelete();
      }
      if (onClose) onClose();
    } catch (err) {
      console.error("Delete failed:", err);
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="relative bg-white rounded-lg border-2 border-red-500 shadow-[8px_8px_0_rgba(0,0,0,0.9)] w-full max-w-md"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <h2 className="text-xl font-bold text-red-600">Delete Project</h2>
            <p className="text-sm text-gray-500">This action cannot be undone</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete <span className="font-semibold">"{projectName}"</span>?
          </p>
          <p className="text-sm text-gray-600 mb-6">
            All associated tasks, files, and data will be permanently removed.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              style={{ cursor: isDeleting ? 'not-allowed' : 'pointer' }}
              className="px-4 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
