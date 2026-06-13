import { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";

export const ErrorToast = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const handle = (e: Event) => {
      const { message: msg } = (e as CustomEvent<{ message: string }>).detail;
      setMessage(msg);
      setVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => setVisible(false), 6000);
    };

    window.addEventListener("omaya:server-error", handle);
    return () => {
      window.removeEventListener("omaya:server-error", handle);
      clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white border border-red-200 shadow-lg rounded-xl px-4 py-3 max-w-md w-full">
      <AlertCircle size={16} className="text-[#DC2626] flex-shrink-0" />
      <span className="text-sm text-gray-700 flex-1">{message}</span>
      <button
        onClick={() => setVisible(false)}
        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
};
