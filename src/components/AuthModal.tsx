import { useState, useEffect } from "react";
import { FaXmark, FaPaw } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { AxiosError } from "axios";
import { ZodError, z } from "zod";

import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { Input } from "./Input";
import { Button } from "./Button";

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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-gray-800 border border-gray-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-gray-100">

                {/* Botão Fechar */}
                <button
                    onClick={onClose}
                    type="button"
                    className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700/50 transition cursor-pointer"
                >
                    <FaXmark className="w-5 h-5" />
                </button>

                {/* Cabeçalho */}
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="p-3 bg-amber-500/10 rounded-2xl mb-2 text-amber-400">
                        <FaPaw className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                        {mode === "signin" ? "Bem-vindo de volta!" : "Crie sua conta"}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {mode === "signin"
                            ? "Acesse sua conta para continuar no Aumatch"
                            : "Cadastre-se para anunciar ou adotar um pet"}
                    </p>
                </div>

                {/* Alternador de Abas */}
                <div className="grid grid-cols-2 bg-gray-900/60 p-1 rounded-xl mb-6 border border-gray-700/50 text-sm font-semibold">
                    <button
                        type="button"
                        onClick={() => handleSwitchMode("signin")}
                        className={`py-2 rounded-lg transition cursor-pointer ${mode === "signin"
                                ? "bg-amber-500 text-gray-950 shadow-sm"
                                : "text-gray-400 hover:text-white"
                            }`}
                    >
                        Entrar
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSwitchMode("signup")}
                        className={`py-2 rounded-lg transition cursor-pointer ${mode === "signup"
                                ? "bg-amber-500 text-gray-950 shadow-sm"
                                : "text-gray-400 hover:text-white"
                            }`}
                    >
                        Cadastrar
                    </button>
                </div>

                {/* Mensagem de Erro */}
                {errorMessage && (
                    <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-xs p-3 rounded-lg mb-4 text-center">
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

                    <Button type="submit" isLoading={isLoading} className="mt-2 bg-amber-500 hover:bg-amber-600">
                        {mode === "signin" ? "Entrar" : "Criar Conta"}
                    </Button>

                    {/* Divisor */}
                    <div className="relative my-1 flex items-center justify-center">
                        <div className="w-full border-t border-gray-700" />
                        <span className="absolute bg-gray-800 px-3 text-[10px] uppercase text-gray-400 font-medium">
                            ou
                        </span>
                    </div>

                    {/* Botão Google */}
                    <button
                        type="button"
                        onClick={() => (window.location.href = "http://localhost:3333/auth/google")}
                        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2.5 px-4 rounded-lg text-sm transition cursor-pointer"
                    >
                        <FcGoogle className="w-5 h-5" />
                        <span>Continuar com o Google</span>
                    </button>
                </form>

            </div>
        </div>
    );
}