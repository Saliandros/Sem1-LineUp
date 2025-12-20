import React from "react";

// A lightweight version inspired by shadcn/ui Progress
// Props: value: number (0-100), className?: string
export function Progress({ value = 0, className = "" }) {
  const safe = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(safe)}
      className={`relative h-1 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}
    >
      <div
        className="h-full w-full flex-1 bg-primary-yellow transition-transform duration-300"
        style={{ transform: `translateX(-${100 - safe}%)` }}
      />
    </div>
  );
}
