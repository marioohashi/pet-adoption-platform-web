import type React from "react";
import { classMerge } from "../utils/classMerge";

type Props = React.ComponentProps<"button"> & {
  isLoading?: boolean;
  variant?: "base" | "icon" | "iconSmall";
};

const variants = {
  button: {
    base: "h-12 px-6 rounded-2xl text-sm font-semibold",
    icon: "h-12 w-12 rounded-2xl",
    iconSmall: "h-9 w-9 rounded-xl",
  },
};

export function Button({
  children,
  isLoading,
  className,
  type = "button",
  variant = "base",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      disabled={isLoading}
      className={classMerge([
        "flex items-center justify-center bg-[#FF7A59] hover:bg-[#e0694a] text-white cursor-pointer transition ease-linear disabled:opacity-50 shadow-sm font-sans",
        variants.button[variant],
        isLoading && "cursor-progress",
        className,
      ])}
      {...rest}
    >
      {children}
    </button>
  );
}