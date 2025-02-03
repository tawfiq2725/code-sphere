import { toast } from "react-toastify";
import React from "react";

interface ToastProps {
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const ToastConfirm = ({ message, onConfirm, onCancel }: ToastProps) => {
  const handleConfirm = () => {
    toast.dismiss(); // Dismiss the toast
    onConfirm && onConfirm();
  };

  const handleCancel = () => {
    toast.dismiss();
    onCancel && onCancel();
  };

  return (
    <div>
      <p>{message}</p>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <button
          onClick={handleConfirm}
          style={{
            backgroundColor: "green",
            color: "white",
            border: "none",
            padding: "5px 10px",
            cursor: "pointer",
            borderRadius: "5px",
          }}
        >
          Confirm
        </button>
        <button
          onClick={handleCancel}
          style={{
            backgroundColor: "red",
            color: "white",
            border: "none",
            padding: "5px 10px",
            cursor: "pointer",
            borderRadius: "5px",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
