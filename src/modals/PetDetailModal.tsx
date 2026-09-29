import { useState, useEffect } from "react";
import { FaXmark, FaPaw, FaChevronLeft, FaChevronRight, FaMaximize } from "react-icons/fa6";
import type { Pet } from "../types/index";
import { formatAge } from "../utils/formatAge";
import { useEscapeKey } from "../hooks/useEscapeKey";

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
            alert(`Mensagem enviada para o tutor do pet ${pet?.name}!`);
        }
    }

    const formattedAge = formatAge(pet.age);

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

                {/* Foto do Pet em Destaque (Clicável para expandir) */}
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

                    {/* Ícone indicativo de zoom no hover */}
                    {activePhoto && (
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-black/75 backdrop-blur-md text-white text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg font-medium">
                                <FaMaximize className="w-3.5 h-3.5" /> Ampliar foto
                            </span>
                        </div>
                    )}

                    {/* Setas de Navegação */}
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

                            {/* Indicadores de Página */}
                            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2 z-10 pointer-events-none">
                                {allPhotos.map((_, idx) => (
                                    <span
                                        key={idx}
                                        className={`h-2 rounded-full transition-all shadow-xs ${selectedPhotoIndex === idx
                                            ? "w-6 bg-[#FF7A59]"
                                            : "w-2 bg-white/60 hover:bg-white"
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

                {/* Cabeçalho */}
                <div className="flex items-start justify-between border-b border-[#E4E4E1] pb-5 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold font-['Manrope'] text-[#2D2D2D] tracking-tight">{pet.name}</h2>
                        <p className="text-sm text-[#6B7280] mt-1">
                            {pet.breed || "Sem raça definida"} {formattedAge ? `• ${formattedAge}` : ""}
                        </p>
                    </div>
                    <span className="text-xs font-semibold px-4 py-2 rounded-xl bg-[#FF7A59]/10 text-[#FF7A59] border border-[#FF7A59]/20 shrink-0">
                        {pet.status === "available" ? "Disponível para Adoção" : pet.status}
                    </span>
                </div>

                {/* Sobre e Ação */}
                {pet.description && (
                    <div className="bg-[#F4F4F2] border border-[#E4E4E1] p-5 rounded-2xl space-y-2">
                        <h4 className="text-xs font-bold text-[#FF7A59] uppercase tracking-wider">Sobre o pet</h4>
                        <p className="text-sm text-[#2D2D2D] leading-relaxed whitespace-pre-line">{pet.description}</p>
                    </div>
                )}

                {showContactButton && (
                    <button
                        onClick={handleContactTutor}
                        className="w-full bg-[#FF7A59] hover:bg-[#e0694a] text-white font-semibold py-4 rounded-2xl transition cursor-pointer shadow-sm text-base"
                    >
                        Entrar em contato com tutor
                    </button>
                )}

            </div>

            {/* MODAL DE TELA CHEIA (LIGHTBOX) */}
            {isFullScreen && activePhoto && (
                <div
                    onClick={() => setIsFullScreen(false)}
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn cursor-zoom-out"
                >
                    {/* Botão Fechar Tela Cheia */}
                    <button
                        onClick={() => setIsFullScreen(false)}
                        type="button"
                        className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition cursor-pointer z-10 backdrop-blur-md shadow-lg"
                        title="Fechar tela cheia (Esc)"
                    >
                        <FaXmark className="w-6 h-6" />
                    </button>

                    {/* Imagem em tamanho máximo mantendo proporção */}
                    <div className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={activePhoto}
                            alt={pet.name}
                            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                        />

                        {/* Setas de navegação na tela cheia */}
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