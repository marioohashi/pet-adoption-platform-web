import { useState } from "react";
import type React from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

type Props = React.ComponentProps<"input"> & {
    legend?: string;
};

export function Input({ legend, type = "text", className = "", id, ...rest }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || legend?.toLowerCase().replace(/\s+/g, "-");

    // Verifica se o campo é do tipo senha
    const isPassword = type === "password";

    // Alterna o tipo real do input entre "text" e "password"
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
        <div className="flex flex-col w-full gap-1.5 group">
            {legend && (
                <label
                    htmlFor={inputId}
                    className="text-xs font-semibold uppercase tracking-wider text-gray-300 group-focus-within:text-amber-400 transition-colors"
                >
                    {legend}
                </label>
            )}

            <div className="relative flex items-center w-full">
                <input
                    id={inputId}
                    type={inputType}
                    className={`
                        w-full
                        bg-gray-600/50
                        border border-gray-500/60
                        rounded-lg
                        px-3.5 py-2.5
                        ${isPassword ? "pr-10" : ""} 
                        text-sm text-gray-100
                        placeholder:text-gray-400
                        hover:border-gray-400
                        focus:outline-none
                        focus:border-amber-500
                        focus:ring-2 focus:ring-amber-500/20
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200
                        ${className}
                    `}
                    {...rest}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex={-1} // Evita que o botão intercepte a navegação via tecla TAB
                        className="absolute right-3 text-gray-400 hover:text-gray-200 focus:outline-none p-1 transition-colors cursor-pointer"
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