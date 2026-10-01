import { FaXmark, FaEnvelope, FaPhone, FaLocationDot, FaCalendar } from "react-icons/fa6";
import { useEscapeKey } from "../hooks/useEscapeKey";
import type { User } from "../types";

interface UserDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

export function UserDetailModal({ isOpen, onClose, user }: UserDetailModalProps) {
    useEscapeKey(onClose, isOpen);

    if (!isOpen || !user) return null;

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sans">
            <div className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative text-[#2D2D2D] flex flex-col max-h-[90vh]">

                <button
                    onClick={onClose}
                    type="button"
                    className="absolute top-5 right-5 z-10 bg-[#F4F4F2] hover:bg-[#E4E4E1] text-[#6B7280] hover:text-[#2D2D2D] p-2.5 rounded-xl transition cursor-pointer"
                >
                    <FaXmark className="w-5 h-5" />
                </button>

                {/* Cabeçalho com Avatar */}
                <div className="p-6 pb-5 border-b border-[#E4E4E1] flex flex-col items-center text-center bg-[#F4F4F2]/50">
                    <div className="relative w-20 h-20 bg-[#F4F4F2] border-2 border-[#E4E4E1] rounded-2xl overflow-hidden shadow-xs mb-3 flex items-center justify-center">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl font-bold text-[#6B7280]">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <h2 className="text-lg font-bold font-['Manrope'] text-[#2D2D2D] tracking-tight">
                        {user.name}
                    </h2>
                    <span className="inline-block mt-1 px-3 py-0.5 bg-[#FF7A59]/10 text-[#FF7A59] text-xs font-semibold rounded-full">
                        {user.role}
                    </span>
                </div>

                {/* Corpo com os dados */}
                <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-[#6B7280] bg-[#F4F4F2] p-3 rounded-2xl">
                            <FaEnvelope className="w-4 h-4 text-[#FF7A59] shrink-0" />
                            <div className="overflow-hidden">
                                <span className="block text-[10px] uppercase font-semibold text-[#6B7280]">E-mail</span>
                                <span className="font-medium text-[#2D2D2D] truncate block">{user.email}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 text-[#6B7280] bg-[#F4F4F2] p-3 rounded-2xl">
                                <FaPhone className="w-4 h-4 text-[#FF7A59] shrink-0" />
                                <div>
                                    <span className="block text-[10px] uppercase font-semibold text-[#6B7280]">Telefone</span>
                                    <span className="font-medium text-[#2D2D2D]">{user.phone || "Não informado"}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-[#6B7280] bg-[#F4F4F2] p-3 rounded-2xl">
                                <FaLocationDot className="w-4 h-4 text-[#FF7A59] shrink-0" />
                                <div>
                                    <span className="block text-[10px] uppercase font-semibold text-[#6B7280]">Localização</span>
                                    <span className="font-medium text-[#2D2D2D]">
                                        {user.city && user.state ? `${user.city}, ${user.state}` : (user.city || user.state || "Não informada")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {user.bio && (
                            <div className="bg-[#F4F4F2] p-3 rounded-2xl space-y-1">
                                <span className="block text-[10px] uppercase font-semibold text-[#6B7280]">Bio / Sobre</span>
                                <p className="text-[#2D2D2D] leading-relaxed whitespace-pre-wrap">{user.bio}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[11px] text-[#6B7280]">
                            <div className="flex items-center gap-2">
                                <FaCalendar className="w-3.5 h-3.5 text-[#FF7A59]" />
                                <span>Criado em: {formatDate(user.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaCalendar className="w-3.5 h-3.5 text-[#FF7A59]" />
                                <span>Atualizado: {formatDate(user.updatedAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rodapé */}
                <div className="p-4 border-t border-[#E4E4E1] bg-[#FAFAF8] flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-[#F4F4F2] hover:bg-[#E4E4E1] text-[#2D2D2D] font-semibold px-5 py-2.5 rounded-2xl transition cursor-pointer text-xs"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}