import { useState, useEffect } from "react";
import { FaXmark, FaPaw, FaCheck, FaCircle, FaCamera } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { AxiosError } from "axios";
import { ZodError, z } from "zod";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google"; // <--- Importado do Google
import { formatPhone } from "../utils/formatPhone";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { uploadToCloudinary } from "../services/cloudinary";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { LocationAutocomplete } from "../components/LocationAutocomplete";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: "signin" | "signup";
}

const signInSchema = z.object({
    email: z.string().email("Informe um e-mail válido"),
    password: z.string().min(1, "Informe sua senha"),
});

const signUpSchema = z.object({
    name: z.string().trim().min(1, "Informe seu nome completo"),
    email: z.string().email("Informe um e-mail válido"),
    password: z
        .string()
        .min(8, "A senha deve ter pelo menos 8 caracteres")
        .regex(/(?=.*[A-Z])/, "A senha deve conter pelo menos uma letra maiúscula")
        .regex(/(?=.*[a-z])/, "A senha deve conter pelo menos uma letra minúscula")
        .regex(/(?=.*\d)/, "A senha deve conter pelo menos um número")
        .regex(/(?=.*[@$!%*?&#_])/, "A senha deve conter pelo menos um caractere especial (@$!%*?&#_)"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

export function AuthModal({ isOpen, onClose, initialMode = "signin" }: AuthModalProps) {
    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <AuthModalContent isOpen={isOpen} onClose={onClose} initialMode={initialMode} />
        </GoogleOAuthProvider>
    );
}

// Componente interno para isolar os hooks do Google OAuth Provider
function AuthModalContent({ isOpen, onClose, initialMode = "signin" }: AuthModalProps) {
    const { save, updateSession } = useAuth();
    const [mode, setMode] = useState<"signin" | "signup" | "complete-profile">(initialMode);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [phone, setPhone] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [bio, setBio] = useState("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&#_]/.test(password);

    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            resetForm();
            setSuccessMessage(null);
        }
    }, [isOpen, initialMode]);

    function resetForm() {
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setPhone("");
        setCity("");
        setState("");
        setBio("");
        setAvatarFile(null);
        setAvatarPreview(null);
        setErrorMessage(null);
    }

    function handleSwitchMode(newMode: "signin" | "signup") {
        resetForm();
        setSuccessMessage(null);
        setMode(newMode);
    }

    function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    }

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setIsLoading(true);

                const response = await api.post("/sessions/google", {
                    token: tokenResponse.access_token,
                });

                const payload = response.data.user
                    ? response.data
                    : { token: response.data.token, user: response.data };

                save(payload);
                setIsLoading(false);
                onClose();
            } catch (error) {
                if (error instanceof AxiosError) {
                    setErrorMessage(error.response?.data?.message || "Erro ao autenticar com o Google.");
                } else {
                    setErrorMessage("Erro inesperado no login com Google.");
                }
                setIsLoading(false);
            }
        },
        onError: () => {
            setErrorMessage("Falha ao comunicar com o Google.");
        },
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);
        setIsLoading(true);

        try {
            if (mode === "signin") {
                const validatedData = signInSchema.parse({ email, password });
                const response = await api.post("/sessions", validatedData);
                const payload = response.data.user
                    ? response.data
                    : { token: response.data.token, user: response.data };
                save(payload);
                onClose();
            }
            else if (mode === "signup") {
                const validatedData = signUpSchema.parse({ name, email, password, confirmPassword });
                const { confirmPassword: _, ...apiData } = validatedData;

                await api.post("/users", apiData);

                const sessionResponse = await api.post("/sessions", { email, password });
                const payload = sessionResponse.data.user
                    ? sessionResponse.data
                    : { token: sessionResponse.data.token, user: sessionResponse.data };

                save(payload);

                setName(apiData.name);
                setEmail(apiData.email);

                setMode("complete-profile");
                setIsLoading(false);
            }
            else if (mode === "complete-profile") {
                let avatarUrl = null;

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

                setIsLoading(false);
                onClose();
            }
        } catch (error) {
            if (error instanceof ZodError) {
                setErrorMessage(error.issues[0].message);
            } else if (error instanceof AxiosError) {
                setErrorMessage(error.response?.data?.message || "Ocorreu um erro no servidor.");
            } else {
                setErrorMessage("Erro inesperado. Tente novamente.");
            }
            setIsLoading(false);
        } finally {
            if (mode !== "signup" && mode !== "complete-profile") {
                setIsLoading(false);
            }
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sans">
            <div className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative text-[#2D2D2D] max-h-[90vh] overflow-y-auto">

                <button
                    onClick={onClose}
                    type="button"
                    className="absolute top-5 right-5 text-[#6B7280] hover:text-[#2D2D2D] p-2.5 rounded-xl hover:bg-[#F4F4F2] transition cursor-pointer"
                >
                    <FaXmark className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center mb-6">
                    <div className="p-3.5 bg-[#FF7A59]/10 rounded-2xl mb-3 text-[#FF7A59]">
                        <FaPaw className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold font-['Manrope'] text-[#2D2D2D] tracking-tight">
                        {mode === "signin" && "Bem-vindo de volta!"}
                        {mode === "signup" && "Crie sua conta"}
                        {mode === "complete-profile" && "Complete seu perfil!"}
                    </h2>
                    <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                        {mode === "signin" && "Acesse sua conta para continuar no Adote2Pets"}
                        {mode === "signup" && "Cadastre-se para anunciar ou adotar um pet"}
                        {mode === "complete-profile" && "Adicione mais detalhes para que outros usuários conheçam você melhor."}
                    </p>
                </div>

                {mode !== "complete-profile" && (
                    <div className="grid grid-cols-2 bg-[#F4F4F2] p-1.5 rounded-2xl mb-6 border border-[#E4E4E1] text-sm font-semibold">
                        <button
                            type="button"
                            onClick={() => handleSwitchMode("signin")}
                            className={`py-2.5 rounded-xl transition cursor-pointer ${mode === "signin"
                                ? "bg-[#FF7A59] text-white shadow-xs"
                                : "text-[#6B7280] hover:text-[#2D2D2D]"
                                }`}
                        >
                            Entrar
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSwitchMode("signup")}
                            className={`py-2.5 rounded-xl transition cursor-pointer ${mode === "signup"
                                ? "bg-[#FF7A59] text-white shadow-xs"
                                : "text-[#6B7280] hover:text-[#2D2D2D]"
                                }`}
                        >
                            Cadastrar
                        </button>
                    </div>
                )}

                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl mb-4 text-center font-medium animate-fadeIn">
                        {errorMessage}
                    </div>
                )}

                {successMessage && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl mb-4 text-center font-medium animate-fadeIn">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    {mode !== "complete-profile" && (
                        <>
                            {mode === "signup" && (
                                <Input
                                    required
                                    legend="Nome Completo"
                                    placeholder="Seu nome"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            )}

                            <Input
                                required
                                legend="E-mail"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <Input
                                required
                                legend="Senha"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            {mode === "signup" && password.length > 0 && (
                                <div className="bg-[#F4F4F2] border border-[#E4E4E1] p-3 rounded-2xl flex flex-col gap-1.5 text-[11px]">
                                    <p className="font-semibold text-[#2D2D2D] mb-0.5">Requisitos da senha:</p>
                                    <div className={`flex items-center gap-2 ${hasMinLength ? "text-emerald-600 font-medium" : "text-[#6B7280]"}`}>
                                        {hasMinLength ? <FaCheck className="w-3 h-3" /> : <FaCircle className="w-1.5 h-1.5" />}
                                        <span>Mínimo de 8 caracteres</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${hasUpperCase ? "text-emerald-600 font-medium" : "text-[#6B7280]"}`}>
                                        {hasUpperCase ? <FaCheck className="w-3 h-3" /> : <FaCircle className="w-1.5 h-1.5" />}
                                        <span>Pelo menos uma letra maiúscula</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${hasLowerCase ? "text-emerald-600 font-medium" : "text-[#6B7280]"}`}>
                                        {hasLowerCase ? <FaCheck className="w-3 h-3" /> : <FaCircle className="w-1.5 h-1.5" />}
                                        <span>Pelo menos uma letra minúscula</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${hasNumber ? "text-emerald-600 font-medium" : "text-[#6B7280]"}`}>
                                        {hasNumber ? <FaCheck className="w-3 h-3" /> : <FaCircle className="w-1.5 h-1.5" />}
                                        <span>Pelo menos um número</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${hasSpecialChar ? "text-emerald-600 font-medium" : "text-[#6B7280]"}`}>
                                        {hasSpecialChar ? <FaCheck className="w-3 h-3" /> : <FaCircle className="w-1.5 h-1.5" />}
                                        <span>Pelo menos um caractere especial (@$!%*?&#_)</span>
                                    </div>
                                </div>
                            )}

                            {mode === "signup" && (
                                <>
                                    <Input
                                        required
                                        legend="Confirmar Senha"
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    {confirmPassword.length > 0 && (
                                        <p className={`text-[11px] font-medium -mt-2 ${password === confirmPassword ? "text-emerald-600" : "text-amber-600"}`}>
                                            {password === confirmPassword ? "As senhas coincidem!" : "As senhas ainda não são iguais."}
                                        </p>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {mode === "complete-profile" && (
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col items-center justify-center mb-2">
                                <label className="relative cursor-pointer group">
                                    <div className="w-20 h-20 rounded-full bg-[#F4F4F2] border-2 border-dashed border-[#E4E4E1] flex items-center justify-center overflow-hidden shadow-xs transition group-hover:border-[#FF7A59]">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <FaCamera className="w-6 h-6 text-[#6B7280] group-hover:text-[#FF7A59]" />
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                </label>
                                <span className="text-[11px] text-[#6B7280] mt-1">Adicionar foto de perfil</span>
                            </div>

                            <Input
                                legend="Celular / WhatsApp"
                                placeholder="(41) 99999-9999"
                                value={phone}
                                onChange={(e) => setPhone(formatPhone(e.target.value))}
                            />

                            <LocationAutocomplete
                                city={city}
                                state={state}
                                onChange={(newCity, newState) => {
                                    setCity(newCity);
                                    setState(newState);
                                }}
                            />

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[#2D2D2D]">Sobre você / Bio</label>
                                <textarea
                                    rows={3}
                                    placeholder="Conte um pouco sobre você e sua paixão por pets..."
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl p-3 text-xs text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition resize-none"
                                />
                            </div>
                        </div>
                    )}

                    <Button
                        type="submit"
                        isLoading={isLoading}
                        className="mt-2 bg-[#FF7A59] hover:bg-[#e0694a] text-white font-semibold py-3 rounded-2xl shadow-sm text-sm transition cursor-pointer"
                    >
                        {mode === "signin" && "Entrar"}
                        {mode === "signup" && "Criar Conta"}
                        {mode === "complete-profile" && "Salvar e Continuar"}
                    </Button>

                    {mode === "complete-profile" && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-2.5 text-xs text-[#6B7280] hover:text-[#2D2D2D] font-semibold transition cursor-pointer"
                        >
                            Completar depois
                        </button>
                    )}

                    {mode !== "complete-profile" && (
                        <>
                            <div className="relative my-2 flex items-center justify-center">
                                <div className="w-full border-t border-[#E4E4E1]" />
                                <span className="absolute bg-[#FAFAF8] px-3 text-[10px] uppercase text-[#6B7280] font-semibold tracking-wider">
                                    ou
                                </span>
                            </div>

                            {/* Botão do Google integrado via hook mantendo o seu visual customizado */}
                            <button
                                type="button"
                                onClick={() => googleLogin()}
                                className="w-full flex items-center justify-center gap-2.5 bg-[#F4F4F2] hover:bg-[#E4E4E1] text-[#2D2D2D] font-semibold py-3 px-4 rounded-2xl text-sm transition cursor-pointer border border-[#E4E4E1] shadow-xs"
                            >
                                <FcGoogle className="w-5 h-5" />
                                <span>Continuar com o Google</span>
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}