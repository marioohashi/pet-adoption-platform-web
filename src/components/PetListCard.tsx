import { FaPaw } from "react-icons/fa6";
import type { Pet } from "../types/index";

interface PetListCardProps {
  pet: Pet;
  onClick: () => void; // ✅ Adicionado onClick
}

export function PetListCard({ pet, onClick }: PetListCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-gray-800 border border-gray-700/80 rounded-2xl overflow-hidden hover:border-amber-500/50 transition cursor-pointer flex flex-col"
    >
      {/* Imagem do Pet */}
      <div className="h-48 w-full bg-gray-900 flex items-center justify-center overflow-hidden">
        {pet.photo ? (
          <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
        ) : (
          <FaPaw className="w-12 h-12 text-gray-700" />
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">{pet.name}</h3>
          <p className="text-xs text-gray-400">
            {pet.breed || "Sem raça definida"} {pet.age ? `• ${pet.age} anos` : ""}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium">
            {pet.status === "available" ? "Disponível" : pet.status}
          </span>
        </div>
      </div>
    </div>
  );
}