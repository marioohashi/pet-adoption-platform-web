import { useState } from "react";
import { FaXmark, FaLocationDot, FaCalendarDay, FaWhatsapp, FaChevronLeft, FaChevronRight, FaPaw, FaExpand } from "react-icons/fa6";
import { formatAge } from "../utils/formatAge";
import { PET_TYPES } from "../utils/petEnums";
import type { Pet } from "../types";

interface PetDetailModalProps {
    pet: Pet | null;
    isOpen: boolean;
    onClose: () => void;
}

export function PetDetailModal({ pet, isOpen, onClose }: PetDetailModalProps) {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);

    if (!isOpen || !pet) return null;

    // Normaliza todas as fotos possíveis do pet em um array único
    const photos =
        pet.photos && pet.photos.length > 0 ? pet.photos :
            pet.photo ? [pet.photo] : [];

    const hasMultiplePhotos = photos.length > 1;

    const isOccurrence = pet.type === "lost" || pet.type === "found" || Boolean(pet.date || pet.city);
    const formattedAge = pet.age ? formatAge(pet.age) : null;
    const cleanPhone = (pet.phone || "").replace(/\D/g, "");

    const whatsappMessage = encodeURIComponent(
        `Olá ${pet.contactName || "Tutor"}, vi a ocorrência sobre o pet "${pet.name || "Pet"}" e gostaria de ajudar/obter mais informações.`
    );
    const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${whatsappMessage}` : "#";

    const badgeColor =
        pet.type === 'lost' ? 'bg-red-600 text-white' :
            pet.type === 'found' ? 'bg-amber-600 text-white' :
                'bg-[#FF7A59] text-white';

    const typeLabel =
        pet.type === 'lost' ? 'Perdido' :
            pet.type === 'found' ? 'Achado' :
                (PET_TYPES[pet.type as keyof typeof PET_TYPES] || "Adoção");

    function handlePrevPhoto(e: React.MouseEvent) {
        e.stopPropagation();
        setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
    }

    function handleNextPhoto(e: React.MouseEvent) {
        e.stopPropagation();
        setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-fadeIn">
            <div
                className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Botão de Fechar Principal */}
                <button
                    onClick={onClose}
                    type="button"
                    className="absolute top-4 right-4 z-30 bg-[#2D2D2D]/60 hover:bg-[#2D2D2D]/80 text-white p-2.5 rounded-full transition cursor-pointer backdrop-blur-sm shadow-md"
                    title="Fechar"
                >
                    <FaXmark className="w-4 h-4" />
                </button>

                {/* Seção da Imagem / Galeria */}
                <div className="relative w-full aspect-[4/3] sm:h-80 bg-[#F4F4F2] overflow-hidden shrink-0 group">
                    {photos.length > 0 ? (
                        <div
                            className="relative w-full h-full cursor-zoom-in"
                            onClick={() => setIsFullScreen(true)}
                        >
                            <img
                                src={photos[currentPhotoIndex]}
                                alt={pet.name || "Pet"}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            />
                            {/* Dica visual ao passar o mouse para ampliar */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md">
                                    <FaExpand className="w-3.5 h-3.5" /> Clique para ampliar
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <FaPaw className="w-16 h-16 text-[#E4E4E1]" />
                        </div>
                    )}

                    {/* Setas de Navegação (se houver mais de uma foto) */}
                    {hasMultiplePhotos && (
                        <>
                            <button
                                type="button"
                                onClick={handlePrevPhoto}
                                className="absolute left-3 top-1/2 -translate-y-1/2 bg-[#2D2D2D]/60 hover:bg-[#2D2D2D]/80 text-white p-2.5 rounded-full transition z-20 cursor-pointer backdrop-blur-sm shadow-md"
                                title="Foto anterior"
                            >
                                <FaChevronLeft className="w-4 h-4" />
                            </button>

                            <button
                                type="button"
                                onClick={handleNextPhoto}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#2D2D2D]/60 hover:bg-[#2D2D2D]/80 text-white p-2.5 rounded-full transition z-20 cursor-pointer backdrop-blur-sm shadow-md"
                                title="Próxima foto"
                            >
                                <FaChevronRight className="w-4 h-4" />
                            </button>
                        </>
                    )}

                    {/* Badge de Tipo e Recompensa */}
                    <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 pointer-events-none">
                        <span className={`text-xs px-3.5 py-1.5 rounded-full font-bold shadow-xs ${badgeColor}`}>
                            {typeLabel}
                        </span>

                        {pet.reward && (
                            <span className="text-xs px-3.5 py-1.5 rounded-full bg-amber-400 text-gray-950 font-bold shadow-xs">
                                {pet.reward}
                            </span>
                        )}
                    </div>
                </div>

                {/* Miniaturas da Galeria (Thumbnail Strip) */}
                {hasMultiplePhotos && (
                    <div className="bg-[#F4F4F2] px-4 py-3 border-b border-[#E4E4E1] flex items-center gap-2 overflow-x-auto">
                        {photos.map((photo, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setCurrentPhotoIndex(idx)}
                                className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${currentPhotoIndex === idx ? "border-[#FF7A59] scale-105 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                                    }`}
                            >
                                <img src={photo} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Conteúdo do Detalhe */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between gap-6">
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-2xl sm:text-3xl font-bold font-['Manrope'] text-[#2D2D2D]">
                                    {pet.name || "Sem Nome"}
                                </h3>
                            </div>
                            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mt-1">
                                {pet.breed || "Raça não informada"}
                                {formattedAge ? ` • ${formattedAge}` : ""}
                                {pet.gender ? ` • ${pet.gender === 'male' ? 'Macho' : 'Fêmea'}` : ""}
                            </p>
                        </div>

                        {/* Descrição */}
                        {pet.description && (
                            <div className="bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl p-4">
                                <h4 className="text-xs font-bold text-[#2D2D2D] uppercase tracking-wider mb-1">Sobre o ocorrido / Descrição</h4>
                                <p className="text-sm text-[#6B7280] leading-relaxed">
                                    {pet.description}
                                </p>
                            </div>
                        )}

                        {/* Informações Específicas (Localização e Data) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            {(pet.state || pet.city) && (
                                <div className="flex items-center gap-3 bg-[#F4F4F2] border border-[#E4E4E1] p-3.5 rounded-2xl text-xs text-[#2D2D2D]">
                                    <div className="p-2.5 bg-[#FF7A59]/10 text-[#FF7A59] rounded-xl shrink-0">
                                        <FaLocationDot className="w-4 h-4" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] text-[#6B7280] font-semibold uppercase">Localização</p>
                                        <span className="font-medium truncate block">{pet.state || `${pet.city}${pet.state ? `, ${pet.state}` : ''}`}</span>
                                    </div>
                                </div>
                            )}

                            {(pet.date || pet.createdAt) && isOccurrence && (
                                <div className="flex items-center gap-3 bg-[#F4F4F2] border border-[#E4E4E1] p-3.5 rounded-2xl text-xs text-[#2D2D2D]">
                                    <div className="p-2.5 bg-[#FF7A59]/10 text-[#FF7A59] rounded-xl shrink-0">
                                        <FaCalendarDay className="w-4 h-4" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] text-[#6B7280] font-semibold uppercase">
                                            {pet.type === "lost" ? "Desaparecido em" : "Encontrado em"}
                                        </p>
                                        <span className="font-medium truncate block">{pet.date || pet.createdAt?.substring(0, 10)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rodapé com Ações / Contato */}
                    <div className="pt-4 border-t border-[#E4E4E1] flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-xs text-[#6B7280]">
                            {pet.contactName ? (
                                <span>Responsável pelo contato: <strong className="text-[#2D2D2D]">{pet.contactName}</strong></span>
                            ) : (
                                <span>Rede de Apoio • Proteção Animal</span>
                            )}
                        </div>

                        {cleanPhone ? (
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold py-3 px-6 rounded-2xl transition text-xs shadow-sm cursor-pointer"
                            >
                                <FaWhatsapp className="w-4 h-4" /> Entrar em Contato ({pet.contactName || "WhatsApp"})
                            </a>
                        ) : (
                            <button
                                onClick={onClose}
                                type="button"
                                className="w-full sm:w-auto bg-[#2D2D2D] hover:bg-black text-white text-xs font-semibold px-6 py-3 rounded-2xl transition cursor-pointer"
                            >
                                Fechar Detalhes
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Tela Cheia (Lightbox) ao clicar na foto */}
            {isFullScreen && photos.length > 0 && (
                <div
                    className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setIsFullScreen(false)}
                >
                    <button
                        onClick={() => setIsFullScreen(false)}
                        type="button"
                        className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition cursor-pointer z-50 backdrop-blur-sm"
                        title="Fechar tela cheia"
                    >
                        <FaXmark className="w-6 h-6" />
                    </button>

                    <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={photos[currentPhotoIndex]}
                            alt={pet.name || "Pet em tela cheia"}
                            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                        />

                        {hasMultiplePhotos && (
                            <>
                                <button
                                    type="button"
                                    onClick={handlePrevPhoto}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition cursor-pointer backdrop-blur-sm"
                                >
                                    <FaChevronLeft className="w-6 h-6" />
                                </button>

                                <button
                                    type="button"
                                    onClick={handleNextPhoto}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition cursor-pointer backdrop-blur-sm"
                                >
                                    <FaChevronRight className="w-6 h-6" />
                                </button>

                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full text-white text-xs font-semibold backdrop-blur-md">
                                    Foto {currentPhotoIndex + 1} de {photos.length}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}