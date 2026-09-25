import { FaXmark, FaDog, FaCat, FaHeart, FaPaw } from "react-icons/fa6";
import { type Pet } from "../types";
import { useAuth } from "../hooks/useAuth";

interface PetDetailModalProps {
    pet: Pet | null;
    onClose: () => void;
    onRequireAuth?: () => void;
}

export function PetDetailModal({ pet, onClose, onRequireAuth }: PetDetailModalProps) {
    const { session } = useAuth();

    if (!pet) return null;

    function handleAdoptClick() {
        if (!session) {
            onClose();
            if (onRequireAuth) onRequireAuth();
        } else {
            alert(`Mensagem enviada para o tutor do pet ${pet.name}!`);
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-gray-800 border border-gray-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative text-gray-100 flex flex-col max-h-[90vh]">

                {/* Botão Fechar */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-gray-900/70 text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-900 transition cursor-pointer"
                >
                    <FaXmark className="w-5 h-5" />
                </button>

                <div className="overflow-y-auto flex-1">
                    {/* Banner de Foto do Pet */}
                    <div className="h-64 sm:h-80 w-full bg-gray-700/50 flex items-center justify-center relative">
                        {pet.imageUrl ? (
                            <img
                                src={pet.imageUrl}
                                alt={pet.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="p-6 bg-amber-500/10 rounded-full text-amber-400">
                                {pet.species === "cat" ? (
                                    <FaCat className="w-20 h-20" />
                                ) : (
                                    <FaDog className="w-20 h-20" />
                                )}
                            </div>
                        )}

                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-gray-800 to-transparent h-20" />
                    </div>

                    {/* Conteúdo dos Detalhes */}
                    <div className="p-6 space-y-6">
                        <div>
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-extrabold text-white">{pet.name}</h2>
                                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase">
                                    {pet.status === "AVAILABLE" ? "Disponível para Adoção" : pet.status}
                                </span>
                            </div>
                            <p className="text-gray-400 mt-1 capitalize">
                                {pet.species === "dog" ? "Cão" : pet.species === "cat" ? "Gato" : pet.species} • {pet.breed || "Raça não informada"}
                            </p>
                        </div>

                        {/* Chips de Atributos */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-gray-700/40 border border-gray-700 rounded-xl p-3 text-center">
                                <span className="text-xs text-gray-400 block uppercase">Porte</span>
                                <strong className="text-white text-sm capitalize">{pet.size || "Médio"}</strong>
                            </div>
                            <div className="bg-gray-700/40 border border-gray-700 rounded-xl p-3 text-center">
                                <span className="text-xs text-gray-400 block uppercase">Sexo</span>
                                <strong className="text-white text-sm capitalize">{pet.sex || "Não informado"}</strong>
                            </div>
                            <div className="bg-gray-700/40 border border-gray-700 rounded-xl p-3 text-center">
                                <span className="text-xs text-gray-400 block uppercase">Idade</span>
                                <strong className="text-white text-sm">{pet.age ? `${pet.age} anos` : "Jovem"}</strong>
                            </div>
                        </div>

                        {/* Sobre o Animal */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
                                Sobre o Pet
                            </h4>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                {pet.description || `${pet.name} é um pet muito carinhoso e está procurando um lar amoroso para fazer parte de uma nova família.`}
                            </p>
                        </div>

                        {/* Tutor / Doador */}
                        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-700/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-500/10 rounded-full text-amber-400">
                                    <FaPaw className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 block">Cadastrado por</span>
                                    <strong className="text-sm text-white">{pet.user?.name || "Tutor do Aumatch"}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rodapé Fixo com Botão de Ação */}
                <div className="p-4 border-t border-gray-700/60 bg-gray-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition cursor-pointer"
                    >
                        Fechar
                    </button>

                    <button
                        onClick={handleAdoptClick}
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-5 py-2.5 rounded-xl transition shadow-lg cursor-pointer"
                    >
                        <FaHeart className="w-4 h-4" />
                        <span>Quero Adotar</span>
                    </button>
                </div>

            </div>
        </div>
    );
}