// src/hooks/useVersionCheck.ts
import { useEffect, useRef } from "react";

export function useVersionCheck() {
  const current = useRef<string | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/version.json?cachebust=" + Date.now(), {
          cache: "no-store",
        });
        const { version } = await res.json();
        if (!current.current) {
          current.current = version;
        } else if (version !== current.current) {
          if (confirm("New version available. Reload now?")) {
            window.location.reload();
          }
        }
      } catch (err) {
        // Version check failed
      }
    };

    // check immediately + every 60s
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, []);
}
