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
        <section className="w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-3xl font-bold text-white mb-1">Clínicas e Veterinários</h3>
                    <p className="text-sm text-gray-400">
                        Profissionais e estabelecimentos parceiros prontos para cuidar da saúde do seu pet no Adote2Pets
                    </p>
                </div>

                {isAdmin && (
                    <button
                        onClick={handleOpenCreate}
                        type="button"
                        className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-4 py-2.5 rounded-xl transition shadow-lg cursor-pointer shrink-0"
                    >
                        <FaPlus className="w-4 h-4" /> Adicionar Clínica / Vet
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="bg-gray-800/40 border border-gray-700/60 rounded-2xl h-80 animate-pulse" />
                    ))}
                </div>
            ) : vets.length === 0 ? (
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-12 text-center">
                    <FaBuilding className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <h4 className="text-lg font-bold text-white mb-1">Nenhum parceiro cadastrado</h4>
                    <p className="text-gray-400 text-sm">
                        {isAdmin ? "Clique em 'Adicionar Clínica / Vet' para cadastrar o primeiro parceiro." : "Volte mais tarde para conferir os profissionais cadastrados."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {vets.map((vet) => {
                        const avatarSrc = vet.avatarUrl || vet.image;
                        return (
                            <div
                                key={vet.id}
                                onClick={() => setSelectedVet(vet)}
                                className="bg-gray-800 border border-gray-700/80 rounded-2xl overflow-hidden hover:border-amber-500/50 transition cursor-pointer flex flex-col group relative shadow-md hover:shadow-xl"
                            >
                                <div className="relative w-full aspect-[4/5] sm:aspect-square bg-gray-900 flex items-center justify-center overflow-hidden">
                                    <img
                                        src={avatarSrc || "https://images.unsplash.com/photo-1584132967334-10e028bd69f7"}
                                        alt={vet.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-3 left-3 z-10">
                                        <span className="text-xs px-2.5 py-1 rounded-full bg-gray-950/70 backdrop-blur-md text-amber-400 font-medium border border-amber-500/30 shadow-sm">
                                            {vet.type === "Clinica" ? "Clínica" : "Veterinário(a)"}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="text-base sm:text-lg font-bold text-white leading-snug group-hover:text-amber-400 transition-colors line-clamp-1">
                                                {vet.name}
                                            </h3>
                                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                                                {vet.specialty}
                                            </p>
                                        </div>

                                        {isAdmin && (
                                            <div className="flex items-center gap-1 shrink-0 z-10">
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleOpenEdit(vet, e)}
                                                    className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-gray-700/80 rounded-lg transition cursor-pointer"
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
                                                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700/80 rounded-lg transition cursor-pointer"
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

            {/* Modal de Detalhes */}
            {selectedVet && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-gray-800 border border-gray-700/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative text-gray-100 p-6 sm:p-8 space-y-6">
                        <button
                            onClick={() => setSelectedVet(null)}
                            type="button"
                            className="absolute top-5 right-5 bg-gray-900/70 hover:bg-gray-900 text-gray-300 hover:text-white p-2.5 rounded-xl transition cursor-pointer z-20 backdrop-blur-sm"
                            title="Fechar"
                        >
                            <FaXmark className="w-5 h-5" />
                        </button>

                        <div className="relative w-full aspect-square bg-gray-900 rounded-2xl overflow-hidden shadow-inner">
                            <img src={selectedVet.avatarUrl || selectedVet.image} alt={selectedVet.name} className="w-full h-full object-cover" />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                        {selectedVet.type === "Clinica" ? "Clínica Veterinária" : "Profissional Autônomo"}
                                    </span>
                                    {selectedVet.city && (
                                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-700/50 text-gray-300">
                                            {selectedVet.city}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-2xl font-bold text-white mt-2">{selectedVet.name}</h3>
                                <p className="text-xs font-semibold text-amber-400 mt-1 uppercase tracking-wide">
                                    {selectedVet.specialty}
                                </p>
                                {selectedVet.description && (
                                    <p className="text-sm text-gray-300 leading-relaxed mt-2">{selectedVet.description}</p>
                                )}
                            </div>

                            <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-gray-200">
                                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
                                        <FaPhone className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">{selectedVet.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-200">
                                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
                                        <FaLocationDot className="w-4 h-4" />
                                    </div>
                                    <span>{selectedVet.address}</span>
                                </div>
                                {selectedVet.hours && (
                                    <div className="flex items-center gap-3 text-sm text-gray-200">
                                        <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
                                            <FaClock className="w-4 h-4" />
                                        </div>
                                        <span>{selectedVet.hours}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button onClick={() => setSelectedVet(null)} className="w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-3.5 rounded-xl transition cursor-pointer shadow-lg">
                            Fechar Informações
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de Cadastro/Edição desacoplado (utilizando Cloudinary) */}
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