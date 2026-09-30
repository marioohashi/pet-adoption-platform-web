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

export function Settings() {
    const { session, updateSession, remove } = useAuth();
    const navigate = useNavigate();

    const currentUser = session?.user;

    // Estados para o formulário de perfil e avatar
    const [name, setName] = useState(currentUser?.name || "");
    const [email, setEmail] = useState(currentUser?.email || "");
    const [phone, setPhone] = useState(currentUser?.phone || "");
    const [city, setCity] = useState(currentUser?.city || "");
    const [state, setState] = useState(currentUser?.state || "");
    const [bio, setBio] = useState(currentUser?.bio || "");

    // Estados para o Avatar
    const [avatarPreview, setAvatarPreview] = useState<string | null>(currentUser?.avatar || null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    // Estados para segurança (senha)
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);

    // Atualiza os estados locais se a sessão mudar
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

    // Manipular seleção de nova foto de perfil
    function handleSelectAvatar(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    }

    // Atualizar perfil completo (Dados + Avatar)
    async function handleUpdateProfile(e: React.FormEvent) {
        e.preventDefault();
        try {
            setLoadingProfile(true);
            let avatarUrl = currentUser?.avatar;

            // Se o usuário selecionou uma nova foto, faz o upload para o Cloudinary primeiro
            if (avatarFile) {
                avatarUrl = await uploadToCloudinary(avatarFile);
            }

            // Envia os dados atualizados para a rota de atualização do usuário
            const response = await api.put("/users/me", {
                name,
                email,
                phone,
                city,
                state,
                bio,
                avatar: avatarUrl,
            });

            // 👈 É AQUI QUE VOCÊ CHAMA:
            // (Lembre-se de desestruturar o updateSession lá no topo do seu componente junto com o useAuth)
            if (updateSession && response.data) {
                updateSession(response.data);
            }

            alert("Perfil atualizado com sucesso!");
            setAvatarFile(null);
        } catch (error: any) {
            console.error("Erro ao salvar perfil", error);
            alert(error.response?.data?.message || "Erro ao atualizar perfil.");
        } finally {
            setLoadingProfile(false);
        }
    }
    // Atualizar senha
    async function handleUpdatePassword(e: React.FormEvent) {
        e.preventDefault();
        try {
            setLoadingPassword(true);
            await userService.updatePassword({ oldPassword, newPassword });
            alert("Senha alterada com sucesso!");
            setOldPassword("");
            setNewPassword("");
        } catch (error: any) {
            alert(error.response?.data?.message || "Erro ao alterar senha.");
        } finally {
            setLoadingPassword(false);
        }
    }

    // Excluir conta
    async function handleDeleteAccount() {
        const confirmed = window.confirm("Tem certeza que deseja excluir sua conta? Esta ação é irreversível.");
        if (!confirmed) return;

        try {
            await userService.deleteAccount();
            remove();
            navigate("/");
            alert("Conta excluída com sucesso.");
        } catch (error: any) {
            alert(error.response?.data?.message || "Erro ao excluir conta.");
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

            {/* Accordion controlando as seções principais */}
            <Accordion defaultValue={["profile"]} className="space-y-4">
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

                        {/* Foto de Perfil */}
                        <div className="flex items-center gap-6 pt-2">
                            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#F4F4F2] border-2 border-[#E4E4E1] shadow-xs group flex-shrink-0">
                                {getAvatarSrc() ? (
                                    <img
                                        src={getAvatarSrc()!}
                                        alt={currentUser?.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#FF7A59]/10 flex items-center justify-center text-[#FF7A59] font-bold text-2xl">
                                        {currentUser?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer">
                                    <FaCamera className="w-5 h-5 mb-0.5" />
                                    <span className="text-[9px] font-semibold">Alterar</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleSelectAvatar}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <div>
                                <p className="font-bold text-gray-950 text-base">{currentUser?.name}</p>
                                <p className="text-sm text-gray-500">{currentUser?.email}</p>
                                <span className="inline-block mt-1.5 text-xs px-2.5 py-0.5 bg-[#FF7A59]/10 text-[#FF7A59] rounded-full uppercase font-bold tracking-wide">
                                    {currentUser?.role || "Usuário"}
                                </span>
                                {avatarFile && (
                                    <p className="text-xs text-amber-600 mt-2 font-medium">
                                        ⚠️ Nova foto selecionada. Clique em "Salvar Alterações" para confirmar.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Formulário de Dados Pessoais */}
                        <form onSubmit={handleUpdateProfile} className="grid gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Nome</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-4 py-3 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition shadow-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">E-mail</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-4 py-3 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition shadow-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Telefone / WhatsApp</label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="(41) 99999-9999"
                                        className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-4 py-3 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition shadow-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Cidade</label>
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-4 py-3 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition shadow-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Estado (UF)</label>
                                    <input
                                        type="text"
                                        maxLength={2}
                                        value={state}
                                        onChange={(e) => setState(e.target.value.toUpperCase())}
                                        className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-4 py-3 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition shadow-xs"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Sobre você / Bio</label>
                                <textarea
                                    rows={3}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Conte um pouco sobre você ou sua atuação com resgate e adoção..."
                                    className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl p-3 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition resize-none shadow-xs"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loadingProfile}
                                className="bg-[#FF7A59] hover:bg-[#e0694a] text-white px-6 py-3 rounded-2xl transition font-semibold text-sm w-fit shadow-sm cursor-pointer disabled:opacity-50"
                            >
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
                        <form onSubmit={handleUpdatePassword} className="grid gap-4 pt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Senha Atual</label>
                                    <input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-4 py-3 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition shadow-xs"
                                        placeholder="••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Nova Senha</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-4 py-3 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition shadow-xs"
                                        placeholder="••••••"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loadingPassword}
                                className="bg-[#2D2D2D] hover:bg-black text-white px-6 py-3 rounded-2xl transition font-semibold text-sm w-fit shadow-sm cursor-pointer disabled:opacity-50"
                            >
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
                        <button
                            type="button"
                            onClick={handleDeleteAccount}
                            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-2xl transition font-semibold text-sm shadow-sm cursor-pointer"
                        >
                            Excluir Conta
                        </button>
                    </AccordionContent>
                </AccordionItem>

            </Accordion>

            {/* Painel Administrativo Condicional (Fora do Acordeon para manter acesso direto se for admin) */}
            {currentUser?.role === "admin" && (
                <div className="mt-6 bg-white rounded-3xl border border-amber-200 p-6 shadow-xs">
                    <h2 className="font-semibold text-lg text-amber-700 mb-4">
                        Administração da Plataforma
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button type="button" className="p-4 text-left border border-amber-100 bg-amber-50/50 rounded-2xl hover:bg-amber-100/50 transition font-medium text-amber-900 cursor-pointer text-sm">
                            Gerenciar Usuários
                        </button>
                        <button type="button" className="p-4 text-left border border-amber-100 bg-amber-50/50 rounded-2xl hover:bg-amber-100/50 transition font-medium text-amber-900 cursor-pointer text-sm">
                            Gerenciar Pets
                        </button>
                        <button type="button" className="p-4 text-left border border-amber-100 bg-amber-50/50 rounded-2xl hover:bg-amber-100/50 transition font-medium text-amber-900 cursor-pointer text-sm">
                            Gerenciar ONGs
                        </button>
                        <button type="button" className="p-4 text-left border border-amber-100 bg-amber-50/50 rounded-2xl hover:bg-amber-100/50 transition font-medium text-amber-900 cursor-pointer text-sm">
                            Denúncias e Moderação
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}