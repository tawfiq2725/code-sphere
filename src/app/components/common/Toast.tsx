import { toast } from "react-toastify";
import React from "react";

interface ToastProps {
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const ToastConfirm = ({ message, onConfirm, onCancel }: ToastProps) => {
  const toastId = React.useRef<string | number | null>(null);

  const handleConfirm = () => {
    toast.dismiss(toastId.current!); // Dismiss the current toast
    onConfirm && onConfirm(); // Call the onConfirm callback
  };

  const handleCancel = () => {
    toast.dismiss(toastId.current!); // Dismiss the current toast
    onCancel && onCancel(); // Call the onCancel callback if necessary
  };

  toastId.current = toast.info(
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
    </div>,
    {
      position: "top-center",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    }
  );
};
