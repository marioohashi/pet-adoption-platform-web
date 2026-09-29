import { useState } from "react";
import { FaPhone, FaLocationDot, FaClock, FaXmark, FaPlus, FaPenToSquare, FaTrash, FaBuilding } from "react-icons/fa6";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { ConfirmModal } from "../modals/ConfirmModal";
import { CreateVetModal } from "../modals/CreateVetModal";

interface VetPartner {
    id: string;
    name: string;
    type?: "Clinica" | "Veterinario";
    image?: string;
    avatarUrl: string;
    crmv: string;
    city?: string;
    phone: string;
    address: string;
    hours?: string;
    specialty: string;
    description?: string | null;
}

export function VetsList() {
    const { isAdmin } = useAuth();
    const queryClient = useQueryClient();

    const [selectedVet, setSelectedVet] = useState<VetPartner | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vetToEdit, setVetToEdit] = useState<VetPartner | null>(null);
    const [vetToDeleteId, setVetToDeleteId] = useState<string | null>(null);

    // Busca da API
    const { data: vets = [], isLoading } = useQuery<VetPartner[]>({
        queryKey: ["vets"],
        queryFn: async () => {
            const response = await api.get("/vets");
            return response.data;
        },
    });

    // Mutation para deletar
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/vets/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vets"] });
            setVetToDeleteId(null);
        },
        onError: () => {
            alert("Erro ao remover parceiro.");
        }
    });

    function handleOpenCreate() {
        setVetToEdit(null);
        setIsModalOpen(true);
    }

    function handleOpenEdit(vet: VetPartner, e: React.MouseEvent) {
        e.stopPropagation();
        setVetToEdit(vet);
        setIsModalOpen(true);
    }

    return (
        <section className="w-full font-sans">
            {/* Cabeçalho da Seção */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-3xl font-bold font-['Manrope'] text-[#2D2D2D] mb-1 tracking-tight">
                        Clínicas e Veterinários
                    </h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed">
                        Profissionais e estabelecimentos parceiros prontos para cuidar da saúde do seu pet no Adote2Pets.
                    </p>
                </div>

                {isAdmin && (
                    <button
                        onClick={handleOpenCreate}
                        type="button"
                        className="flex items-center justify-center gap-2 bg-[#FF7A59] hover:bg-[#e0694a] text-white font-semibold px-4.5 py-3 rounded-2xl transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0 text-sm"
                    >
                        <FaPlus className="w-4 h-4" /> Adicionar Clínica / Vet
                    </button>
                )}
            </div>

            {/* Estados de Carregamento e Vazio */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="bg-[#F4F4F2] border border-[#E4E4E1] rounded-3xl h-80 animate-pulse" />
                    ))}
                </div>
            ) : vets.length === 0 ? (
                <div className="bg-[#F4F4F2] border border-[#E4E4E1] rounded-3xl p-12 text-center">
                    <div className="w-16 h-16 bg-[#FF7A59]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#FF7A59]">
                        <FaBuilding className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold font-['Manrope'] text-[#2D2D2D] mb-1">Nenhum parceiro cadastrado</h4>
                    <p className="text-[#6B7280] text-sm max-w-sm mx-auto">
                        {isAdmin ? "Clique em 'Adicionar Clínica / Vet' para cadastrar o primeiro parceiro." : "Volte mais tarde para conferir os profissionais cadastrados."}
                    </p>
                </div>
            ) : (
                /* Listagem em Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {vets.map((vet) => {
                        const avatarSrc = vet.avatarUrl || vet.image;
                        return (
                            <div
                                key={vet.id}
                                onClick={() => setSelectedVet(vet)}
                                className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-3xl overflow-hidden hover:border-[#FF7A59]/50 transition-all duration-300 cursor-pointer flex flex-col group relative shadow-xs hover:shadow-xl"
                            >
                                {/* Imagem e Badge do Tipo */}
                                <div className="relative w-full aspect-[4/5] sm:aspect-square bg-[#F4F4F2] flex items-center justify-center overflow-hidden">
                                    <img
                                        src={avatarSrc || "https://images.unsplash.com/photo-1584132967334-10e028bd69f7"}
                                        alt={vet.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 left-3 z-10">
                                        <span className="text-xs px-3 py-1 rounded-full bg-[#FAFAF8]/90 backdrop-blur-md text-[#FF7A59] font-semibold border border-[#FF7A59]/20 shadow-xs">
                                            {vet.type === "Clinica" ? "Clínica" : "Veterinário(a)"}
                                        </span>
                                    </div>
                                </div>

                                {/* Informações do Card */}
                                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="text-base font-bold font-['Manrope'] text-[#2D2D2D] leading-snug group-hover:text-[#FF7A59] transition-colors line-clamp-1">
                                                {vet.name}
                                            </h3>
                                            <p className="text-xs text-[#6B7280] font-medium mt-1 line-clamp-1">
                                                {vet.specialty}
                                            </p>
                                        </div>

                                        {isAdmin && (
                                            <div className="flex items-center gap-1 shrink-0 z-10">
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleOpenEdit(vet, e)}
                                                    className="p-2 text-[#6B7280] hover:text-[#FF7A59] hover:bg-[#F4F4F2] rounded-xl transition cursor-pointer"
                                                    title="Editar parceiro"
                                                >
                                                    <FaPenToSquare className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setVetToDeleteId(vet.id);
                                                    }}
                                                    className="p-2 text-[#6B7280] hover:text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                                                    title="Remover parceiro"
                                                >
                                                    <FaTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal de Detalhes (Estilo Airbnb / Acolhedor) */}
            {selectedVet && (
                <div className="fixed inset-0 z-50 bg-[#2D2D2D]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative text-[#2D2D2D] p-6 sm:p-8 space-y-6">
                        <button
                            onClick={() => setSelectedVet(null)}
                            type="button"
                            className="absolute top-5 right-5 bg-[#F4F4F2] hover:bg-[#E4E4E1] text-[#6B7280] hover:text-[#2D2D2D] p-2.5 rounded-2xl transition cursor-pointer z-20 border border-[#E4E4E1]"
                            title="Fechar"
                        >
                            <FaXmark className="w-5 h-5" />
                        </button>

                        <div className="relative w-full aspect-square bg-[#F4F4F2] rounded-2xl overflow-hidden shadow-inner border border-[#E4E4E1]">
                            <img src={selectedVet.avatarUrl || selectedVet.image} alt={selectedVet.name} className="w-full h-full object-cover" />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FF7A59]/10 text-[#FF7A59] border border-[#FF7A59]/20">
                                        {selectedVet.type === "Clinica" ? "Clínica Veterinária" : "Profissional Autônomo"}
                                    </span>
                                    {selectedVet.city && (
                                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F4F4F2] text-[#6B7280] border border-[#E4E4E1]">
                                            {selectedVet.city}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-2xl font-bold font-['Manrope'] text-[#2D2D2D] mt-2">{selectedVet.name}</h3>
                                <p className="text-xs font-semibold text-[#FF7A59] mt-1 uppercase tracking-wider">
                                    {selectedVet.specialty}
                                </p>
                                {selectedVet.description && (
                                    <p className="text-sm text-[#6B7280] leading-relaxed mt-2">{selectedVet.description}</p>
                                )}
                            </div>

                            <div className="bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl p-4 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-[#2D2D2D]">
                                    <div className="p-2.5 bg-[#FF7A59]/10 text-[#FF7A59] rounded-xl shrink-0">
                                        <FaPhone className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">{selectedVet.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-[#2D2D2D]">
                                    <div className="p-2.5 bg-[#FF7A59]/10 text-[#FF7A59] rounded-xl shrink-0">
                                        <FaLocationDot className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">{selectedVet.address}</span>
                                </div>
                                {selectedVet.hours && (
                                    <div className="flex items-center gap-3 text-sm text-[#2D2D2D]">
                                        <div className="p-2.5 bg-[#FF7A59]/10 text-[#FF7A59] rounded-xl shrink-0">
                                            <FaClock className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium">{selectedVet.hours}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedVet(null)}
                            className="w-full bg-[#FF7A59] hover:bg-[#e0694a] text-white font-semibold py-3.5 rounded-2xl transition cursor-pointer shadow-sm text-sm"
                        >
                            Fechar Informações
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de Cadastro/Edição */}
            <CreateVetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={vetToEdit}
            />

            {/* Modal de Confirmação de Exclusão */}
            <ConfirmModal
                isOpen={Boolean(vetToDeleteId)}
                title="Excluir parceiro de saúde?"
                message="Tem certeza que deseja remover esta clínica ou veterinário do banco de dados? Esta ação não poderá ser desfeita."
                confirmText="Sim, excluir"
                cancelText="Cancelar"
                onConfirm={() => {
                    if (vetToDeleteId) deleteMutation.mutate(vetToDeleteId);
                }}
                onCancel={() => setVetToDeleteId(null)}
            />
        </section>
    );
}