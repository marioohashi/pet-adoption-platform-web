import { useState } from "react";
import { FaPaw, FaPenToSquare, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import type { Pet } from "../types/index";
import { formatAge } from "../utils/formatAge";

interface PetListCardProps {
  pet: Pet;
  onClick?: () => void;
  showActions?: boolean;
  onEdit?: (pet: Pet) => void;
  onDelete?: (pet: Pet) => void;
}

export function PetListCard({
  pet,
  onClick,
  showActions = false,
  onEdit,
  onDelete,
}: PetListCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Consolida o array de fotos (prioriza `photos`, se vazio usa `photo`, senão lista vazia)
  const photos = pet.photos && pet.photos.length > 0
    ? pet.photos
    : pet.photo ? [pet.photo] : [];

  const hasMultiplePhotos = photos.length > 1;

  function handlePrevPhoto(e: React.MouseEvent) {
    e.stopPropagation(); // Evita abrir o modal de detalhes ao clicar na seta
    setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }

  function handleNextPhoto(e: React.MouseEvent) {
    e.stopPropagation(); // Evita abrir o modal de detalhes ao clicar na seta
    setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }

  const formattedAge = formatAge(pet.age);

  return (
    <div
      onClick={onClick}
      className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-3xl overflow-hidden hover:border-[#FF7A59]/50 transition-all duration-300 cursor-pointer flex flex-col group relative shadow-xs hover:shadow-xl font-sans"
    >
      {/* Container da Imagem com Carrossel */}
      <div className="relative w-full aspect-[4/5] sm:aspect-square bg-[#F4F4F2] flex items-center justify-center overflow-hidden">
        {photos.length > 0 ? (
          <img
            src={photos[currentPhotoIndex]}
            alt={pet.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <FaPaw className="w-16 h-16 text-[#E4E4E1]" />
        )}

        {/* Setas de Navegação (Aparecem no hover e apenas se houver mais de 1 foto) */}
        {hasMultiplePhotos && (
          <>
            <button
              type="button"
              onClick={handlePrevPhoto}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-[#2D2D2D]/60 hover:bg-[#2D2D2D]/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer backdrop-blur-sm"
              title="Foto anterior"
            >
              <FaChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleNextPhoto}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-[#2D2D2D]/60 hover:bg-[#2D2D2D]/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer backdrop-blur-sm"
              title="Próxima foto"
            >
              <FaChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Indicadores de Página (Pontinhos / Dots) */}
            <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-10">
              {photos.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${currentPhotoIndex === idx
                      ? "w-4 bg-[#FF7A59]"
                      : "w-1.5 bg-white/70"
                    }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Tag de Status Flutuante sobre a Foto */}
        <div className="absolute top-3 left-3 z-10">
          <span className="text-xs px-3 py-1 rounded-full bg-[#FAFAF8]/90 backdrop-blur-md text-[#FF7A59] font-semibold border border-[#FF7A59]/20 shadow-xs">
            {pet.status === "available" ? "Disponível" : pet.status}
          </span>
        </div>
      </div>

      {/* Conteúdo / Rodapé do Card */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-['Manrope'] text-[#2D2D2D] leading-snug group-hover:text-[#FF7A59] transition-colors line-clamp-1">
              {pet.name}
            </h3>
            <p className="text-xs text-[#6B7280] font-medium mt-1">
              {pet.breed || "Sem raça definida"}
              {formattedAge ? ` • ${formattedAge}` : ""}
            </p>
          </div>

          {/* Botões de Ação do Proprietário */}
          {showActions && (
            <div className="flex items-center gap-1 shrink-0">
              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(pet);
                  }}
                  className="p-2 text-[#6B7280] hover:text-[#FF7A59] hover:bg-[#F4F4F2] rounded-xl transition cursor-pointer"
                  title="Editar pet"
                >
                  <FaPenToSquare className="w-4 h-4" />
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(pet);
                  }}
                  className="p-2 text-[#6B7280] hover:text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                  title="Remover pet"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}