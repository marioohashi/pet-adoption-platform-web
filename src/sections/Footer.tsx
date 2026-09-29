import { NavLink } from "react-router-dom";
import { FaPaw, FaHeart, FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa6";

export function Footer() {
  return (
    <footer className="bg-[#F4F4F2] border-t border-[#E4E4E1] pt-12 pb-8 mt-16 text-[#2D2D2D] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Grid Principal do Rodapé (Desktop & Tablet) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#E4E4E1]">

          {/* Coluna 1: Marca e Missão */}
          <div className="md:col-span-1 space-y-4">
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="p-2 bg-[#FF7A59]/10 rounded-2xl text-[#FF7A59]">
                <FaPaw className="w-5 h-5" />
              </div>
              <span className="font-['Manrope'] font-bold text-xl tracking-tight text-[#2D2D2D]">
                Adote 2 Pets
              </span>
            </NavLink>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Transformando vidas através da adoção responsável. Conectando corações solitários a novos melhores amigos.
            </p>
          </div>

          {/* Coluna 2: Navegação Rápida */}
          <div className="space-y-3">
            <h3 className="font-['Manrope'] font-bold text-sm tracking-wide text-[#2D2D2D] uppercase">
              Explorar
            </h3>
            <ul className="space-y-2 text-sm text-[#6B7280]">
              <li>
                <NavLink to="/pets" className="hover:text-[#FF7A59] transition-colors">
                  Encontrar um Pet
                </NavLink>
              </li>
              <li>
                <NavLink to="/perdidos" className="hover:text-[#FF7A59] transition-colors">
                  Pets Perdidos
                </NavLink>
              </li>
              <li>
                <NavLink to="/ongs" className="hover:text-[#FF7A59] transition-colors">
                  ONGs Parceiras
                </NavLink>
              </li>
              <li>
                <NavLink to="/clinicas" className="hover:text-[#FF7A59] transition-colors">
                  Clínicas Veterinárias
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Acolhimento e Apoio */}
          <div className="space-y-3">
            <h3 className="font-['Manrope'] font-bold text-sm tracking-wide text-[#2D2D2D] uppercase">
              Compromisso
            </h3>
            <p className="text-sm text-[#6B7280] italic leading-relaxed">
              &ldquo;Adotar não é apenas mudar a vida de um animal, é permitir que ele transforme a sua para sempre.&rdquo;
            </p>
          </div>

          {/* Coluna 4: Contato / Desenvolvedor */}
          <div className="space-y-3">
            <h3 className="font-['Manrope'] font-bold text-sm tracking-wide text-[#2D2D2D] uppercase">
              Desenvolvimento
            </h3>
            <p className="text-sm text-[#6B7280]">
              Criado com <FaHeart className="inline w-3.5 h-3.5 text-[#FF7A59] mx-0.5" /> por <strong className="text-[#2D2D2D] font-semibold">Mario Ohashi</strong>.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.linkedin.com/in/mario-ohashi"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                className="p-2.5 bg-[#FAFAF8] hover:bg-[#FF7A59] hover:text-white text-[#6B7280] rounded-xl border border-[#E4E4E1] transition-all cursor-pointer shadow-xs"
              >
                <FaLinkedin className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
                className="p-2.5 bg-[#FAFAF8] hover:bg-[#FF7A59] hover:text-white text-[#6B7280] rounded-xl border border-[#E4E4E1] transition-all cursor-pointer shadow-xs"
              >
                <FaGithub className="w-4 h-4" />
              </a>
              <a
                href="mailto:contato@adote2pets.com"
                title="Contato"
                className="p-2.5 bg-[#FAFAF8] hover:bg-[#FF7A59] hover:text-white text-[#6B7280] rounded-xl border border-[#E4E4E1] transition-all cursor-pointer shadow-xs"
              >
                <FaEnvelope className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Rodapé Inferior (Copyright e Versões Mobile/Desktop) */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B7280] gap-4">
          <p>© {new Date().getFullYear()} Adote 2 Pets — Plataforma de Adoção Responsável. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#2D2D2D] transition-colors cursor-pointer">Política de Privacidade</span>
            <span>•</span>
            <span className="hover:text-[#2D2D2D] transition-colors cursor-pointer">Termos de Uso</span>
          </div>
        </div>

      </div>
    </footer>
  );
}