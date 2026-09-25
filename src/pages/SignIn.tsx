import { useState } from "react";
import { z, ZodError } from "zod";
import { AxiosError } from "axios";
import { useNavigate, Link } from "react-router-dom";

import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";

import { Button } from "../components/Button";
import { Input } from "../components/Input";

const signInSchema = z.object({
  email: z.string().email({ message: "Insira um e-mail válido" }),
  password: z.string().min(1, { message: "Informe sua senha" }),
});

export function SignIn() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    try {
      setIsLoading(true);
      const data = signInSchema.parse({ email, password });

      const response = await api.post("/sessions", data);
      auth.save(response.data);

      navigate("/");
    } catch (error) {
      console.error(error);

      if (error instanceof ZodError) {
        setErrorMessage(error.issues[0].message);
      } else if (error instanceof AxiosError) {
        setErrorMessage(
          error.response?.data?.message || "E-mail ou senha incorretos."
        );
      } else {
        setErrorMessage("Ocorreu um erro inesperado. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      <header className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Acesse sua conta</h2>
        <p className="text-sm text-gray-300">
          Entre com seu e-mail e senha para continuar
        </p>
      </header>

      {errorMessage && (
        <div className="bg-red-500/15 border border-red-500/30 text-red-200 text-sm p-3 rounded-lg mb-4 text-center">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          name="email"
          required
          legend="E-mail"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          name="password"
          required
          legend="Senha"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" isLoading={isLoading} className="mt-2 bg-amber-500">
          Entrar
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-600/50 text-center">
        <p className="text-sm text-gray-300">
          Ainda não tem uma conta?{" "}
          <Link
            to="/signup"
            className="font-semibold text-amber-400 hover:text-amber-300 transition"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}