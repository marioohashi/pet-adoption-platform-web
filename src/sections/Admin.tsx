import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { FaEye, FaPlus, FaTrash, FaPen, FaUsers, FaBuildingNgo, FaKitMedical } from "react-icons/fa6";
import { ConfirmModal } from "../modals/ConfirmModal";
import { PartnerFormModal } from "../modals/PartnerFormModal";
import { UserDetailModal } from "../modals/UserDetailModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { VetPartner, NGO, User } from "../types";
import { api } from "../services/api";

export function Admin() {
    const { isAdmin } = useAuth();
    const queryClient = useQueryClient();

    const [adminTab, setAdminTab] = useState<"ongs" | "vets" | "users">("ongs");

    const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
    const [partnerModalType, setPartnerModalType] = useState<"ngo" | "vet">("ngo");
    const [selectedPartner, setSelectedPartner] = useState<NGO | VetPartner | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Estados do Modal de Exclusão Genérico (ONGs, Vets, Users)
    const [isDeleteEntityModalOpen, setIsDeleteEntityModalOpen] = useState(false);
    const [entityToDelete, setEntityToDelete] = useState<{ id: string; name: string; type: "ngo" | "vet" | "user" } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);


    function handleOpenDetails(user: User) {
        setSelectedUser(user);
        setIsDetailModalOpen(true);
    }

    // Buscar ONGs
    const { data: ongsList = [], isLoading: loadingOngs } = useQuery<NGO[]>({
        queryKey: ["admin-ongs"],
        queryFn: async () => {
            const response = await api.get("/ngos");
            return response.data;
        },
        enabled: isAdmin,
    });

    // Buscar Veterinários
    const { data: vetsList = [], isLoading: loadingVets } = useQuery<VetPartner[]>({
        queryKey: ["admin-vets"],
        queryFn: async () => {
            const response = await api.get("/vets");
            return response.data;
        },
        enabled: isAdmin,
    });

    // Buscar Usuários
    const { data: usersList = [], isLoading: loadingUsers } = useQuery<User[]>({
        queryKey: ["admin-users"],
        queryFn: async () => {
            const response = await api.get("/users");
            return response.data;
        },
        enabled: isAdmin,
    });

    const isLoading = loadingOngs || loadingVets || loadingUsers;

    // Função de Exclusão Unificada
    async function handleDeleteEntity() {
        if (!entityToDelete) return;

        setIsDeleting(true);
        setErrorMessage(null);

        try {
            let endpoint = "";
            if (entityToDelete.type === "ngo") endpoint = `/ngos/${entityToDelete.id}`;
            else if (entityToDelete.type === "vet") endpoint = `/vets/${entityToDelete.id}`;
            else if (entityToDelete.type === "user") endpoint = `/users/${entityToDelete.id}`;

            await api.delete(endpoint);

            // Invalida as queries para atualizar a lista automaticamente
            if (entityToDelete.type === "ngo") {
                queryClient.invalidateQueries({ queryKey: ["admin-ongs"] });
                queryClient.invalidateQueries({ queryKey: ["ngos"] });
            } else if (entityToDelete.type === "vet") {
                queryClient.invalidateQueries({ queryKey: ["admin-vets"] });
                queryClient.invalidateQueries({ queryKey: ["vets"] });
            } else if (entityToDelete.type === "user") {
                queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            }

            setSuccessMessage(`${entityToDelete.name} excluído(a) com sucesso!`);
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (error) {
            console.error("Erro ao excluir registo:", error);
            setErrorMessage("Erro ao excluir o registo. Tente novamente.");
        } finally {
            setIsDeleting(false);
            setIsDeleteEntityModalOpen(false);
            setEntityToDelete(null);
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
            {/* Cabeçalho */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-['Manrope'] text-[#2D2D2D] mb-1">
                    Painel Administrativo
                </h1>
                <p className="text-sm text-[#6B7280]">
                    Gerencie ONGs parceiras, clínicas veterinárias e utilizadores do sistema.
                </p>
            </div>

            {successMessage && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-medium">
                    {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-medium">
                    {errorMessage}
                </div>
            )}

            {/* Abas de Navegação Admin */}
            <div className="flex items-center gap-2 pb-4 mb-8 border-b border-[#E4E4E1]">
                <button
                    onClick={() => setAdminTab("ongs")}
                    className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${adminTab === "ongs"
                        ? "bg-[#FF7A59] text-white shadow-sm"
                        : "bg-[#F4F4F2] text-[#6B7280] hover:bg-[#E4E4E1] hover:text-[#2D2D2D]"
                        }`}
                >
                    <FaBuildingNgo className="w-4 h-4" />
                    <span>ONGs ({ongsList.length})</span>
                </button>

                <button
                    onClick={() => setAdminTab("vets")}
                    className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${adminTab === "vets"
                        ? "bg-[#FF7A59] text-white shadow-sm"
                        : "bg-[#F4F4F2] text-[#6B7280] hover:bg-[#E4E4E1] hover:text-[#2D2D2D]"
                        }`}
                >
                    <FaKitMedical className="w-4 h-4" />
                    <span>Veterinários ({vetsList.length})</span>
                </button>

                <button
                    onClick={() => setAdminTab("users")}
                    className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${adminTab === "users"
                        ? "bg-[#FF7A59] text-white shadow-sm"
                        : "bg-[#F4F4F2] text-[#6B7280] hover:bg-[#E4E4E1] hover:text-[#2D2D2D]"
                        }`}
                >
                    <FaUsers className="w-4 h-4" />
                    <span>Utilizadores ({usersList.length})</span>
                </button>
            </div>

            {/* Conteúdo da Aba Ativa */}
            {isLoading ? (
                <p className="text-center py-12 text-[#6B7280]">Carregando dados do painel...</p>
            ) : (
                <div>
                    {/* Aba ONGs */}
                    {adminTab === "ongs" && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold text-[#2D2D2D]">ONGs Cadastradas</h2>
                                <button
                                    onClick={() => {
                                        setPartnerModalType("ngo");
                                        setSelectedPartner(null);
                                        setIsPartnerModalOpen(true);
                                    }}
                                    className="bg-[#FF7A59] hover:bg-[#e0694a] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                                >
                                    <FaPlus className="w-3.5 h-3.5" /> Adicionar ONG
                                </button>
                            </div>

                            {ongsList.length === 0 ? (
                                <p className="text-sm text-gray-500 italic py-8 text-center bg-[#F4F4F2] rounded-2xl">
                                    Nenhuma ONG cadastrada.
                                </p>
                            ) : (
                                <div className="grid gap-3">
                                    {ongsList.map((ong) => (
                                        <div key={ong.id} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E4E4E1] shadow-xs">
                                            <div className="flex items-center gap-3">
                                                {ong.image && (
                                                    <img src={ong.image} alt={ong.name} className="w-12 h-12 rounded-xl object-cover" />
                                                )}
                                                <div>
                                                    <h4 className="font-semibold text-[#2D2D2D] text-sm">{ong.name}</h4>
                                                    <p className="text-xs text-gray-500">{ong.city} • {ong.phone}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button

                                                    onClick={() => {
                                                        setPartnerModalType("ngo");
                                                        setSelectedPartner(ong);
                                                        setIsPartnerModalOpen(true);
                                                    }}
                                                    className="p-2 text-gray-500 hover:text-[#FF7A59] transition cursor-pointer"
                                                    title="Editar ONG"
                                                >
                                                    <FaPen className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEntityToDelete({ id: ong.id, name: ong.name, type: "ngo" });
                                                        setIsDeleteEntityModalOpen(true);
                                                    }}
                                                    className="p-2 text-gray-500 hover:text-red-500 transition cursor-pointer"
                                                    title="Excluir ONG"
                                                >
                                                    <FaTrash className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Aba Veterinários */}
                    {adminTab === "vets" && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold text-[#2D2D2D]">Clínicas e Veterinários</h2>
                                <button
                                    onClick={() => {
                                        setPartnerModalType("vet");
                                        setSelectedPartner(null);
                                        setIsPartnerModalOpen(true);
                                    }}
                                    className="bg-[#FF7A59] hover:bg-[#e0694a] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                                >
                                    <FaPlus className="w-3.5 h-3.5" /> Adicionar Veterinário
                                </button>
                            </div>

                            {vetsList.length === 0 ? (
                                <p className="text-sm text-gray-500 italic py-8 text-center bg-[#F4F4F2] rounded-2xl">
                                    Nenhum veterinário cadastrado.
                                </p>
                            ) : (
                                <div className="grid gap-3">
                                    {vetsList.map((vet) => (
                                        <div key={vet.id} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E4E4E1] shadow-xs">
                                            <div className="flex items-center gap-3">
                                                {vet.image && (
                                                    <img src={vet.image} alt={vet.name} className="w-12 h-12 rounded-xl object-cover" />
                                                )}
                                                <div>
                                                    <h4 className="font-semibold text-[#2D2D2D] text-sm">{vet.name}</h4>
                                                    <p className="text-xs text-gray-500">{vet.specialty}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setPartnerModalType("vet");
                                                        setSelectedPartner(vet);
                                                        setIsPartnerModalOpen(true);
                                                    }}
                                                    className="p-2 text-gray-500 hover:text-[#FF7A59] transition cursor-pointer"
                                                    title="Editar Veterinário"
                                                >
                                                    <FaPen className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEntityToDelete({ id: vet.id, name: vet.name, type: "vet" });
                                                        setIsDeleteEntityModalOpen(true);
                                                    }}
                                                    className="p-2 text-gray-500 hover:text-red-500 transition cursor-pointer"
                                                    title="Excluir Veterinário"
                                                >
                                                    <FaTrash className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Aba Usuários */}
                    {adminTab === "users" && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold text-[#2D2D2D]">Utilizadores do Sistema</h2>
                            </div>

                            {usersList.length === 0 ? (
                                <p className="text-sm text-gray-500 italic py-8 text-center bg-[#F4F4F2] rounded-2xl">
                                    Nenhum utilizador encontrado.
                                </p>
                            ) : (
                                <div className="grid gap-3">
                                    {usersList.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E4E4E1] shadow-xs">
                                            <div className="flex flex-row gap-3 items-center justify-between">
                                                {user.avatar ? (<img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-xl object-cover" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
                                                        <span className="text-gray-500 text-sm font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-semibold text-[#2D2D2D] text-sm">{user.name}</h4>
                                                    <p className="text-xs text-gray-500">{user.email} • <span className="uppercase font-semibold text-[#FF7A59]">{user.role}</span></p>
                                                </div>

                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenDetails(user)}
                                                    className="p-2 text-[#6B7280] hover:text-[#FF7A59] hover:bg-[#FF7A59]/10 rounded-xl transition cursor-pointer"
                                                    title="Visualizar dados"
                                                >
                                                    <FaEye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEntityToDelete({ id: user.id, name: user.name, type: "user" });
                                                        setIsDeleteEntityModalOpen(true);
                                                    }}
                                                    className="p-2 text-gray-500 hover:text-red-500 transition cursor-pointer"
                                                    title="Excluir Utilizador"
                                                >
                                                    <FaTrash className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <PartnerFormModal
                isOpen={isPartnerModalOpen}
                onClose={() => {
                    setIsPartnerModalOpen(false);
                    setSelectedPartner(null);
                }}
                type={partnerModalType}
                initialData={selectedPartner}
            />

            <ConfirmModal
                isOpen={isDeleteEntityModalOpen}
                title="Excluir registo?"
                message={`Tem certeza que deseja remover "${entityToDelete?.name}" permanentemente?`}
                confirmText={isDeleting ? "Excluindo..." : "Excluir"}
                cancelText="Cancelar"
                onConfirm={handleDeleteEntity}
                onCancel={() => {
                    if (!isDeleting) {
                        setIsDeleteEntityModalOpen(false);
                        setEntityToDelete(null);
                    }
                }}
            />

            <UserDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
            />
        </div>
    );
}