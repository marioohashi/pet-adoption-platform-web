import { useState } from "react";
import { FaPhone, FaGlobe, FaLocationDot, FaXmark, FaPlus, FaPenToSquare, FaTrash, FaBuilding } from "react-icons/fa6";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { CreateNgoModal } from "./CreateNgoModal";
import { ConfirmModal } from "./ConfirmModal";

interface NGO {
    id: string;
    name: string;
    image: string;
    city: string;
    phone: string;
    website: string;
    description?: string | null;
}

export function NGOsList() {
    const { isAdmin } = useAuth();
    const queryClient = useQueryClient();

    const [selectedNGO, setSelectedNGO] = useState<NGO | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ngoToEdit, setNgoToEdit] = useState<NGO | null>(null);

    // Estado para controlar o ID da ONG que está sendo excluída
    const [ngoToDeleteId, setNgoToDeleteId] = useState<string | null>(null);

    // Busca as ONGs diretamente da API do backend
    const { data: ngos = [], isLoading } = useQuery<NGO[]>({
        queryKey: ["ngos"],
        queryFn: async () => {
            const response = await api.get("/ngos");
            return response.data;
        },
    });

    function handleOpenCreate() {
        setNgoToEdit(null);
        setIsModalOpen(true);
    }

    function handleOpenEdit(ngo: NGO, e: React.MouseEvent) {
        e.stopPropagation();
        setNgoToEdit(ngo);
        setIsModalOpen(true);
    }

    function handleDeleteClick(ngoId: string, e: React.MouseEvent) {
        e.stopPropagation();
        setNgoToDeleteId(ngoId);
    }

    async function confirmDelete() {
        if (!ngoToDeleteId) return;

        try {
            await api.delete(`/ngos/${ngoToDeleteId}`);
            queryClient.invalidateQueries({ queryKey: ["ngos"] });
            setNgoToDeleteId(null);
        } catch (error) {
            alert("Erro ao remover a ONG.");
        }
    }

    return (
        <section className="w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-3xl font-bold text-white mb-1">ONGs Parceiras</h3>
                    <p className="text-sm text-gray-400">
                        Conheça as instituições e abrigos parceiros do Adote2Pets que salvam vidas todos os dias
                    </p>
                </div>

                {/* Botão de Adicionar restrito a ADMIN */}
                {isAdmin && (
                    <button
                        onClick={handleOpenCreate}
                        type="button"
                        className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-4 py-2.5 rounded-xl transition shadow-lg cursor-pointer shrink-0"
                    >
                        <FaPlus className="w-4 h-4" /> Adicionar ONG
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="bg-gray-800/40 border border-gray-700/60 rounded-2xl h-80 animate-pulse" />
                    ))}
                </div>
            ) : ngos.length === 0 ? (
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-12 text-center">
                    <FaBuilding className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <h4 className="text-lg font-bold text-white mb-1">Nenhuma ONG cadastrada</h4>
                    <p className="text-gray-400 text-sm">
                        {isAdmin
                            ? "Clique no botão 'Adicionar ONG' acima para cadastrar a primeira instituição."
                            : "Volte mais tarde para conferir as instituições parceiras cadastradas."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {ngos.map((ngo) => (
                        <div
                            key={ngo.id}
                            onClick={() => setSelectedNGO(ngo)}
                            className="bg-gray-800 border border-gray-700/80 rounded-2xl overflow-hidden hover:border-amber-500/50 transition cursor-pointer flex flex-col group relative shadow-md hover:shadow-xl"
                        >
                            <div className="relative w-full aspect-[4/5] sm:aspect-square bg-gray-900 flex items-center justify-center overflow-hidden">
                                <img
                                    src={ngo.image}
                                    alt={ngo.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-3 left-3 z-10">
                                    <span className="text-xs px-2.5 py-1 rounded-full bg-gray-950/70 backdrop-blur-md text-amber-400 font-medium border border-amber-500/30 shadow-sm">
                                        ONG
                                    </span>
                                </div>
                            </div>

                            <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-white leading-snug group-hover:text-amber-400 transition-colors">
                                            {ngo.name}
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {ngo.city}
                                        </p>
                                    </div>

                                    {isAdmin && (
                                        <div className="flex items-center gap-1 shrink-0 z-10">
                                            <button
                                                type="button"
                                                onClick={(e) => handleOpenEdit(ngo, e)}
                                                className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-gray-700/80 rounded-lg transition cursor-pointer"
                                                title="Editar ONG"
                                            >
                                                <FaPenToSquare className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => handleDeleteClick(ngo.id, e)}
                                                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700/80 rounded-lg transition cursor-pointer"
                                                title="Remover ONG"
                                            >
                                                <FaTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Detalhes da ONG */}
            {selectedNGO && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-gray-800 border border-gray-700/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative text-gray-100 p-6 sm:p-8 space-y-6">
                        <button
                            onClick={() => setSelectedNGO(null)}
                            type="button"
                            className="absolute top-5 right-5 bg-gray-900/70 hover:bg-gray-900 text-gray-300 hover:text-white p-2.5 rounded-xl transition cursor-pointer z-20 backdrop-blur-sm"
                            title="Fechar"
                        >
                            <FaXmark className="w-5 h-5" />
                        </button>

                        <div className="relative w-full aspect-square bg-gray-900 rounded-2xl overflow-hidden shadow-inner">
                            <img src={selectedNGO.image} alt={selectedNGO.name} className="w-full h-full object-cover" />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                        Instituição / ONG
                                    </span>
                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-700/50 text-gray-300">
                                        {selectedNGO.city}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mt-2">{selectedNGO.name}</h3>
                                {selectedNGO.description && (
                                    <p className="text-sm text-gray-300 leading-relaxed mt-2">{selectedNGO.description}</p>
                                )}
                            </div>

                            <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-gray-200">
                                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
                                        <FaPhone className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">{selectedNGO.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-200">
                                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
                                        <FaGlobe className="w-4 h-4" />
                                    </div>
                                    <a href={selectedNGO.website} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline break-all">
                                        {selectedNGO.website}
                                    </a>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-200">
                                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
                                        <FaLocationDot className="w-4 h-4" />
                                    </div>
                                    <span>{selectedNGO.city}</span>
                                </div>
                            </div>
                        </div>

                        <button onClick={() => setSelectedNGO(null)} className="w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-3.5 rounded-xl transition cursor-pointer shadow-lg">
                            Fechar Informações
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de Cadastro/Edição com o Cloudinary integrado */}
            <CreateNgoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={ngoToEdit}
            />

            {/* Modal de Confirmação de Exclusão (Reutilizando o ConfirmModal) */}
            <ConfirmModal
                isOpen={Boolean(ngoToDeleteId)}
                title="Excluir ONG parceira?"
                message="Tem certeza que deseja remover esta instituição do banco de dados? Esta ação não poderá ser desfeita."
                confirmText="Sim, excluir"
                cancelText="Cancelar"
                onConfirm={confirmDelete}
                onCancel={() => setNgoToDeleteId(null)}
            />
        </section>
    );
}