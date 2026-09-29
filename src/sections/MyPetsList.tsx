import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getMyPets, deletePet } from "../services/petService";
import { PetListCard } from "./PetListCard";
import { PetDetailModal } from "../modals/PetDetailModal";
import { CreatePetModal } from "../modals/CreatePetModal";
import { ConfirmModal } from "../modals/ConfirmModal";
import { FaPlus, FaPaw } from "react-icons/fa6";
import type { Pet } from "../types";

export function MyPetsList() {
    const queryClient = useQueryClient();
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
    const [editingPet, setEditingPet] = useState<Pet | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [petToDelete, setPetToDelete] = useState<Pet | null>(null);

    const { data: pets = [], isLoading, isError } = useQuery<Pet[]>({
        queryKey: ["my-pets"],
        queryFn: getMyPets,
    });

    const deleteMutation = useMutation({
        mutationFn: (petId: string) => deletePet(petId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-pets"] });
            queryClient.invalidateQueries({ queryKey: ["pets"] });
            setPetToDelete(null); // Fecha o modal após o sucesso
        },
    });

    function handleDeleteClick(pet: Pet) {
        setPetToDelete(pet); // Abre o modal bonito ao invés do confirm()
    }

    function confirmDelete() {
        if (!petToDelete) return;
        deleteMutation.mutate(petToDelete.id);
    }

    function handleCloseFormModal() {
        setIsCreateModalOpen(false);
        setEditingPet(null);
    }

    if (isLoading) {
        return <p className="text-center py-12 text-[#6B7280] font-sans">Carregando seus pets...</p>;
    }

    if (isError) {
        return <p className="text-center py-12 text-red-500 font-sans">Erro ao carregar seus pets.</p>;
    }

    return (
        <section className="w-full font-sans">
            {/* Cabeçalho da Aba */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-3xl font-bold font-['Manrope'] text-[#2D2D2D] mb-1 tracking-tight">
                        Meus Pets Cadastrados
                    </h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed">
                        Gerencie e edite as informações dos pets que você colocou para adoção no Adote2Pets
                    </p>
                </div>
            </div>

            {/* Lista Vazia */}
            {pets.length === 0 ? (
                <div className="bg-[#F4F4F2] border border-[#E4E4E1] rounded-3xl p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-[#FF7A59]/10 rounded-2xl flex items-center justify-center mx-auto text-[#FF7A59]">
                        <FaPaw className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold font-['Manrope'] text-[#2D2D2D]">Nenhum pet anunciado ainda</h4>
                    <p className="text-sm text-[#6B7280] max-w-md mx-auto leading-relaxed">
                        Você ainda não cadastrou nenhum amiguinho. Clique no botão abaixo para criar seu primeiro anúncio!
                    </p>
                </div>
            ) : (
                /* Grid de Cards */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {pets.map((pet) => (
                        <PetListCard
                            key={pet.id}
                            pet={pet}
                            showActions={true}
                            onClick={() => setSelectedPet(pet)}
                            onEdit={(p) => setEditingPet(p)}
                            onDelete={(p) => handleDeleteClick(p)}
                        />
                    ))}
                </div>
            )}

            <div className="flex justify-center pt-2 my-10">
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[#FF7A59] hover:bg-[#e0694a] text-white font-semibold px-5 py-3 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md shrink-0 text-sm"
                >
                    <FaPlus className="w-4 h-4" />
                    Adicionar Pet
                </button>
            </div>

            {/* Modal de Detalhes do Pet */}
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

            {/* Modal Bonito de Confirmação de Exclusão */}
            <ConfirmModal
                isOpen={Boolean(petToDelete)}
                title={`Excluir "${petToDelete?.name}"?`}
                message="Tem certeza que deseja remover este anúncio do sistema? Esta ação é irreversível e o pet deixará de aparecer para adoção."
                confirmText="Sim, excluir"
                cancelText="Cancelar"
                onConfirm={confirmDelete}
                onCancel={() => setPetToDelete(null)}
            />
        </section>
    );
}