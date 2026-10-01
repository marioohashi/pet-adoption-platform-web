import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { userService } from "../services/userService";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../services/cloudinary";
import { api } from "../services/api";
import { FaCamera, FaUser, FaShieldHalved, FaTriangleExclamation } from "react-icons/fa6";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "../components/ui/accordion";
import { LocationAutocomplete } from "../components/LocationAutocomplete";
import { ConfirmModal } from "../modals/ConfirmModal";
import { formatPhone } from "../utils/formatPhone"

export function Settings() {
    const { session, updateSession, remove } = useAuth();
    const navigate = useNavigate();

    const currentUser = session?.user;

    const [name, setName] = useState(currentUser?.name || "");
    const [email, setEmail] = useState(currentUser?.email || "");
    const [phone, setPhone] = useState(currentUser?.phone || "");
    const [city, setCity] = useState(currentUser?.city || "");
    const [state, setState] = useState(currentUser?.state || "");
    const [bio, setBio] = useState(currentUser?.bio || "");

    const [avatarPreview, setAvatarPreview] = useState<string | null>(currentUser?.avatar || null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);

    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name || "");
            setEmail(currentUser.email || "");
            setPhone(currentUser.phone || "");
            setCity(currentUser.city || "");
            setState(currentUser.state || "");
            setBio(currentUser.bio || "");
            setAvatarPreview(currentUser.avatar || null);
        }
    }, [currentUser]);



    function handleSelectAvatar(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    }

    async function handleUpdateProfile(e: React.FormEvent) {
        e.preventDefault();
        try {
            setLoadingProfile(true);
            setSuccessMessage(null);
            let avatarUrl = currentUser?.avatar;

            if (avatarFile) {
                avatarUrl = await uploadToCloudinary(avatarFile);
            }


            const response = await api.put("/users/me", {
                name,
                email,
                phone,
                city,
                state,
                bio,
                avatar: avatarUrl,
            });

            if (updateSession && response.data) {
                updateSession(response.data);
            }

            setAvatarFile(null);
            setSuccessMessage("Perfil atualizado com sucesso!");
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (error: any) {
            console.error("Erro ao salvar perfil", error);
            alert(error.response?.data?.message || "Erro ao atualizar perfil.");
        } finally {
            setLoadingProfile(false);
        }
    }

    function handlePasswordSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("As senhas novas não coincidem. Por favor, verifique.");
            return;
        }
        if (newPassword.length < 6) {
            alert("A nova senha precisa ter pelo menos 6 caracteres.");
            return;
        }
        setIsPasswordModalOpen(true);
    }

    async function confirmUpdatePassword() {
        try {
            setLoadingPassword(true);
            await userService.updatePassword({ oldPassword, newPassword });
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setIsPasswordModalOpen(false);
            alert("Senha alterada com sucesso!");
        } catch (error: any) {
            alert(error.response?.data?.message || "Erro ao alterar senha.");
        } finally {
            setLoadingPassword(false);
        }
    }

    async function confirmDeleteAccount() {
        try {
            await userService.deleteAccount();
            remove();
            navigate("/");
        } catch (error: any) {
            alert(error.response?.data?.message || "Erro ao excluir conta.");
        } finally {
            setIsDeleteModalOpen(false);
        }
    }

    const getAvatarSrc = () => {
        if (!avatarPreview) return null;
        if (avatarPreview.startsWith("blob:") || avatarPreview.startsWith("http")) {
            return avatarPreview;
        }
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';
        return `${baseUrl}/files/${avatarPreview}`;
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-['Manrope'] text-[#2D2D2D]">
                    Configurações da Conta
                </h1>
                <p className="text-[#6B7280] mt-2">
                    Gerencie suas informações pessoais, segurança e preferências.
                </p>
            </div>

            {successMessage && (
                <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs animate-fade-in">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">{successMessage}</span>
                    </div>
                    <button
                        onClick={() => setSuccessMessage(null)}
                        className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer"
                    >
                        ✕
                    </button>
                </div>
            )}

            <Accordion defaultValue={["profile"]} className="space-y-4">

                {/* Seção 1: Informações Pessoais & Avatar */}
                <AccordionItem value="profile" className="bg-white rounded-3xl border border-[#E4E4E1] px-6 shadow-xs overflow-hidden">
                    <AccordionTrigger className="hover:no-underline py-5 cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[#FF7A59]/10 rounded-2xl text-[#FF7A59]">
                                <FaUser className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h2 className="font-semibold text-base text-[#2D2D2D]">Informações Pessoais & Avatar</h2>
                                <p className="text-xs text-[#6B7280]">Atualize sua foto, nome, bio e dados de contato</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 pt-2 border-t border-[#E4E4E1] space-y-6">
                        <div className="flex items-center gap-6 pt-2">
                            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#F4F4F2] border-2 border-[#E4E4E1] shadow-xs group flex-shrink-0">
                                {getAvatarSrc() ? (
                                    <img src={getAvatarSrc()!} alt={currentUser?.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-[#FF7A59]/10 flex items-center justify-center text-[#FF7A59] font-bold text-2xl">
                                        {currentUser?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer">
                                    <FaCamera className="w-5 h-5 mb-0.5" />
                                    <span className="text-[9px] font-semibold">Alterar</span>
                                    <input type="file" accept="image/*" onChange={handleSelectAvatar} className="hidden" />
                                </label>
                            </div>
                            <div>
                                <p className="font-bold text-gray-950 text-base">{currentUser?.name}</p>
                                <p className="text-sm text-gray-500">{currentUser?.email}</p>
                                <span className="inline-block mt-1.5 text-xs px-2.5 py-0.5 bg-[#FF7A59]/10 text-[#FF7A59] rounded-full uppercase font-bold tracking-wide">
                                    {currentUser?.role || "Usuário"}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="grid gap-4" >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Nome</label>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-4 py-3 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition shadow-xs" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">E-mail</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-4 py-3 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition shadow-xs" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-4">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Celular</label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => {
                                            setPhone(formatPhone(e.target.value));
                                        }}
                                        placeholder="(41) 99999-9999"
                                        className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-4 py-3 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition shadow-xs"
                                    />
                                </div>

                                <div className="md:col-span-4">
                                    <LocationAutocomplete
                                        city={city}
                                        state={state}
                                        onChange={(newCity, newState) => {
                                            setCity(newCity);
                                            setState(newState);
                                        }}
                                    />
                                </div>

                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Sobre você / Bio</label>
                                <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Conte um pouco sobre você ou sua atuação..." className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl p-3 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition resize-none shadow-xs" />
                            </div>

                            <button type="submit" disabled={loadingProfile} className="bg-[#FF7A59] hover:bg-[#e0694a] text-white px-6 py-3 rounded-2xl transition font-semibold text-sm w-fit shadow-sm cursor-pointer disabled:opacity-50">
                                {loadingProfile ? "Salvando Alterações..." : "Salvar Alterações"}
                            </button>
                        </form>
                    </AccordionContent>
                </AccordionItem>

                {/* Seção 2: Segurança */}
                <AccordionItem value="security" className="bg-white rounded-3xl border border-[#E4E4E1] px-6 shadow-xs overflow-hidden">
                    <AccordionTrigger className="hover:no-underline py-5 cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-500/10 rounded-2xl text-blue-600">
                                <FaShieldHalved className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h2 className="font-semibold text-base text-[#2D2D2D]">Segurança</h2>
                                <p className="text-xs text-[#6B7280]">Altere sua senha de acesso à plataforma</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 pt-2 border-t border-[#E4E4E1]">
                        <form onSubmit={handlePasswordSubmit} className="grid gap-4 pt-2">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Senha Atual</label>
                                <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-4 py-3 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition shadow-xs" placeholder="••••••" required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Nova Senha</label>
                                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-4 py-3 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition shadow-xs" placeholder="••••••" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Confirmar Nova Senha</label>
                                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full bg-[#F4F4F2] border rounded-2xl px-4 py-3 text-sm text-[#2D2D2D] focus:outline-none transition shadow-xs ${confirmPassword && newPassword !== confirmPassword ? "border-red-400 focus:border-red-500" : "border-[#E4E4E1] focus:border-[#FF7A59]"}`} placeholder="••••••" required />
                                </div>
                            </div>

                            {confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-xs text-red-500 font-medium">As senhas não coincidem.</p>
                            )}

                            <button type="submit" disabled={loadingPassword || (confirmPassword !== "" && newPassword !== confirmPassword)} className="bg-[#2D2D2D] hover:bg-black text-white px-6 py-3 rounded-2xl transition font-semibold text-sm w-fit shadow-sm cursor-pointer disabled:opacity-50">
                                {loadingPassword ? "Alterando..." : "Alterar Senha"}
                            </button>
                        </form>
                    </AccordionContent>
                </AccordionItem>

                {/* Seção 3: Zona de Perigo */}
                <AccordionItem value="danger" className="bg-white rounded-3xl border border-red-200 px-6 shadow-xs overflow-hidden">
                    <AccordionTrigger className="hover:no-underline py-5 cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-red-500/10 rounded-2xl text-red-600">
                                <FaTriangleExclamation className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h2 className="font-semibold text-base text-red-600">Zona de Perigo</h2>
                                <p className="text-xs text-[#6B7280]">Ações irreversíveis para a sua conta</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 pt-2 border-t border-red-100">
                        <p className="text-sm text-gray-600 mb-4 pt-2">
                            A exclusão da conta é permanente e removerá todos os seus dados associados à plataforma.
                        </p>
                        <button type="button" onClick={() => setIsDeleteModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-2xl transition font-semibold text-sm shadow-sm cursor-pointer">
                            Excluir Conta
                        </button>
                    </AccordionContent>
                </AccordionItem>

            </Accordion>

            {/* Modais de Confirmação */}
            <ConfirmModal isOpen={isPasswordModalOpen} title="Alterar sua senha?" message="Você tem certeza de que deseja atualizar sua senha de acesso à plataforma?" confirmText="Sim, Alterar Senha" cancelText="Cancelar" onConfirm={confirmUpdatePassword} onCancel={() => setIsPasswordModalOpen(false)} />
            <ConfirmModal isOpen={isDeleteModalOpen} title="Excluir sua conta?" message="Esta ação é permanente e irreversível. Todos os seus dados e registros associados na plataforma serão apagados." confirmText="Sim, Excluir Conta" cancelText="Cancelar" onConfirm={confirmDeleteAccount} onCancel={() => setIsDeleteModalOpen(false)} />
        </div>
    );
}