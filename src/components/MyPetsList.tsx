import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getMyPets, deletePet } from "../services/petService";
import { PetListCard } from "./PetListCard";
import { PetDetailModal } from "./PetDetailModal";
import { CreatePetModal } from "./CreatePetModal";
import { FaPlus, FaPaw } from "react-icons/fa6";
import type { Pet } from "../types";

export function MyPetsList() {
    const queryClient = useQueryClient();
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
    const [editingPet, setEditingPet] = useState<Pet | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Busca apenas os pets cadastrados pelo usuário
    const { data: pets = [], isLoading, isError } = useQuery<Pet[]>({
        queryKey: ["my-pets"],
        queryFn: getMyPets,
    });

    // Mutation para remover pet
    const deleteMutation = useMutation({
        mutationFn: (petId: string) => deletePet(petId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-pets"] });
            queryClient.invalidateQueries({ queryKey: ["pets"] });
        },
    });

    function handleDelete(pet: Pet) {
        if (confirm(`Tem certeza que deseja remover "${pet.name}"?`)) {
            deleteMutation.mutate(pet.id);
        }
    }

    function handleCloseFormModal() {
        setIsCreateModalOpen(false);
        setEditingPet(null);
    }

    if (isLoading) {
        return <p className="text-center py-12 text-gray-300">Carregando seus pets...</p>;
    }

    if (isError) {
        return <p className="text-center py-12 text-red-400">Erro ao carregar seus pets.</p>;
    }

    return (
        <section className="w-full">
            {/* Cabeçalho da Aba */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-3xl font-bold text-white mb-1">Meus Pets Cadastrados</h3>
                    <p className="text-sm text-gray-400">
                        Gerencie e edite as informações dos pets que você colocou para adoção
                    </p>
                </div>
            </div>

            {/* Lista Vazia */}
            {pets.length === 0 ? (
                <div className="bg-gray-800/40 border border-gray-700/60 rounded-2xl p-12 text-center space-y-4">
                    <FaPaw className="w-12 h-12 text-gray-600 mx-auto" />
                    <h4 className="text-lg font-semibold text-gray-200">Nenhum pet anunciado ainda</h4>
                    <p className="text-sm text-gray-400 max-w-md mx-auto">
                        Você ainda não cadastrou nenhum amiguinho. Clique no botão acima para criar seu primeiro anúncio!
                    </p>
                </div>
            ) : (
                /* Grid de Cards */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {pets.map((pet) => (
                        <PetListCard
                            key={pet.id}
                            pet={pet}
                            showActions={true}
                            onClick={() => setSelectedPet(pet)}
                            onEdit={(p) => setEditingPet(p)}
                            onDelete={(p) => handleDelete(p)}
                        />
                    ))}
                </div>
            )}
            <div className="flex justify-center pt-2 my-10">
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10 shrink-0"
                >
                    <FaPlus className="w-4 h-4" />
                    Anunciar Novo Pet
                </button>
            </div>

            {/* Modal de Detalhes do Pet (Oculta o botão de contato para o próprio tutor) */}
            <PetDetailModal
                pet={selectedPet}
                onClose={() => setSelectedPet(null)}
                showContactButton={false}
            />

            {/* Modal de Criação / Edição de Pet */}
            <CreatePetModal
                isOpen={isCreateModalOpen || Boolean(editingPet)}
                initialData={editingPet}
                onClose={handleCloseFormModal}
            />
        </section>
    );
}