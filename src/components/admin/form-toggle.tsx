"use client";

import { useState, type ReactNode } from "react";

export default function FormToggle({
  editing,
  label,
  children,
}: {
  editing: boolean;
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(editing);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-8 rounded-lg bg-stone-100 px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-200"
      >
        + {label}
      </button>
    );
  }

  return <div className="mb-8">{children}</div>;
}
