import React from "react";

interface AppDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const AppDialog: React.FC<AppDialogProps> = ({ open, title, message, onClose, onConfirm, confirmText = "OK", cancelText = "Cancel" }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-md shadow-md max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          {onConfirm && (
            <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={onClose}>
              {cancelText}
            </button>
          )}
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export { AppDialog };
