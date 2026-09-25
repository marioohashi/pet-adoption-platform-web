import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaPaw,
  FaPlus,
  FaBuildingNgo,
  FaKitMedical,
  FaMagnifyingGlassLocation,
  FaRightFromBracket,
  FaHeart,
  FaUser,
} from "react-icons/fa6";
import { useAuth } from "../hooks/useAuth";
import { AuthModal } from "./AuthModal";
import { CreatePetModal } from "./CreatePetModal";

export function Header() {
  const { session, remove } = useAuth();
  const navigate = useNavigate();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreatePetModalOpen, setIsCreatePetModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");

  const isAuthenticated = Boolean(session);

  function handleLogout() {
    remove();
    navigate("/");
  }

  function openModal(mode: "signin" | "signup") {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }

  function handleAnnouncePet() {
    if (isAuthenticated) {
      setIsCreatePetModalOpen(true);
    } else {
      openModal("signin");
    }
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
      ? "bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30"
      : "text-gray-300 hover:text-white hover:bg-gray-700/50"
    }`;

  return (
    <>
      <header className="w-full bg-gray-800/80 backdrop-blur-md border-b border-gray-700/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2 text-amber-400 font-bold text-xl group">
              <div className="p-2 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/20 transition-colors">
                <FaPaw className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-white">Adote 2 Pets</span>
            </NavLink>

            {/* Menu Padrão (100% Público para todos os usuários) */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/pets" className={navLinkClass}>
                <FaHeart className="w-4 h-4" />
                <span>Explorar</span>
              </NavLink>
              <NavLink to="/perdidos" className={navLinkClass}>
                <FaMagnifyingGlassLocation className="w-4 h-4" />
                <span>Perdidos & Achados</span>
              </NavLink>
              <NavLink to="/ongs" className={navLinkClass}>
                <FaBuildingNgo className="w-4 h-4" />
                <span>ONGs</span>
              </NavLink>
              <NavLink to="/clinicas" className={navLinkClass}>
                <FaKitMedical className="w-4 h-4" />
                <span>Clínicas</span>
              </NavLink>
            </nav>

            {/* Bloco de Ações do Usuário (Lado Direito) */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                /* ÁREA PRIVADA: Agrupa Meus Pets, Anunciar, Usuário e Sair */
                <div className="flex items-center gap-2 sm:gap-3">
                  <NavLink to="/meus-pets" className={navLinkClass}>
                    <FaPaw className="w-4 h-4" />
                    <span className="hidden sm:inline">Meus Pets</span>
                  </NavLink>

                  {/* Botão de Anunciar Pet abrindo o Modal */}
                  <button
                    onClick={handleAnnouncePet}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-3.5 py-2 rounded-lg text-sm transition shadow-sm hover:shadow-amber-500/20 cursor-pointer"
                  >
                    <FaPlus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Anunciar Pet</span>
                  </button>

                  <div className="flex items-center gap-2 pl-2 border-l border-gray-700/60">
                    <span className="text-xs text-gray-300 font-medium hidden lg:inline max-w-[120px] truncate">
                      {session?.user?.name || "Usuário"}
                    </span>
                    <button
                      onClick={handleLogout}
                      title="Sair da conta"
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                    >
                      <FaRightFromBracket className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* ÁREA PÚBLICA: Exibe o botão Entrar */
                <button
                  onClick={() => openModal("signin")}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-medium px-3.5 py-2 rounded-lg text-sm transition cursor-pointer"
                >
                  <FaUser className="w-3.5 h-3.5" />
                  <span>Entrar</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Menu Mobile Público */}
        <nav className="md:hidden flex items-center justify-between gap-1 py-2 px-4 border-t border-gray-700/40 text-xs overflow-x-auto">
          <NavLink to="/pets" className={navLinkClass}>Explorar</NavLink>
          <NavLink to="/perdidos" className={navLinkClass}>Perdidos</NavLink>
          <NavLink to="/ongs" className={navLinkClass}>ONGs</NavLink>
          <NavLink to="/clinicas" className={navLinkClass}>Clínicas</NavLink>
        </nav>
      </header>

      {/* Modal de Cadastrar Pet */}
      <CreatePetModal
        isOpen={isCreatePetModalOpen}
        onClose={() => setIsCreatePetModalOpen(false)}
      />

      {/* Modal de Login / Registro */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
}