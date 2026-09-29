import { NavLink } from "react-router-dom";
import { FaPaw, FaHouse, FaMagnifyingGlass, FaBuildingNgo } from "react-icons/fa6";

export function NotFound() {
    return (
        <div className="min-h-screen w-full bg-gray-950 flex items-center justify-center px-4 py-12">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-2xl relative overflow-hidden flex flex-col items-center">

                {/* Detalhe de fundo decorativo */}
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Ícone Animado / Destaque */}
                <div className="relative mb-6">
                    <div className="w-20 h-20 bg-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-center text-amber-400 mx-auto shadow-inner animate-bounce">
                        <FaPaw className="w-10 h-10" />
                    </div>
                    <span className="absolute -bottom-2 -right-2 bg-gray-950 border border-gray-700 text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full shadow">
                        404
                    </span>
                </div>

                {/* Textos com alto contraste */}
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                    Ops! Este pet fugiu da página...
                </h1>
                <p className="text-sm text-gray-300 max-w-sm mb-8 leading-relaxed">
                    Parece que o link que você tentou acessar não existe ou foi adotado por outro endereço. Que tal voltar para casa?
                </p>

                {/* Ações Principais */}
                <div className="w-full space-y-3">
                    <NavLink
                        to="/"
                        className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-3.5 px-6 rounded-xl transition shadow-lg shadow-amber-500/20 cursor-pointer"
                    >
                        <FaHouse className="w-4 h-4" />
                        <span>Voltar para o início</span>
                    </NavLink>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <NavLink
                            to="/pets"
                            className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 text-xs font-semibold py-2.5 px-4 rounded-xl transition"
                        >
                            <FaMagnifyingGlass className="w-3.5 h-3.5 text-amber-400" />
                            <span>Ver Pets</span>
                        </NavLink>

                        <NavLink
                            to="/ongs"
                            className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 text-xs font-semibold py-2.5 px-4 rounded-xl transition"
                        >
                            <FaBuildingNgo className="w-3.5 h-3.5 text-amber-400" />
                            <span>Ver ONGs</span>
                        </NavLink>
                    </div>
                </div>

            </div>
        </div>
    );
}