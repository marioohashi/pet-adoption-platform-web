import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FaPaw } from "react-icons/fa6";

export function AuthLayout() {
    const { session } = useAuth();

    // Se o usuário já estiver logado, redireciona para a home
    if (session) {
        return <Navigate to="/" replace />;
    }

    return (
        // Fundo principal claro e acolhedor
        <div className="min-h-screen w-full bg-[#FAFAF8] flex flex-col justify-center items-center text-[#2D2D2D] p-4 font-sans selection:bg-[#FF7A59]/20">

            {/* Card do formulário: Branco, com borda fina e sombra suave */}
            <main className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E4E4E1] flex items-center flex-col w-full max-w-md shadow-lg shadow-[#E4E4E1]/30">

                {/* Ícone da Pata na cor Coral Afeto */}
                <FaPaw className="my-8 text-[#FF7A59] w-16 h-16" />

                {/* Renderiza o conteúdo da rota (SignIn/SignUp) */}
                <Outlet />
            </main>
        </div>
    );
}