import { useState } from "react";
import { FaLocationDot, FaPhone, FaCalendarDay, FaTriangleExclamation, FaMagnifyingGlass, FaPlus, FaShareNodes } from "react-icons/fa6";

interface LostPet {
    id: string;
    name: string;
    species: string;
    breed: string;
    location: string;
    date: string;
    phone: string;
    contactName: string;
    description: string;
    photo: string;
    reward?: string;
}

const MOCK_LOST_PETS: LostPet[] = [
    {
        id: "1",
        name: "Mel",
        species: "Cachorro",
        breed: "Golden Retriever",
        location: "Batel, Curitiba - PR",
        date: "25/09/2026",
        phone: "(41) 99888-7766",
        contactName: "Mariana",
        description: "Usava coleira azul com plaqueta de identificação. É muito dócil, mas pode estar assustada.",
        photo: "https://images.unsplash.com/photo-1552053831-71594a27632d",
        reward: "Recompensa oferecida"
    },
    {
        id: "2",
        name: "Simba",
        species: "Gato",
        breed: "SRD (Rajado)",
        location: "Ecoville, Curitiba - PR",
        date: "27/09/2026",
        phone: "(41) 98765-4321",
        contactName: "Carlos",
        description: "Gato castrado de pelo curto, olhos verdes. Costuma miar alto se chamado. Sumiu perto da Rua Major Heitor.",
        photo: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba",
    },
    {
        id: "3",
        name: "Bob",
        species: "Cachorro",
        breed: "Beagle",
        location: "Juvevê, Curitiba - PR",
        date: "28/09/2026",
        phone: "(41) 99111-2233",
        contactName: "Juliana",
        description: "Fugiu durante o passeio. É muito curioso e adora petiscos. Responde pelo nome de Bob.",
        photo: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8",
    }
];

export function LostPets() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("all");

    const filteredPets = MOCK_LOST_PETS.filter((pet) => {
        const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pet.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecies = selectedFilter === "all" || pet.species.toLowerCase() === selectedFilter.toLowerCase();
        return matchesSearch && matchesSpecies;
    });

    return (
        <section className="w-full font-sans pb-16">
            {/* Cabeçalho da Seção */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-3xl font-bold font-['Manrope'] text-[#2D2D2D] mb-1 tracking-tight">
                        Pets Desaparecidos
                    </h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed">
                        Ajude a reunir famílias. Divulgue ou encontre pets perdidos na sua região.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => alert("Abrir modal de cadastrar pet perdido")}
                    className="flex items-center justify-center gap-2 bg-[#FF7A59] hover:bg-[#e0694a] text-white font-semibold px-4.5 py-3 rounded-2xl transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0 text-sm"
                >
                    <FaPlus className="w-4 h-4" /> Cadastrar Pet Perdido
                </button>
            </div>

            {/* Alerta Informativo / Banner de Apoio */}
            <div className="bg-[#FFF4F0] border border-[#FF7A59]/30 rounded-3xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-3 bg-[#FF7A59] text-white rounded-2xl shrink-0">
                    <FaTriangleExclamation className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold font-['Manrope'] text-[#2D2D2D] text-base mb-1">
                        Perdeu seu pet ou encontrou um animalzinho na rua?
                    </h4>
                    <p className="text-sm text-[#6B7280]">
                        Cadastre as informações detalhadas e a última localização para que a comunidade local possa ajudar nas buscas rapidamente.
                    </p>
                </div>
            </div>

            {/* Barra de Filtros e Busca */}
            <div className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-2xl p-4 shadow-xs mb-8 flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#6B7280]">
                        <FaMagnifyingGlass className="w-4 h-4" />
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar por nome, raça ou bairro/cidade..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                    <button
                        onClick={() => setSelectedFilter("all")}
                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer whitespace-nowrap ${selectedFilter === "all"
                                ? "bg-[#FF7A59] text-white shadow-xs"
                                : "bg-[#F4F4F2] text-[#6B7280] hover:bg-[#E4E4E1]"
                            }`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setSelectedFilter("cachorro")}
                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer whitespace-nowrap ${selectedFilter === "cachorro"
                                ? "bg-[#FF7A59] text-white shadow-xs"
                                : "bg-[#F4F4F2] text-[#6B7280] hover:bg-[#E4E4E1]"
                            }`}
                    >
                        Cachorros
                    </button>
                    <button
                        onClick={() => setSelectedFilter("gato")}
                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer whitespace-nowrap ${selectedFilter === "gato"
                                ? "bg-[#FF7A59] text-white shadow-xs"
                                : "bg-[#F4F4F2] text-[#6B7280] hover:bg-[#E4E4E1]"
                            }`}
                    >
                        Gatos
                    </button>
                </div>
            </div>

            {/* Grid de Cards de Pets Perdidos */}
            {filteredPets.length === 0 ? (
                <div className="bg-[#F4F4F2] border border-[#E4E4E1] rounded-3xl p-12 text-center">
                    <h4 className="text-lg font-bold font-['Manrope'] text-[#2D2D2D] mb-1">Nenhum pet encontrado</h4>
                    <p className="text-[#6B7280] text-sm">Não há registros correspondentes à sua busca no momento.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredPets.map((pet) => (
                        <div
                            key={pet.id}
                            className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-3xl overflow-hidden hover:border-[#FF7A59]/50 transition-all duration-300 flex flex-col group shadow-xs hover:shadow-xl relative"
                        >
                            {/* Imagem e Badge de Alerta */}
                            <div className="relative w-full aspect-square bg-[#F4F4F2] overflow-hidden">
                                <img
                                    src={pet.photo}
                                    alt={pet.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 left-3 z-10 flex gap-2">
                                    <span className="text-xs px-3 py-1 rounded-full bg-red-500 text-white font-semibold shadow-xs">
                                        Perdido
                                    </span>
                                    {pet.reward && (
                                        <span className="text-xs px-3 py-1 rounded-full bg-amber-500 text-gray-950 font-bold shadow-xs">
                                            {pet.reward}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Informações */}
                            <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                                <div className="space-y-2">
                                    <div>
                                        <h3 className="text-xl font-bold font-['Manrope'] text-[#2D2D2D] group-hover:text-[#FF7A59] transition-colors">
                                            {pet.name}
                                        </h3>
                                        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mt-0.5">
                                            {pet.breed}
                                        </p>
                                    </div>

                                    <p className="text-sm text-[#6B7280] line-clamp-2 leading-relaxed">
                                        {pet.description}
                                    </p>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-[#E4E4E1]">
                                    <div className="flex items-center gap-2.5 text-xs text-[#2D2D2D]">
                                        <div className="p-2 bg-[#FF7A59]/10 text-[#FF7A59] rounded-xl shrink-0">
                                            <FaLocationDot className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-medium truncate">{pet.location}</span>
                                    </div>

                                    <div className="flex items-center gap-2.5 text-xs text-[#2D2D2D]">
                                        <div className="p-2 bg-[#FF7A59]/10 text-[#FF7A59] rounded-xl shrink-0">
                                            <FaCalendarDay className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-medium">Desaparecido em: {pet.date}</span>
                                    </div>
                                </div>

                                {/* Botão de Contato / Ação */}
                                <div className="pt-2 flex items-center gap-2">
                                    <a
                                        href={`tel:${pet.phone}`}
                                        className="flex-1 flex items-center justify-center gap-2 bg-[#FF7A59] hover:bg-[#e0694a] text-white font-semibold py-3 px-4 rounded-2xl transition text-xs shadow-sm cursor-pointer"
                                    >
                                        <FaPhone className="w-3.5 h-3.5" /> Ligar ({pet.contactName})
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => alert(`Compartilhar informações de ${pet.name}`)}
                                        className="p-3 bg-[#F4F4F2] hover:bg-[#E4E4E1] text-[#2D2D2D] rounded-2xl transition cursor-pointer border border-[#E4E4E1]"
                                        title="Compartilhar"
                                    >
                                        <FaShareNodes className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}