import { FaDog, FaCat } from "react-icons/fa6";
import { type Pet } from "../types";

interface PetListCardProps {
  pet: Pet;
  onClick?: () => void;
}

export function PetListCard({ pet, onClick }: PetListCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-gray-800 border border-gray-700/60 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-200 flex flex-col group shadow-lg cursor-pointer hover:-translate-y-1"
    >
      {/* Área da Foto / Placeholder */}
      <div className="h-48 w-full bg-gray-700/40 flex items-center justify-center relative overflow-hidden">
        {pet.imageUrl ? (
          <img
            src={pet.imageUrl}
            alt={pet.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="p-4 bg-amber-500/10 rounded-full text-amber-400">
            {pet.species === "cat" ? (
              <FaCat className="w-12 h-12" />
            ) : (
              <FaDog className="w-12 h-12" />
            )}
          </div>
        )}

        {/* Badge Status */}
        <span className="absolute top-3 right-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm uppercase tracking-wider">
          {pet.status === "AVAILABLE" ? "Disponível" : pet.status}
        </span>
      </div>

      {/* Informações do Pet */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
            {pet.name}
          </h3>
          <p className="text-sm text-gray-400 mt-1 capitalize">
            {pet.species === "dog" ? "Cão" : pet.species === "cat" ? "Gato" : pet.species} • {pet.breed}
          </p>
        </div>

        {/* Rodapé */}
        <div className="mt-5 pt-3 border-t border-gray-700/60 flex items-center justify-between text-xs text-gray-400">
          <span>
            Publicado por:{" "}
            <strong className="text-gray-200 font-medium">
              {pet.user?.name || "Doador"}
            </strong>
          </span>
          <span className="text-amber-400 font-semibold group-hover:underline">Ver Detalhes →</span>
        </div>
      </div>
    </div>
  );
}