import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getMyPets, deletePet } from "../services/petService";
import { PetCard } from "../components/PetCard"
import { ConfirmModal } from "../modals/ConfirmModal";
import { PetFormModal } from "../modals/PetFormModal";
import { FaPlus, FaPaw, FaFilter } from "react-icons/fa6";
import type { Pet } from "../types";

type TabFilter = "todos" | "adocao" | "perdido" | "achado";

export function MyPetsList() {
    const queryClient = useQueryClient();

    const [editingPet, setEditingPet] = useState<Pet | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [petToDelete, setPetToDelete] = useState<Pet | null>(null);

    const [activeTab, setActiveTab] = useState<TabFilter>("todos");

    const { data: pets = [], isLoading, isError } = useQuery<Pet[]>({
        queryKey: ["my-pets"],
        queryFn: getMyPets,
    });

    const deleteMutation = useMutation({
        mutationFn: (petId: string) => deletePet(petId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-pets"] });
            queryClient.invalidateQueries({ queryKey: ["pets"] });
            setPetToDelete(null);
        },
        onError: (error: any) => {
            alert(error.message || "Não foi possível excluir o pet.");
        },
    });

    function confirmDelete() {
        if (!petToDelete) return;
        deleteMutation.mutate(petToDelete.id);
    }

    function matchTab(pet: any, tab: TabFilter) {
        if (tab === "todos") return true;

        const val = (pet.type || pet.category || "").toLowerCase();

        if (tab === "adocao") {
            return val.includes("adocao") || val.includes("adoption") || val.includes("doacao");
        }
        if (tab === "perdido") {
            return val.includes("perdido") || val.includes("lost");
        }
        if (tab === "achado") {
            return val.includes("achado") || val.includes("found");
        }
        return false;
    }

    const filteredPets = pets.filter((pet) => matchTab(pet, activeTab));

    const counts = {
        todos: pets.length,
        adocao: pets.filter((p) => matchTab(p, "adocao")).length,
        perdido: pets.filter((p) => matchTab(p, "perdido")).length,
        achado: pets.filter((p) => matchTab(p, "achado")).length,
    };

    if (isLoading) {
        return <p className="text-center py-12 text-[#6B7280] font-sans">Carregando seus pets...</p>;
    }

    if (isError) {
        return <p className="text-center py-12 text-red-500 font-sans">Erro ao carregar seus pets do servidor.</p>;
    }

    return (
        <section className="w-full font-sans">
            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-3xl font-bold font-['Manrope'] text-[#2D2D2D] mb-1 tracking-tight">
                        Meus Pets Cadastrados
                    </h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed">
                        Gerencie seus anúncios de adoção, alertas de perdidos e animais achados.
                    </p>
                </div>
            </div>

            {/* Abas de Filtro responsivas */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 pb-4 mb-8">
                <button
                    onClick={() => setActiveTab("todos")}
                    className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${activeTab === "todos"
                        ? "bg-[#FF7A59] text-white shadow-sm"
                        : "bg-[#F4F4F2] text-[#6B7280] hover:bg-[#E4E4E1] hover:text-[#2D2D2D]"
                        }`}
                >
                    <FaFilter className="w-3.5 h-3.5 shrink-0" />
                    <span>Todos ({counts.todos})</span>
                </button>
                <button
                    onClick={() => setActiveTab("adocao")}
                    className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer text-center ${activeTab === "adocao"
                        ? "bg-[#FF7A59] text-white shadow-sm"
                        : "bg-[#F4F4F2] text-[#6B7280] hover:bg-[#E4E4E1] hover:text-[#2D2D2D]"
                        }`}
                >
                    🐾 Adoção ({counts.adocao})
                </button>
                <button
                    onClick={() => setActiveTab("perdido")}
                    className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer text-center ${activeTab === "perdido"
                        ? "bg-[#FF7A59] text-white shadow-sm"
                        : "bg-[#F4F4F2] text-[#6B7280] hover:bg-[#E4E4E1] hover:text-[#2D2D2D]"
                        }`}
                >
                    🚨 Perdidos ({counts.perdido})
                </button>
                <button
                    onClick={() => setActiveTab("achado")}
                    className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer text-center ${activeTab === "achado"
                        ? "bg-[#FF7A59] text-white shadow-sm"
                        : "bg-[#F4F4F2] text-[#6B7280] hover:bg-[#E4E4E1] hover:text-[#2D2D2D]"
                        }`}
                >
                    🔍 Achados ({counts.achado})
                </button>
            </div>

            {/* Listagem Vazia */}
            {filteredPets.length === 0 ? (
                <div className="bg-[#F4F4F2] border border-[#E4E4E1] rounded-3xl p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-[#FF7A59]/10 rounded-2xl flex items-center justify-center mx-auto text-[#FF7A59]">
                        <FaPaw className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold font-['Manrope'] text-[#2D2D2D]">Nenhum anúncio encontrado</h4>
                    <p className="text-sm text-[#6B7280] max-w-md mx-auto leading-relaxed">
                        Você não possui nenhum pet cadastrado nesta categoria no momento.
                    </p>
                </div>
            ) : (
                /* Grid de Cards */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredPets.map((pet) => (
                        <div key={pet.id} className="flex flex-col gap-2 h-full">
                            <PetCard
                                pet={pet}
                                showActions={true}
                                showEditOverlay={true}
                                onEdit={(petToEdit) => setEditingPet(petToEdit)}
                                onDelete={(petToDelete) => setPetToDelete(petToDelete)}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Botão Inferior */}
            <div className="flex justify-center pt-6 my-10">
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[#FF7A59] hover:bg-[#e0694a] text-white font-semibold px-6 py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md shrink-0 text-sm"
                >
                    <FaPlus className="w-4 h-4" />
                    Adicionar Novo Anúncio
                </button>
            </div>

            {/* Modais */}
            {/* Modal para Criação de Novo Pet */}
            <PetFormModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            {/* Modal para Edição de Pet Existente */}
            <PetFormModal
                isOpen={Boolean(editingPet)}
                initialData={editingPet}
                onClose={() => setEditingPet(null)}
            />

            <ConfirmModal
                isOpen={Boolean(petToDelete)}
                title={`Excluir "${petToDelete?.name || 'este pet'}"?`}
                message="Tem certeza que deseja remover este anúncio do sistema? Esta ação é irreversível."
                confirmText="Sim, excluir"
                cancelText="Cancelar"
                onConfirm={confirmDelete}
                onCancel={() => setPetToDelete(null)}
            />
        </section>
    );
}