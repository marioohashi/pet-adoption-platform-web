import { useState, useEffect } from "react";
import { FaXmark, FaPaw } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { AxiosError } from "axios";
import { ZodError, z } from "zod";

import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

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
    password: z.string().min(6, "A senha deve ter pelo menos 6 dígitos"),
});

export function AuthModal({ isOpen, onClose, initialMode = "signin" }: AuthModalProps) {
    // 1. TODOS OS HOOKS DEVEM FICAR NO TOPO DO COMPONENTE
    const { save } = useAuth();
    const [mode, setMode] = useState<"signin" | "signup">(initialMode);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Sincroniza a aba (Entrar/Cadastrar) sempre que o modal for aberto
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            resetForm();
        }
    }, [isOpen, initialMode]);

    function resetForm() {
        setName("");
        setEmail("");
        setPassword("");
        setErrorMessage(null);
    }

    function handleSwitchMode(newMode: "signin" | "signup") {
        resetForm();
        setMode(newMode);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMessage(null);
        setIsLoading(true);

        try {
            if (mode === "signin") {
                const validatedData = signInSchema.parse({ email, password });

                // Requisição de login na API
                const response = await api.post("/sessions", validatedData);

                // Garante a estrutura { token, user } esperada pelo AuthProvider
                const payload = response.data.user
                    ? response.data
                    : { token: response.data.token, user: response.data };

                // Atualiza o estado global no AuthProvider
                save(payload);

                // Fecha o modal
                onClose();
            } else {
                const validatedData = signUpSchema.parse({ name, email, password });

                await api.post("/users", validatedData);

                // Após cadastrar com sucesso, alterna para a aba de login
                setMode("signin");
                setErrorMessage(null);
            }
        } catch (error) {
            if (error instanceof ZodError) {
                setErrorMessage(error.issues[0].message);
            } else if (error instanceof AxiosError) {
                setErrorMessage(error.response?.data?.message || "Ocorreu um erro no servidor.");
            } else {
                setErrorMessage("Erro inesperado. Tente novamente.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    // 2. RETORNO CONDICIONAL FICA APÓS TODOS OS HOOKS
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sans">
            <div className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative text-[#2D2D2D]">

                {/* Botão Fechar */}
                <button
                    onClick={onClose}
                    type="button"
                    className="absolute top-5 right-5 text-[#6B7280] hover:text-[#2D2D2D] p-2.5 rounded-xl hover:bg-[#F4F4F2] transition cursor-pointer"
                >
                    <FaXmark className="w-5 h-5" />
                </button>

                {/* Cabeçalho */}
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="p-3.5 bg-[#FF7A59]/10 rounded-2xl mb-3 text-[#FF7A59]">
                        <FaPaw className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold font-['Manrope'] text-[#2D2D2D] tracking-tight">
                        {mode === "signin" ? "Bem-vindo de volta!" : "Crie sua conta"}
                    </h2>
                    <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                        {mode === "signin"
                            ? "Acesse sua conta para continuar no Adote2Pets"
                            : "Cadastre-se para anunciar ou adotar um pet"}
                    </p>
                </div>

                {/* Alternador de Abas */}
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

                {/* Mensagem de Erro */}
                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl mb-4 text-center font-medium">
                        {errorMessage}
                    </div>
                )}

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

                    <Button
                        type="submit"
                        isLoading={isLoading}
                        className="mt-2 bg-[#FF7A59] hover:bg-[#e0694a] text-white font-semibold py-3 rounded-2xl shadow-sm text-sm transition"
                    >
                        {mode === "signin" ? "Entrar" : "Criar Conta"}
                    </Button>

                    {/* Divisor */}
                    <div className="relative my-2 flex items-center justify-center">
                        <div className="w-full border-t border-[#E4E4E1]" />
                        <span className="absolute bg-[#FAFAF8] px-3 text-[10px] uppercase text-[#6B7280] font-semibold tracking-wider">
                            ou
                        </span>
                    </div>

                    {/* Botão Google */}
                    <button
                        type="button"
                        onClick={() => (window.location.href = "http://localhost:3333/auth/google")}
                        className="w-full flex items-center justify-center gap-2.5 bg-[#F4F4F2] hover:bg-[#E4E4E1] text-[#2D2D2D] font-semibold py-3 px-4 rounded-2xl text-sm transition cursor-pointer border border-[#E4E4E1] shadow-xs"
                    >
                        <FcGoogle className="w-5 h-5" />
                        <span>Continuar com o Google</span>
                    </button>
                </form>

            </div>
        </div>
    );
}