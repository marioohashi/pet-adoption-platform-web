import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaPaw,
  FaBuildingNgo,
  FaKitMedical,
  FaMagnifyingGlassLocation,
  FaRightFromBracket,
  FaHeart,
  FaUser,
  FaGear,
  FaBars,
  FaXmark,
  FaPlus,
} from "react-icons/fa6";
import { useAuth } from "../hooks/useAuth";
import { AuthModal } from "../modals/AuthModal";
import { PetFormModal } from "../modals/PetFormModal"; // Importe o modal unificado de pet que criamos



export function Header() {
  const { session, remove } = useAuth();
  const navigate = useNavigate();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPetModalOpen, setIsPetModalOpen] = useState(false); // Estado para controlar o modal de cadastro/edição de pets
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");

  const isAuthenticated = Boolean(session);

  function handleLogout() {
    remove();
    setIsMobileMenuOpen(false);
    navigate("/");
  }

  function openModal(mode: "signin" | "signup") {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  }

  function handleOpenPetModal() {
    setIsMobileMenuOpen(false);
    setIsPetModalOpen(true);
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-xl text-xs lg:text-sm font-medium transition-all duration-200 whitespace-nowrap ${isActive
      ? "bg-[#FF7A59]/10 text-[#FF7A59] font-semibold border border-[#FF7A59]/20 shadow-xs"
      : "text-[#6B7280] hover:text-[#2D2D2D] hover:bg-[#F4F4F2]"
    }`;

  const firstName = session?.user?.name ? session.user.name.split(" ")[0] : "Utilizador";

  return (
    <>
      <header className="w-full bg-[#FAFAF8]/95 backdrop-blur-md border-b border-[#E4E4E1] sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-2 lg:gap-4">

            {/* Logo da Marca */}
            <NavLink to="/" className="flex items-center gap-2 text-[#2D2D2D] font-bold text-lg lg:text-xl group shrink-0">
              <div className="p-2.5 bg-[#FF7A59]/10 rounded-2xl group-hover:bg-[#FF7A59]/20 transition-colors text-[#FF7A59]">
                <FaPaw className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
              <span className="font-['Manrope'] tracking-tight">Adote 2 Pets</span>
            </NavLink>

            {/* Menu Desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              <NavLink to="/pets" className={navLinkClass}>
                <FaHeart className="w-3.5 h-3.5" />
                <span>Adoção</span>
              </NavLink>
              <NavLink to="/perdidos" className={navLinkClass}>
                <FaMagnifyingGlassLocation className="w-3.5 h-3.5" />
                <span>Perdidos e Achados</span>
              </NavLink>
              <NavLink to="/ongs" className={navLinkClass}>
                <FaBuildingNgo className="w-3.5 h-3.5" />
                <span>ONGs</span>
              </NavLink>
              <NavLink to="/clinicas" className={navLinkClass}>
                <FaKitMedical className="w-3.5 h-3.5" />
                <span>Clínicas</span>
              </NavLink>
            </nav>

            {/* Ações do Utilizador (Lado Direito - Desktop) */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              {/* Botão de Cadastrar Pet - Aciona o Modal */}
              <button
                onClick={handleOpenPetModal}
                className="flex items-center gap-1.5 bg-[#FF7A59] hover:bg-[#e0694a] text-white font-semibold px-3.5 py-2.5 rounded-2xl text-xs transition-all shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap"
              >
                <FaPlus className="w-3.5 h-3.5" />
                <span>Cadastrar Pet</span>
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <NavLink to="/meus-pets" className={navLinkClass}>
                    <FaPaw className="w-3.5 h-3.5" />
                    <span>Meus Pets</span>
                  </NavLink>

                  <div className="flex items-center gap-1.5 pl-2 border-l border-[#E4E4E1]">
                    <NavLink
                      to="/settings"
                      title="Editar dados e configurações"
                      className="flex items-center gap-1 text-xs text-[#6B7280] font-medium hover:text-[#FF7A59] transition-colors group px-2 py-1.5 rounded-xl hover:bg-[#F4F4F2]"
                    >
                      <span className="max-w-[100px] truncate text-[#2D2D2D] font-medium text-xs font-sans">
                        {firstName}
                      </span>
                      <FaGear className="w-3.5 h-3.5 text-[#6B7280] group-hover:text-[#FF7A59] group-hover:rotate-90 transition-all duration-300" />
                    </NavLink>

                    <button
                      onClick={handleLogout}
                      title="Sair da conta"
                      className="p-2 text-[#6B7280] hover:text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                    >
                      <FaRightFromBracket className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => openModal("signin")}
                  className="flex items-center gap-1.5 bg-[#F4F4F2] hover:bg-[#E4E4E1] text-[#2D2D2D] font-medium px-3.5 py-2.5 rounded-2xl text-xs transition cursor-pointer border border-[#E4E4E1]"
                >
                  <FaUser className="w-3.5 h-3.5 text-[#FF7A59]" />
                  <span>Entrar</span>
                </button>
              )}
            </div>

            {/* Botão do Menu Hambúrguer (Mobile / Tablet) */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 text-[#2D2D2D] bg-[#F4F4F2] hover:bg-[#E4E4E1] rounded-2xl border border-[#E4E4E1] transition cursor-pointer"
                aria-label="Abrir Menu"
              >
                {isMobileMenuOpen ? <FaXmark className="w-5 h-5 text-[#FF7A59]" /> : <FaBars className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Menu Drawer / Overlay Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col">
          <div
            className="fixed inset-0 bg-[#2D2D2D]/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative bg-[#FAFAF8] w-full max-w-sm ml-auto h-full shadow-2xl flex flex-col z-10 border-l border-[#E4E4E1]">
            <div className="flex items-center justify-between p-5 border-b border-[#E4E4E1]">
              <div className="flex items-center gap-2 font-bold text-[#2D2D2D]">
                <div className="p-2 bg-[#FF7A59]/10 rounded-xl text-[#FF7A59]">
                  <FaPaw className="w-4 h-4" />
                </div>
                <span className="font-['Manrope'] text-base">Menu de Navegação</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-[#6B7280] hover:text-[#2D2D2D] hover:bg-[#F4F4F2] rounded-xl transition"
              >
                <FaXmark className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              <div className="space-y-2 pb-4 mb-4 border-b border-[#E4E4E1]">
                <button
                  onClick={handleOpenPetModal}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF7A59] hover:bg-[#e0694a] text-white font-semibold py-3 px-4 rounded-2xl text-sm transition shadow-sm cursor-pointer"
                >
                  <FaPlus className="w-4 h-4" />
                  <span>Cadastrar Pet</span>
                </button>

                {isAuthenticated && (
                  <div onClick={() => setIsMobileMenuOpen(false)}>
                    <NavLink
                      to="/meus-pets"
                      className={({ isActive }) =>
                        `w-full flex justify-center items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all  ${isActive
                          ? "bg-[#FF7A59]/10 text-[#FF7A59] border border-[#FF7A59]/20"
                          : "bg-[#F4F4F2] text-[#2D2D2D] hover:bg-[#E4E4E1]"
                        }`
                      }
                    >
                      <FaPaw className="w-4 h-4 text-[#FF7A59]" />
                      <span>Meus Pets</span>
                    </NavLink>
                  </div>
                )}
              </div>

              <div onClick={() => setIsMobileMenuOpen(false)}>
                <NavLink to="/pets" className={navLinkClass}>
                  <FaHeart className="w-4 h-4 text-[#FF7A59]" />
                  <span className="text-sm">Adotar um Pet</span>
                </NavLink>
              </div>
              <div onClick={() => setIsMobileMenuOpen(false)}>
                <NavLink to="/perdidos" className={navLinkClass}>
                  <FaMagnifyingGlassLocation className="w-4 h-4 text-[#FF7A59]" />
                  <span className="text-sm">Pets Perdidos e Achados</span>
                </NavLink>
              </div>
              <div onClick={() => setIsMobileMenuOpen(false)}>
                <NavLink to="/ongs" className={navLinkClass}>
                  <FaBuildingNgo className="w-4 h-4 text-[#FF7A59]" />
                  <span className="text-sm">ONGs Parceiras</span>
                </NavLink>
              </div>
              <div onClick={() => setIsMobileMenuOpen(false)}>
                <NavLink to="/clinicas" className={navLinkClass}>
                  <FaKitMedical className="w-4 h-4 text-[#FF7A59]" />
                  <span className="text-sm">Clínicas Veterinárias</span>
                </NavLink>
              </div>
            </div>

            <div className="p-5 border-t border-[#E4E4E1] bg-[#F4F4F2] space-y-3">
              {isAuthenticated ? (
                <div className="flex items-center justify-between pt-2">
                  <NavLink
                    to="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-xs font-medium text-[#6B7280] hover:text-[#FF7A59]"
                  >
                    <FaGear className="w-3.5 h-3.5" />
                    <span>{session?.user?.name || "Minha Conta"}</span>
                  </NavLink>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 p-2 cursor-pointer"
                  >
                    <FaRightFromBracket className="w-3.5 h-3.5" />
                    <span>Sair</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => openModal("signin")}
                  className="w-full flex items-center justify-center gap-2 bg-[#FAFAF8] hover:bg-[#E4E4E1] text-[#2D2D2D] font-medium py-3 rounded-2xl text-sm transition shadow-xs border border-[#E4E4E1] cursor-pointer"
                >
                  <FaUser className="w-4 h-4 text-[#FF7A59]" />
                  <span>Entrar na Conta</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modais da Aplicação */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      <PetFormModal
        isOpen={isPetModalOpen}
        onClose={() => setIsPetModalOpen(false)}
      />
    </>
  );
}