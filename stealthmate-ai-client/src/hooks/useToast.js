// src/hooks/useToast.js
import { toast } from "react-toastify";

const baseOptions = {
  position: "top-center",
  autoClose: 2500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
  style: {
    borderRadius: "8px",
    fontWeight: "600",
  },
};

export function useToast() {
  const success = (msg, opts = {}) => toast.success(msg, { ...baseOptions, ...opts });
  const error = (msg, opts = {}) => toast.error(msg, { ...baseOptions, ...opts });
  const info = (msg, opts = {}) => toast.info(msg, { ...baseOptions, ...opts });
  const warning = (msg, opts = {}) => toast.warn(msg, { ...baseOptions, ...opts });

  return { success, error, info, warning };
}
