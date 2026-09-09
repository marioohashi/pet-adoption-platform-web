import { useActionState } from "react";
import { z, ZodError } from "zod"
import { AxiosError } from "axios"
import { useNavigate } from "react-router-dom"

import { api } from "../services/api"
import { useAuth } from "../hooks/useAuth"

import { Button } from "../components/Button";
import { Input } from "../components/Input";

const signInScheme = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().trim().min(1, { message: "Inform password" })
})

export function SignIn() {
  const navigate = useNavigate()
  const [state, formAction, isLoading] = useActionState(signIn, null)
  const auth = useAuth()

  async function signIn(_: any, formData: FormData) {
    try {
      const data = signInScheme.parse({
        email: formData.get("email"),
        password: formData.get("password"),
      })

      const response = await api.post("/sessions", data)
      auth.save(response.data)

      navigate("/")

    } catch (error) {
      console.log(error)

      if (error instanceof ZodError) {
        return {
          error: "validation",
          issues: error.issues.map(issue => issue.message),
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? "")
        }
      }

      if (error instanceof AxiosError) {
        return {
          error: "request",
          message: error.response?.data?.message ?? "Unexpected server error",
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? "")
        }
      }

      return {
        error: "unknown",
        message: "Something went wrong",
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? "")
      }
    }
  }

  return (
    <form action={formAction} className="w-full flex flex-col gap-4">
      <Input
        name="email"
        required
        legend="E-mail"
        type="email"
        placeholder="seu@email.com"
        defaultValue={String(state?.email)}
      />
      <Input
        name="password"
        required
        legend="Senha"
        type="password"
        placeholder="123456"
        defaultValue={String(state?.password)}
      />

      <Button type="submit" isLoading={isLoading}>
        Entrar
      </Button>

      <a
        href="/signup"
        className="text-sm font-semibold text-gray-100 mt-10 mb-4 text-center hover:text-green-800 transition ease-linear"
      >
        Criar conta
      </a>
    </form>
  );
}
