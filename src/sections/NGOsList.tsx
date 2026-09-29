import { useState } from "react";
import { FaPhone, FaGlobe, FaLocationDot, FaXmark, FaPlus, FaPenToSquare, FaTrash, FaBuilding } from "react-icons/fa6";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { CreateNgoModal } from "../modals/CreateNgoModal";
import { ConfirmModal } from "../modals/ConfirmModal";

interface NGO {
    id: string;
    name: string;
    image: string;
    city: string;
    phone: string;
    website: string;
    description?: string | null;
}

const MOCK_NGOS: NGO[] = [
    {
        id: "mock-ngo-1",
        name: "Ampara Animal Curitiba",
        image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c",
        city: "Curitiba - PR",
        phone: "(41) 98877-6655",
        website: "https://www.amparaanimal.org.br",
        description: "Organização dedicada à proteção e amparo de animais em situação de vulnerabilidade, promovendo feiras de adoção e castração consciente."
    },
    {
        id: "mock-ngo-2",
        name: "SOS Patinhas do Bem",
        image: "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a",
        city: "São José dos Pinhais - PR",
        phone: "(41) 97766-5544",
        website: "https://www.sospatinhasdobem.com.br",
        description: "Abrigo temporário que resgata cães e gatos vítimas de maus-tratos, oferecendo reabilitação completa até encontrarem um lar definitivo."
    },
    {
        id: "mock-ngo-3",
        name: "Instituto Focinho Feliz",
        image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97",
        city: "Colombo - PR",
        phone: "(41) 96655-4433",
        website: "https://www.institutofocinhofeliz.org",
        description: "Projeto social focado no resgate, cuidado veterinário intensivo e reintegração social de animais de grande e pequeno porte."
    }
];

export function NGOsList() {
    const { isAdmin } = useAuth();
    const queryClient = useQueryClient();

    const [selectedNGO, setSelectedNGO] = useState<NGO | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ngoToEdit, setNgoToEdit] = useState<NGO | null>(null);
    const [ngoToDeleteId, setNgoToDeleteId] = useState<string | null>(null);

    // Busca as ONGs da API com Fallback para Mock
    const { data: rawNgos = [], isLoading } = useQuery<NGO[]>({
        queryKey: ["ngos"],
        queryFn: async () => {
            try {
                const response = await api.get("/ngos");
                return response.data;
            } catch {
                return [];
            }
        },
    });

    const ngos = rawNgos.length > 0 ? rawNgos : MOCK_NGOS;

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
            if (!ngoToDeleteId.startsWith("mock-")) {
                await api.delete(`/ngos/${ngoToDeleteId}`);
            }
            queryClient.invalidateQueries({ queryKey: ["ngos"] });
            setNgoToDeleteId(null);
        } catch (error) {
            alert("Erro ao remover a ONG.");
        }
    }

    return (
        <section className="w-full font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-3xl font-bold font-['Manrope'] text-[#2D2D2D] mb-1 tracking-tight">
                        ONGs Parceiras
                    </h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed">
                        Conheça as instituições e abrigos parceiros do Adote2Pets que salvam vidas todos os dias
                    </p>
                </div>

                {isAdmin && (
                    <button
                        onClick={handleOpenCreate}
                        type="button"
                        className="flex items-center justify-center gap-2 bg-[#FF7A59] hover:bg-[#e0694a] text-white font-semibold px-4.5 py-3 rounded-2xl transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0 text-sm"
                    >
                        <FaPlus className="w-4 h-4" /> Adicionar ONG
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="bg-[#F4F4F2] border border-[#E4E4E1] rounded-3xl h-80 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {ngos.map((ngo) => (
                        <div
                            key={ngo.id}
                            onClick={() => setSelectedNGO(ngo)}
                            className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-3xl overflow-hidden hover:border-[#FF7A59]/50 transition-all duration-300 cursor-pointer flex flex-col group relative shadow-xs hover:shadow-xl"
                        >
                            <div className="relative w-full aspect-[4/5] sm:aspect-square bg-[#F4F4F2] flex items-center justify-center overflow-hidden">
                                <img
                                    src={ngo.image}
                                    alt={ngo.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 left-3 z-10">
                                    <span className="text-xs px-3 py-1 rounded-full bg-[#FAFAF8]/90 backdrop-blur-md text-[#FF7A59] font-semibold border border-[#FF7A59]/20 shadow-xs">
                                        ONG
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 flex-1 flex flex-col justify-between gap-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold font-['Manrope'] text-[#2D2D2D] leading-snug group-hover:text-[#FF7A59] transition-colors line-clamp-1">
                                            {ngo.name}
                                        </h3>
                                        <p className="text-xs text-[#6B7280] font-medium mt-1">
                                            {ngo.city}
                                        </p>
                                    </div>

                                    {isAdmin && (
                                        <div className="flex items-center gap-1 shrink-0 z-10">
                                            <button
                                                type="button"
                                                onClick={(e) => handleOpenEdit(ngo, e)}
                                                className="p-2 text-[#6B7280] hover:text-[#FF7A59] hover:bg-[#F4F4F2] rounded-xl transition cursor-pointer"
                                                title="Editar ONG"
                                            >
                                                <FaPenToSquare className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => handleDeleteClick(ngo.id, e)}
                                                className="p-2 text-[#6B7280] hover:text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
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
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative text-[#2D2D2D] p-6 sm:p-8 space-y-6">
                        <button
                            onClick={() => setSelectedNGO(null)}
                            type="button"
                            className="absolute top-5 right-5 bg-[#F4F4F2] hover:bg-[#E4E4E1] text-[#6B7280] hover:text-[#2D2D2D] p-2.5 rounded-xl transition cursor-pointer z-20"
                            title="Fechar"
                        >
                            <FaXmark className="w-5 h-5" />
                        </button>

                        <div className="relative w-full aspect-square bg-[#F4F4F2] rounded-2xl overflow-hidden shadow-xs">
                            <img src={selectedNGO.image} alt={selectedNGO.name} className="w-full h-full object-cover" />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FF7A59]/10 text-[#FF7A59] border border-[#FF7A59]/20">
                                        Instituição / ONG
                                    </span>
                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F4F4F2] text-[#6B7280] border border-[#E4E4E1]">
                                        {selectedNGO.city}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold font-['Manrope'] text-[#2D2D2D] mt-2">{selectedNGO.name}</h3>
                                {selectedNGO.description && (
                                    <p className="text-sm text-[#6B7280] leading-relaxed mt-2">{selectedNGO.description}</p>
                                )}
                            </div>

                            <div className="bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl p-4 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-[#2D2D2D]">
                                    <div className="p-2 bg-[#FF7A59]/10 text-[#FF7A59] rounded-xl shrink-0">
                                        <FaPhone className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">{selectedNGO.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-[#2D2D2D]">
                                    <div className="p-2 bg-[#FF7A59]/10 text-[#FF7A59] rounded-xl shrink-0">
                                        <FaGlobe className="w-4 h-4" />
                                    </div>
                                    <a href={selectedNGO.website} target="_blank" rel="noopener noreferrer" className="text-[#FF7A59] hover:underline break-all font-medium">
                                        {selectedNGO.website}
                                    </a>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-[#2D2D2D]">
                                    <div className="p-2 bg-[#FF7A59]/10 text-[#FF7A59] rounded-xl shrink-0">
                                        <FaLocationDot className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">{selectedNGO.city}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedNGO(null)}
                            className="w-full bg-[#FF7A59] hover:bg-[#e0694a] text-white font-semibold py-3.5 rounded-2xl transition cursor-pointer shadow-sm text-sm"
                        >
                            Fechar Informações
                        </button>
                    </div>
                </div>
            )}

            <CreateNgoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={ngoToEdit}
            />

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