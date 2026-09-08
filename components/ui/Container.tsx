import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1420px] px-[var(--page-pad)] ${className}`}>
      {children}
    </div>
  );
}
