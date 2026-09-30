import { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa6";

export interface Option {
    value: string;
    label: string;
}

interface SelectProps {
    legend?: string;
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    className?: string;
}

export function Select({
    legend,
    value,
    onChange,
    options,
    placeholder = "Selecione...",
    className = "",
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    // Fecha ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`flex flex-col w-full gap-1.5 font-sans relative`} ref={containerRef}>
            {legend && (
                <label className="text-xs font-semibold text-[#2D2D2D]">{legend}</label>
            )}

            {/* Botão Principal do Select */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`
                    w-full
                    bg-[#FAFAF8]
                    border border-[#E4E4E1]
                    rounded-2xl
                    px-4 py-3.5
                    text-sm text-left
                    flex items-center justify-between
                    hover:border-[#6B7280]/40
                    focus:outline-none
                    focus:border-[#FF7A59]
                    focus:ring-2 focus:ring-[#FF7A59]/20
                    transition-all duration-200 shadow-xs
                    cursor-pointer
                    ${className}
                `}
            >
                <span className={selectedOption ? "text-[#2D2D2D]" : "text-[#6B7280]/60"}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <FaChevronDown
                    className={`w-3.5 h-3.5 text-[#6B7280] transition-transform duration-200 ${isOpen ? "rotate-180 text-[#FF7A59]" : ""
                        }`}
                />
            </button>

            {/* Menu Dropdown Flutuante - Garantido para ocupar 100% da largura do pai */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-[#FAFAF8] border border-[#E4E4E1] rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    {/* Opção para limpar/vazio se necessário */}
                    <button
                        type="button"
                        onClick={() => {
                            onChange("");
                            setIsOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-xs text-[#6B7280] hover:bg-[#F4F4F2] rounded-xl transition cursor-pointer"
                    >
                        {placeholder} (Todos)
                    </button>

                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 text-sm rounded-xl transition cursor-pointer flex items-center justify-between ${value === option.value
                                ? "bg-[#FF7A59]/10 text-[#FF7A59] font-semibold"
                                + " text-[#2D2D2D] hover:bg-[#F4F4F2]"
                                : "text-[#2D2D2D] hover:bg-[#F4F4F2]"
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}