import { FaTriangleExclamation, FaXmark } from "react-icons/fa6";
import { useEscapeKey } from "../hooks/useEscapeKey";

interface ConfirmModalProps {
    isOpen: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    isOpen,
    title = "Descartar alterações?",
    message = "Você possui informações não salvas. Se sair agora, todas as alterações inseridas serão perdidas.",
    confirmText = "Descartar e Sair",
    cancelText = "Continuar Editando",
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    // Tecla Esc fecha o modal de confirmação e volta para a edição
    useEscapeKey(onCancel, isOpen);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sans">
            <div className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative text-[#2D2D2D] p-6 sm:p-7 text-center space-y-4">

                {/* Botão Fechar */}
                <button
                    onClick={onCancel}
                    type="button"
                    className="absolute top-4 right-4 bg-[#F4F4F2] hover:bg-[#E4E4E1] text-[#6B7280] hover:text-[#2D2D2D] p-2 rounded-xl transition cursor-pointer"
                >
                    <FaXmark className="w-4 h-4" />
                </button>

                {/* Ícone de Alerta */}
                <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-amber-600 shrink-0 shadow-xs">
                    <FaTriangleExclamation className="w-6 h-6" />
                </div>

                {/* Conteúdo */}
                <div className="space-y-1.5">
                    <h3 className="text-xl font-bold font-['Manrope'] text-[#2D2D2D] tracking-tight">{title}</h3>
                    <p className="text-xs text-[#6B7280] leading-relaxed max-w-[280px] mx-auto">{message}</p>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full py-3 px-4 rounded-2xl text-xs font-semibold bg-[#F4F4F2] hover:bg-[#E4E4E1] text-[#2D2D2D] transition cursor-pointer border border-[#E4E4E1]"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        className="w-full py-3 px-4 rounded-2xl text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition cursor-pointer shadow-sm"
                    >
                        {confirmText}
                    </button>
                </div>

            </div>
        </div>
    );
}