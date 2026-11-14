
import { useEffect, useState } from "react";

export default function Toast({ message, type = "success" }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) {
    return null;
  }

  const styles = {
    success: "border-green-200 bg-green-50 text-green-800",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
  };

  const icons = {
    success: "✓",
    error: "!",
    info: "i",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed right-5 top-5 z-50 flex max-w-sm items-center gap-3 rounded-xl border px-5 py-4 shadow-lg ${styles[type] || styles.success}`}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white font-bold">
        {icons[type] || icons.success}
      </span>

      <p className="flex-1 text-sm font-medium">
        {message}
      </p>

      <button
        type="button"
        onClick={() => setVisible(false)}
        className="font-bold opacity-60 hover:opacity-100"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}
