// components/Spinner.tsx
import React from "react";

const Spinner: React.FC = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
    <div className="h-10 w-10 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
  </div>
);

export { Spinner };
