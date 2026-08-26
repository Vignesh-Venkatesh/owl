import type { ReactNode } from "react";

interface KbdProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "min-w-[1.25rem] h-6 px-1.5 text-xs",
  md: "min-w-[1.75rem] h-7 px-2 text-sm",
  lg: "min-w-[2rem] h-8 px-2.5 text-base",
};

function Kbd({ children, size = "md", className = "" }: KbdProps) {
  return (
    <kbd
      className={[
        "inline-flex items-center justify-center",
        "font-mono font-medium leading-none",
        "rounded-md border border-border",
        "bg-surface-2",
        "text-text-dim",
        "select-none",
        sizes[size],
        className,
      ].join(" ")}
    >
      {children}
    </kbd>
  );
}

export default Kbd;
