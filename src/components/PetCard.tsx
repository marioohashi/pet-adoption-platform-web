import { useState } from "react";
import type React from "react";
import {
    FaPaw,
    FaPen,
    FaTrash,
    FaChevronLeft,
    FaChevronRight,
    FaLocationDot,
    FaCalendarDay,
    FaWhatsapp
} from "react-icons/fa6";
import type { Pet } from "../types/index";
import { formatAge } from "../utils/formatAge";
import { PET_TYPES } from "../utils/petEnums";
import { formatDate } from "../utils/formatDate"

interface PetCardProps {
    pet: Pet;
    onClick?: () => void;
    showActions?: boolean;
    showEditOverlay?: boolean;
    onEdit?: (pet: Pet) => void;
    onDelete?: (pet: Pet) => void;
}

export function PetCard({
    pet,
    onClick,
    showActions = false,
    showEditOverlay = false,
    onEdit,
    onDelete,
}: PetCardProps) {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    const photos = pet.photos && pet.photos.length > 0
        ? pet.photos
        : pet.photo ? [pet.photo] : [];

    const hasMultiplePhotos = photos.length > 1;

    function handlePrevPhoto(e: React.MouseEvent) {
        e.stopPropagation();
        setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
    }

    function handleNextPhoto(e: React.MouseEvent) {
        e.stopPropagation();
        setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
    }

    const handleCardClick = () => {
        if (onClick) {
            onClick();
        } else if (onEdit) {
            onEdit(pet);
        }
    };

    const formattedAge = formatAge(pet.age);
    const isAdoption = pet.type === 'adoption' || pet.status === 'available' || (!['lost', 'found'].includes(pet.type));

    // WhatsApp helper
    const cleanPhone = (pet.phone || "").replace(/\D/g, "");
    const whatsappMessage = encodeURIComponent(
        isAdoption
            ? `Olá ${pet.contactName || "Tutor"}, vi o pet "${pet.name || "Pet"}" (${pet.breed}) disponível para adoção na rede de apoio e gostaria de mais informações.`
            : `Olá ${pet.contactName || "Tutor"}, vi a ocorrência sobre o pet "${pet.name || "Pet"}" (${pet.breed}) na rede de apoio e gostaria de ajudar/obter mais informações.`
    );
    const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${whatsappMessage}` : "#";

    // Cores das Tags
    const badgeColor =
        pet.type === 'lost' ? 'bg-red-500 text-white font-bold' :
            pet.type === 'found' ? 'bg-amber-600 text-white font-bold' :
                'bg-[#FAFAF8]/90 text-[#FF7A59] border border-[#FF7A59]/20 font-semibold';
    return (
        <div
            onClick={handleCardClick}
            className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-3xl overflow-hidden hover:border-[#FF7A59]/50 transition-all duration-300 flex flex-col group relative shadow-xs hover:shadow-xl font-sans cursor-pointer h-full"
        >
            {/* Container da Imagem */}
            <div className="relative w-full aspect-[4/5] sm:aspect-square bg-[#F4F4F2] flex items-center justify-center overflow-hidden">
                {photos.length > 0 ? (
                    <img
                        src={photos[currentPhotoIndex]}
                        alt={pet.name || "Pet"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <FaPaw className="w-16 h-16 text-[#E4E4E1]" />
                )}

                {/* Overlay EDITAR (para gerenciamento) */}
                {showEditOverlay && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-[2px] z-10">
                        <div className="bg-white/95 text-[#2D2D2D] px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition duration-200">
                            <FaPen className="w-3.5 h-3.5 text-[#FF7A59]" />
                            EDITAR
                        </div>
                    </div>
                )}

                {/* Setas e Indicadores de Múltiplas Fotos */}
                {hasMultiplePhotos && (
                    <>
                        <button
                            type="button"
                            onClick={handlePrevPhoto}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-[#2D2D2D]/60 hover:bg-[#2D2D2D]/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer backdrop-blur-sm"
                            title="Foto anterior"
                        >
                            <FaChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        <button
                            type="button"
                            onClick={handleNextPhoto}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-[#2D2D2D]/60 hover:bg-[#2D2D2D]/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer backdrop-blur-sm"
                            title="Próxima foto"
                        >
                            <FaChevronRight className="w-3.5 h-3.5" />
                        </button>

                        <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-20">
                            {photos.map((_, idx) => (
                                <span
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all ${currentPhotoIndex === idx ? "w-4 bg-[#FF7A59]" : "w-1.5 bg-white/70"}`}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Tags superiores (Tipo + Recompensa condicional apenas para perdidos) */}
                <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-2">
                    <span className={`text-[11px] px-3 py-1 rounded-full backdrop-blur-md shadow-xs ${badgeColor}`}>
                        {PET_TYPES[pet.type as keyof typeof PET_TYPES] || (pet.status === "available" ? "Disponível" : pet.status || "Pet")}
                    </span>

                    {pet.type === 'lost' && pet.reward && (
                        <span className="text-[11px] px-3 py-1 rounded-full bg-amber-400 text-gray-950 font-bold shadow-xs">
                            R$ {pet.reward}
                        </span>
                    )}
                </div>
            </div>

            {/* Conteúdo do Card */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                        <h3 className="text-base sm:text-lg font-bold font-['Manrope'] text-[#2D2D2D] leading-snug group-hover:text-[#FF7A59] transition-colors line-clamp-1">
                            {pet.name || "Sem nome"}
                        </h3>
                        <p className="text-xs text-[#6B7280] font-medium">
                            {pet.breed || "Raça não informada"}
                            {/* Idade aparece principalmente se for adoção/geral */}
                            {formattedAge ? ` • ${formattedAge}` : ""}
                        </p>
                    </div>

                    {/* Botão de Deletar (Lixeira) */}
                    {showActions && onDelete && (
                        <div className="flex items-center gap-1 shrink-0 z-20">
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onDelete(pet); }}
                                className="p-2 text-[#6B7280] hover:text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                                title="Remover pet"
                            >
                                <FaTrash className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Descrição opcional */}
                {pet.description && (
                    <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed">
                        {pet.description}
                    </p>
                )}

                {/* Detalhes e Localização */}
                <div className="space-y-2 pt-2 border-t border-[#E4E4E1]">
                    {(pet.city) && (
                        <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                            <FaLocationDot className="w-3.5 h-3.5 text-[#FF7A59] shrink-0" />
                            <span className="truncate">{pet.city}{pet.state ? `, ${pet.state}` : ""}</span>
                        </div>
                    )}

                    {/* Data condicional: Só mostra "Desaparecido/Encontrado em" se for lost/found */}
                    {!isAdoption && (pet.date || pet.createdAt) && (
                        <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                            <FaCalendarDay className="w-3.5 h-3.5 text-[#FF7A59] shrink-0" />
                            <span className="truncate">
                                {pet.type === "lost" ? "Desaparecido em: " : "Encontrado em: "}
                                {formatDate(pet.date || pet.createdAt?.substring(0, 10))}
                            </span>
                        </div>
                    )}
                </div>

                {/* Botão de WhatsApp */}
                {cleanPhone && (
                    <div className="pt-1 z-20" onClick={(e) => e.stopPropagation()}>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold py-2.5 px-3 rounded-2xl transition text-xs shadow-sm cursor-pointer"
                        >
                            <FaWhatsapp className="w-4 h-4" /> Mandar Mensagem ({pet.contactName || "Contato"})
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}