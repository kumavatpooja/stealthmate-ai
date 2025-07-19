import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function useToast() {
  const success = (msg) =>
    toast.success(msg, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      pauseOnHover: true,
      draggable: true,
    });

  const error = (msg) =>
    toast.error(msg, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      pauseOnHover: true,
      draggable: true,
    });

  return { success, error };
}
