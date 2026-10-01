import { useState } from "react";
import type React from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { formatCurrency } from "../utils/formatCurrency"; // Importe sua função

type Props = React.ComponentProps<"input"> & {
    legend?: string;
    isCurrency?: boolean;
};

export function Input({ legend, type = "text", className = "", id, isCurrency, value, onChange, ...rest }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || legend?.toLowerCase().replace(/\s+/g, "-");

    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isCurrency && onChange) {
            const formatted = formatCurrency(e.target.value);
            const updatedEvent = {
                ...e,
                target: {
                    ...e.target,
                    value: formatted,
                },
            };
            onChange(updatedEvent as React.ChangeEvent<HTMLInputElement>);
        } else if (onChange) {
            onChange(e);
        }
    };

    return (
        <div className="flex flex-col w-full gap-1.5 group font-sans">
            {legend && (
                <label
                    htmlFor={inputId}
                    className="text-xs font-semibold text-[#2D2D2D] group-focus-within:text-[#FF7A59] transition-colors"
                >
                    {legend}
                </label>
            )}

            <div className="relative flex items-center w-full">
                <input
                    id={inputId}
                    type={inputType}
                    value={value}
                    onChange={handleChange}
                    className={`
                        w-full
                        bg-[#F4F4F2]
                        border border-[#E4E4E1]
                        rounded-2xl
                        px-4 py-3.5
                        ${isPassword ? "pr-12" : ""} 
                        text-sm text-[#2D2D2D]
                        placeholder:text-[#6B7280]/60
                        hover:border-[#6B7280]/40
                        focus:outline-none
                        focus:border-[#FF7A59]
                        focus:ring-2 focus:ring-[#FF7A59]/20
                        focus:bg-white
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200 shadow-xs
                        ${className}
                    `}
                    {...rest}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex={-1}
                        className="absolute right-4 text-[#6B7280] hover:text-[#2D2D2D] focus:outline-none p-1 transition-colors cursor-pointer"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                        {showPassword ? (
                            <FaEyeSlash className="w-4 h-4" />
                        ) : (
                            <FaEye className="w-4 h-4" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}