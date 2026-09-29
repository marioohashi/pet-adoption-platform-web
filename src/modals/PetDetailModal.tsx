import { useState, useEffect } from "react";
import { FaXmark, FaPaw, FaChevronLeft, FaChevronRight, FaMaximize, FaLocationDot, FaPhone, FaCalendarDays } from "react-icons/fa6";
import type { Pet } from "../types/index";
import { formatAge } from "../utils/formatAge";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { PET_TYPES } from "../utils/petEnums";

interface PetDetailModalProps {
    pet: Pet | null;
    isOpen?: boolean;
    onClose: () => void;
    onRequireAuth?: () => void;
    showContactButton?: boolean;
}

export function PetDetailModal({
    pet,
    isOpen = true,
    onClose,
    onRequireAuth,
    showContactButton = true,
}: PetDetailModalProps) {
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEscapeKey(() => {
        if (isFullScreen) {
            setIsFullScreen(false);
        } else {
            onClose();
        }
    }, isOpen);

    useEffect(() => {
        setSelectedPhotoIndex(0);
        setIsFullScreen(false);
    }, [pet]);

    if (!isOpen || !pet) return null;

    const allPhotos = pet.photos && pet.photos.length > 0
        ? pet.photos
        : pet.photo ? [pet.photo] : [];

    const activePhoto = allPhotos[selectedPhotoIndex] || pet.photo;
    const hasMultiplePhotos = allPhotos.length > 1;

    function handlePrevPhoto(e: React.MouseEvent) {
        e.stopPropagation();
        setSelectedPhotoIndex((prev) => (prev === 0 ? allPhotos.length - 1 : prev - 1));
    }

    function handleNextPhoto(e: React.MouseEvent) {
        e.stopPropagation();
        setSelectedPhotoIndex((prev) => (prev === allPhotos.length - 1 ? 0 : prev + 1));
    }

    function handleContactTutor() {
        if (onRequireAuth) {
            onRequireAuth();
        } else {
            // Abre o discador se houver telefone cadastrado
            if (pet?.phone) {
                window.location.href = `tel:${pet.phone}`;
            } else {
                alert(`Contato: ${pet?.contactName || "Responsável"} (Telefone não informado)`);
            }
        }
    }

    const formattedAge = formatAge(pet.age);
    const formattedDate = pet.date ? new Date(pet.date).toLocaleDateString("pt-BR") : null;

    // Cor da tag dependendo da finalidade do pet
    const badgeColor =
        pet.type === 'lost' ? 'bg-red-500/10 text-red-600 border-red-200' :
            pet.type === 'found' ? 'bg-amber-500/10 text-amber-700 border-amber-200' :
                'bg-[#FF7A59]/10 text-[#FF7A59] border-[#FF7A59]/20';

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn font-sans">
            {/* Container Principal do Modal */}
            <div className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative text-[#2D2D2D] p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">

                {/* Botão Fechar Modal */}
                <button
                    onClick={onClose}
                    type="button"
                    className="absolute top-5 right-5 bg-[#F4F4F2] hover:bg-[#E4E4E1] text-[#6B7280] hover:text-[#2D2D2D] p-2.5 rounded-xl transition cursor-pointer z-20 shadow-xs"
                    title="Fechar (Esc)"
                >
                    <FaXmark className="w-5 h-5" />
                </button>

                {/* Foto do Pet em Destaque */}
                <div
                    onClick={() => activePhoto && setIsFullScreen(true)}
                    className="relative w-full aspect-[16/10] bg-[#F4F4F2] rounded-2xl overflow-hidden flex items-center justify-center border border-[#E4E4E1] group shadow-inner cursor-zoom-in"
                    title="Clique para ver a foto em tela cheia"
                >
                    {activePhoto ? (
                        <img
                            src={activePhoto}
                            alt={pet.name}
                            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <FaPaw className="w-20 h-20 text-[#6B7280]" />
                    )}

                    {activePhoto && (
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-black/75 backdrop-blur-md text-white text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg font-medium">
                                <FaMaximize className="w-3.5 h-3.5" /> Ampliar foto
                            </span>
                        </div>
                    )}

                    {hasMultiplePhotos && (
                        <>
                            <button
                                type="button"
                                onClick={handlePrevPhoto}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer backdrop-blur-md shadow-lg"
                                title="Foto anterior"
                            >
                                <FaChevronLeft className="w-5 h-5" />
                            </button>

                            <button
                                type="button"
                                onClick={handleNextPhoto}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer backdrop-blur-md shadow-lg"
                                title="Próxima foto"
                            >
                                <FaChevronRight className="w-5 h-5" />
                            </button>

                            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2 z-10 pointer-events-none">
                                {allPhotos.map((_, idx) => (
                                    <span
                                        key={idx}
                                        className={`h-2 rounded-full transition-all shadow-xs ${selectedPhotoIndex === idx ? "w-6 bg-[#FF7A59]" : "w-2 bg-white/60 hover:bg-white"
                                            }`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Miniaturas da Galeria */}
                {hasMultiplePhotos && (
                    <div className="flex items-center justify-center gap-3 overflow-x-auto py-1">
                        {allPhotos.map((photoUrl, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedPhotoIndex(idx)}
                                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 cursor-pointer shadow-xs ${selectedPhotoIndex === idx
                                    ? "border-[#FF7A59] scale-105 shadow-[#FF7A59]/20"
                                    : "border-[#E4E4E1] opacity-60 hover:opacity-100"
                                    }`}
                            >
                                <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Cabeçalho com Nome e Tipo */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E4E4E1] pb-5 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold font-['Manrope'] text-[#2D2D2D] tracking-tight">{pet.name}</h2>
                        <p className="text-sm text-[#6B7280] mt-1">
                            {pet.breed || "Sem raça definida"} {formattedAge ? `• ${formattedAge}` : ""}
                        </p>
                    </div>
                    <span className={`text-xs font-semibold px-4 py-2 rounded-xl border shrink-0 w-fit ${badgeColor}`}>
                        {PET_TYPES[pet.type as keyof typeof PET_TYPES] || (pet.status === "available" ? "Disponível" : pet.status)}
                    </span>
                </div>

                {/* Informações Extras (Localização, Data e Recompensa) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {pet.city && (
                        <div className="flex items-center gap-2.5 bg-[#F4F4F2] border border-[#E4E4E1] p-3 rounded-2xl text-xs text-[#6B7280]">
                            <FaLocationDot className="w-4 h-4 text-[#FF7A59] shrink-0" />
                            <span className="truncate font-medium text-[#2D2D2D]">{pet.city}{pet.state ? `, ${pet.state}` : ""}</span>
                        </div>
                    )}

                    {formattedDate && (
                        <div className="flex items-center gap-2.5 bg-[#F4F4F2] border border-[#E4E4E1] p-3 rounded-2xl text-xs text-[#6B7280]">
                            <FaCalendarDays className="w-4 h-4 text-[#FF7A59] shrink-0" />
                            <span className="truncate font-medium text-[#2D2D2D]">Ocorrido em: {formattedDate}</span>
                        </div>
                    )}

                    {pet.reward && (
                        <div className="flex items-center gap-2.5 bg-[#FFF8F5] border border-[#FF7A59]/30 p-3 rounded-2xl text-xs text-[#FF7A59]">
                            <FaCircleDollarToSign className="w-4 h-4 shrink-0" />
                            <span className="truncate font-bold">Recompensa: {pet.reward}</span>
                        </div>
                    )}
                </div>

                {/* Descrição / Sobre */}
                {pet.description && (
                    <div className="bg-[#F4F4F2] border border-[#E4E4E1] p-5 rounded-2xl space-y-2">
                        <h4 className="text-xs font-bold text-[#FF7A59] uppercase tracking-wider">Sobre o pet</h4>
                        <p className="text-sm text-[#2D2D2D] leading-relaxed whitespace-pre-line">{pet.description}</p>
                    </div>
                )}

                {/* Contato do Responsável */}
                {showContactButton && (
                    <div className="pt-2">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FAFAF8] border border-[#E4E4E1] p-4 rounded-2xl">
                            <div className="text-left w-full sm:w-auto">
                                <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">Responsável pelo contato</span>
                                <span className="text-sm font-semibold text-[#2D2D2D]">{pet.contactName || "Anunciante"}</span>
                                {pet.phone && (
                                    <span className="text-xs text-[#6B7280] flex items-center gap-1.5 mt-0.5">
                                        <FaPhone className="w-3 h-3 text-[#FF7A59]" /> {pet.phone}
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={handleContactTutor}
                                className="w-full sm:w-auto bg-[#FF7A59] hover:bg-[#e0694a] text-white font-semibold px-6 py-3.5 rounded-2xl transition cursor-pointer shadow-sm text-sm flex items-center justify-center gap-2 shrink-0"
                            >
                                <FaPhone className="w-4 h-4" /> Entrar em contato
                            </button>
                        </div>
                    </div>
                )}

            </div>

            {/* MODAL DE TELA CHEIA (LIGHTBOX) */}
            {isFullScreen && activePhoto && (
                <div
                    onClick={() => setIsFullScreen(false)}
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn cursor-zoom-out"
                >
                    <button
                        onClick={() => setIsFullScreen(false)}
                        type="button"
                        className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition cursor-pointer z-10 backdrop-blur-md shadow-lg"
                        title="Fechar tela cheia (Esc)"
                    >
                        <FaXmark className="w-6 h-6" />
                    </button>

                    <div className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={activePhoto}
                            alt={pet.name}
                            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                        />

                        {hasMultiplePhotos && (
                            <>
                                <button
                                    type="button"
                                    onClick={handlePrevPhoto}
                                    className="absolute -left-5 sm:-left-16 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-3.5 rounded-full transition cursor-pointer backdrop-blur-md shadow-lg"
                                    title="Foto anterior"
                                >
                                    <FaChevronLeft className="w-6 h-6" />
                                </button>

                                <button
                                    type="button"
                                    onClick={handleNextPhoto}
                                    className="absolute -right-5 sm:-right-16 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-3.5 rounded-full transition cursor-pointer backdrop-blur-md shadow-lg"
                                    title="Próxima foto"
                                >
                                    <FaChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}