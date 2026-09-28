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
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-gray-800 border border-gray-700/80 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative text-gray-100 p-6 text-center space-y-4">

                {/* Botão Fechar */}
                <button
                    onClick={onCancel}
                    type="button"
                    className="absolute top-4 right-4 bg-gray-900/60 text-gray-400 hover:text-white p-1.5 rounded-lg transition cursor-pointer"
                >
                    <FaXmark className="w-4 h-4" />
                </button>

                {/* Ícone de Alerta */}
                <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400 shrink-0">
                    <FaTriangleExclamation className="w-6 h-6" />
                </div>

                {/* Conteúdo */}
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{message}</p>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-gray-700 hover:bg-gray-600 text-white transition cursor-pointer"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-red-500/90 hover:bg-red-600 text-white transition cursor-pointer shadow-lg shadow-red-500/20"
                    >
                        {confirmText}
                    </button>
                </div>

            </div>
        </div>
    );
}