import { useState } from "react";
import { AxiosError } from "axios";
import { useNavigate, Link } from "react-router-dom";
import { z, ZodError } from "zod";
import { FcGoogle } from "react-icons/fc";

import { api } from "../services/api";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

const signUpSchema = z
  .object({
    name: z.string().trim().min(1, { message: "Informe seu nome completo" }),
    email: z.string().email({ message: "Informe um e-mail válido" }),
    password: z
      .string()
      .min(6, { message: "A senha deve ter pelo menos 6 dígitos" }),
    passwordConfirm: z.string().min(1, { message: "Confirme sua senha" }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "As senhas não coincidem",
    path: ["passwordConfirm"],
  });

export function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    try {
      setIsLoading(true);
      const data = signUpSchema.parse({
        name,
        email,
        password,
        passwordConfirm,
      });

      await api.post("/users", data);
      navigate("/signin");
    } catch (error) {
      console.error(error);

      if (error instanceof ZodError) {
        setErrorMessage(error.issues[0].message);
      } else if (error instanceof AxiosError) {
        setErrorMessage(
          error.response?.data?.message || "Não foi possível realizar o cadastro."
        );
      } else {
        setErrorMessage("Ocorreu um erro inesperado. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoogleAuth() {
    // Redireciona para o endpoint OAuth do seu Backend (ou SDK do Google)
    window.location.href = "http://localhost:3333/auth/google";
  }

  return (
    <div className="w-full">
      <header className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Crie sua conta</h2>
        <p className="text-sm text-gray-300">
          Preencha os dados abaixo para se cadastrar
        </p>
      </header>

      {errorMessage && (
        <div className="bg-red-500/15 border border-red-500/30 text-red-200 text-sm p-3 rounded-lg mb-4 text-center">
          {errorMessage}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          required
          legend="Nome"
          placeholder="Seu nome completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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

        <Input
          required
          legend="Confirmação da Senha"
          type="password"
          placeholder="••••••••"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
        />

        <Button type="submit" isLoading={isLoading} className="mt-2 bg-amber-500 hover:bg-amber-600">
          Cadastrar
        </Button>

        {/* Divisor "OU" */}
        <div className="relative my-2 flex items-center justify-center">
          <div className="w-full border-t border-gray-600/60" />
          <span className="absolute bg-gray-500 px-3 text-xs uppercase text-gray-300 font-medium">
            ou
          </span>
        </div>

        {/* Botão Google */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2.5 px-4 rounded-lg border border-gray-300 transition duration-200 shadow-sm cursor-pointer"
        >
          <FcGoogle className="w-5 h-5" />
          <span>Continuar com o Google</span>
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-600/50 text-center">
        <p className="text-sm text-gray-300">
          Já possui uma conta?{" "}
          <Link
            to="/signin"
            className="font-semibold text-amber-400 hover:text-amber-300 transition"
          >
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}