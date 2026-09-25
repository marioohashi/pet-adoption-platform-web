import { FaXmark, FaPaw } from "react-icons/fa6";
import type { Pet } from "../types/index";

interface PetDetailModalProps {
    pet: Pet | null;
    isOpen?: boolean;
    onClose: () => void;
    onRequireAuth?: () => void;
}

export function PetDetailModal({ pet, isOpen = true, onClose, onRequireAuth }: PetDetailModalProps) {
    if (!isOpen || !pet) return null; // ✅ Utiliza 'isOpen' na validação

    function handleContactTutor() {
        if (onRequireAuth) {
            onRequireAuth();
        } else {
            alert(`Mensagem enviada para o tutor do pet ${pet?.name}!`);
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative text-gray-100 p-6 space-y-4">

                {/* Botão Fechar */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-gray-900/60 text-gray-400 hover:text-white p-1.5 rounded-lg cursor-pointer"
                >
                    <FaXmark className="w-5 h-5" />
                </button>

                {/* Foto do Pet */}
                <div className="h-64 w-full bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center">
                    {pet.photo ? (
                        <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
                    ) : (
                        <FaPaw className="w-16 h-16 text-gray-700" />
                    )}
                </div>

                {/* Informações */}
                <div>
                    <h2 className="text-2xl font-bold text-white">{pet.name}</h2>
                    <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400">
                        {pet.status === "available" ? "Disponível para Adoção" : pet.status}
                    </span>
                </div>

                {pet.description && (
                    <p className="text-sm text-gray-300">{pet.description}</p>
                )}

                <button
                    onClick={handleContactTutor}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-2.5 rounded-lg transition cursor-pointer"
                >
                    Entrar em contato com o tutor
                </button>

            </div>
        </div>
    );
}