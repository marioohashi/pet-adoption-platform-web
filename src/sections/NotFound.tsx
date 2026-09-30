import { NavLink } from "react-router-dom";
import { FaPaw, FaHouse, FaMagnifyingGlass, FaBuildingNgo } from "react-icons/fa6";

export function NotFound() {
    return (
        <div className="min-h-screen w-full bg-[#FAFAF8] flex items-center justify-center px-4 py-12 font-sans selection:bg-[#FF7A59]/20">
            <div className="bg-white border border-[#E4E4E1] rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-2xl relative overflow-hidden flex flex-col items-center">

                {/* Detalhe de fundo decorativo */}
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#FF7A59]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[#FF7A59]/10 rounded-full blur-2xl pointer-events-none" />

                {/* Ícone Animado / Destaque */}
                <div className="relative mb-6">
                    <div className="w-20 h-20 bg-[#FF7A59]/10 border border-[#FF7A59]/30 rounded-2xl flex items-center justify-center text-[#FF7A59] mx-auto shadow-inner animate-bounce">
                        <FaPaw className="w-10 h-10" />
                    </div>
                    <span className="absolute -bottom-2 -right-2 bg-white border border-[#E4E4E1] text-[#FF7A59] text-xs font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                        404
                    </span>
                </div>

                {/* Textos com alto contraste */}
                <h1 className="text-2xl sm:text-3xl font-bold font-['Manrope'] text-[#2D2D2D] mb-3 tracking-tight">
                    Ops! Este pet fugiu da página...
                </h1>
                <p className="text-sm text-[#6B7280] max-w-sm mb-8 leading-relaxed">
                    Parece que o link que você tentou acessar não existe ou foi adotado por outro endereço. Que tal voltar para casa?
                </p>

                {/* Ações Principais */}
                <div className="w-full space-y-3">
                    <NavLink
                        to="/"
                        className="flex items-center justify-center gap-2 w-full bg-[#FF7A59] hover:bg-[#e0694a] text-white font-semibold py-3.5 px-6 rounded-2xl transition shadow-sm cursor-pointer text-sm"
                    >
                        <FaHouse className="w-4 h-4" />
                        <span>Voltar para o início</span>
                    </NavLink>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <NavLink
                            to="/pets"
                            className="flex items-center justify-center gap-2 bg-[#F4F4F2] hover:bg-[#E4E4E1] border border-[#E4E4E1] text-[#2D2D2D] text-xs font-semibold py-3 px-4 rounded-2xl transition shadow-xs"
                        >
                            <FaMagnifyingGlass className="w-3.5 h-3.5 text-[#FF7A59]" />
                            <span>Ver Pets</span>
                        </NavLink>

                        <NavLink
                            to="/ongs"
                            className="flex items-center justify-center gap-2 bg-[#F4F4F2] hover:bg-[#E4E4E1] border border-[#E4E4E1] text-[#2D2D2D] text-xs font-semibold py-3 px-4 rounded-2xl transition shadow-xs"
                        >
                            <FaBuildingNgo className="w-3.5 h-3.5 text-[#FF7A59]" />
                            <span>Ver ONGs</span>
                        </NavLink>
                    </div>
                </div>

            </div>
        </div>
    );
}