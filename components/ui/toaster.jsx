import { Toaster as SonnerToaster } from "sonner";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/contexts/AuthContext";

export function Toaster() {
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <SonnerToaster
      theme="light"
      expand={false}
      visibleToasts={4}
      closeButton
      richColors={false}
      position="top-right"
      swipeDirections={[]}
      className="chalito-sonner pointer-events-none z-[2147483647]"
      style={{ zIndex: 2147483647 }}
      offset={isAuthenticated ? "5.5rem" : "1rem"}
      mobileOffset="1rem"
      toastOptions={{
        unstyled: true,
        duration: 3000,
        classNames: {
          toast:
            "chalito-toast-shell pointer-events-auto w-full rounded-2xl border p-0 shadow-[0_20px_45px_-24px_rgba(15,23,42,0.35)] !opacity-100 !backdrop-blur-none sm:max-w-[420px]",
          success: "chalito-toast-shell--success",
          info: "chalito-toast-shell--info",
          error: "chalito-toast-shell--error",
          warning: "chalito-toast-shell--warning",
        },
      }}
    />,
    document.body
  );
}
