import { useState, useEffect } from "react";
import { FaLocationDot, FaCalendarDay, FaTriangleExclamation, FaMagnifyingGlass, FaPlus, FaWhatsapp } from "react-icons/fa6";
import { LostPetModal } from "../modals/LostPetModal";

interface LostOrFoundPet {
    id: string;
    type: "lost" | "found";
    name?: string;
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

const MOCK_PETS: LostOrFoundPet[] = [
    {
        id: "1",
        type: "lost",
        name: "Mel",
        species: "Cachorro",
        breed: "Golden Retriever",
        location: "Batel, Curitiba - PR",
        date: "25/09/2026",
        phone: "5541998887766",
        contactName: "Mariana",
        description: "Usava coleira azul com plaqueta de identificação. É muito dócil, mas pode estar assustada.",
        photo: "https://images.unsplash.com/photo-1552053831-71594a27632d",
        reward: "Recompensa oferecida"
    },
    {
        id: "2",
        type: "found",
        name: "Caramelo (Sem nome definido)",
        species: "Cachorro",
        breed: "SRD (Vira-lata)",
        location: "Centro Cívico, Curitiba - PR",
        date: "28/09/2026",
        phone: "5541977778899",
        contactName: "Roberto",
        description: "Encontrei vagando perto da prefeitura. Estava sem coleira, é muito dócil e aceita carinho facilmente.",
        photo: "https://images.unsplash.com/photo-1543466835-00a7907e9de1",
    },
    {
        id: "3",
        type: "lost",
        name: "Simba",
        species: "Gato",
        breed: "SRD (Rajado)",
        location: "Ecoville, Curitiba - PR",
        date: "27/09/2026",
        phone: "5541987654321",
        contactName: "Carlos",
        description: "Gato castrado de pelo curto, olhos verdes. Costuma miar alto se chamado pelo nome.",
        photo: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba",
    },
    {
        id: "4",
        type: "found",
        name: "Nina",
        species: "Cachorro",
        breed: "Poodle Toy",
        location: "Juvevê, Curitiba - PR",
        date: "29/09/2026",
        phone: "5541966665544",
        contactName: "Luciana",
        description: "Apareceu assustada na rua durante a chuva. Pelo tosquiado recentemente e usa uma fitinha vermelha.",
        photo: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e",
    },
    {
        id: "5",
        type: "lost",
        name: "Thor",
        species: "Cachorro",
        breed: "Husky Siberiano",
        location: "Água Verde, Curitiba - PR",
        date: "26/09/2026",
        phone: "5541955443322",
        contactName: "Felipe",
        description: "Olhos de cores diferentes (um azul e um castanho). É arisco com estranhos, por favor ligue antes de tentar segurar.",
        photo: "https://images.unsplash.com/photo-1605568427561-40dd23c2fea4",
        reward: "Recompensa em dinheiro"
    },
    {
        id: "6",
        type: "found",
        name: "Gatinho Filhote Resgatado",
        species: "Gato",
        breed: "Preto e Branco (Tuxedo)",
        location: "Bigorrilho, Curitiba - PR",
        date: "29/09/2026",
        phone: "5541933332211",
        contactName: "Beatriz",
        description: "Filhote muito pequeno, deve ter um pouco mais de 2 meses. Encontrado miando embaixo de um carro estacionado.",
        photo: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce",
    },
    {
        id: "7",
        type: "lost",
        name: "Bidu",
        species: "Cachorro",
        breed: "Schnauzer",
        location: "Mercês, Curitiba - PR",
        date: "24/09/2026",
        phone: "5541922221100",
        contactName: "Camila",
        description: "Idoso, tem catarata leve nos dois olhos e usa coleira vermelha com número de telefone apagado.",
        photo: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8",
    }
];

export function LostPets() {
    const [activeTab, setActiveTab] = useState<"all" | "lost" | "found">("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSpecies, setSelectedSpecies] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Estados para gerenciar os dados vindos do banco de dados
    const [dbPets, setDbPets] = useState<LostOrFoundPet[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Simulação de busca no banco de dados ao carregar o componente
    useEffect(() => {
        async function fetchLostPetsFromDB() {
            try {
                setIsLoading(true);
                // Substitua pelo seu endpoint/chamada real ao backend (ex: api.get('/lost-pets'))
                const response = await fetch("/api/lost-pets");
                if (response.ok) {
                    const data = await response.json();
                    // Filtra apenas os que possuem type válido ("lost" | "found")
                    const validPets = data.filter((pet: any) => pet.type === "lost" || pet.type === "found");
                    setDbPets(validPets);
                }
            } catch (error) {
                console.error("Erro ao carregar pets do banco:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchLostPetsFromDB();
    }, []);

    // CONDICIONAL PRINCIPAL: Se houver pets no banco, usa eles. Se não, usa os MOCK_PETS.
    const petsList = dbPets.length > 0 ? dbPets : MOCK_PETS;

    const handleAddPet = (newPet: LostOrFoundPet) => {
        setDbPets([newPet, ...dbPets]);
        // Aqui você também faria a chamada POST para salvar no banco de dados:
        // await fetch("/api/lost-pets", { method: "POST", body: JSON.stringify(newPet) });
    };

    const filteredPets = petsList.filter((pet) => {
        const matchesTab = activeTab === "all" || pet.type === activeTab;
        const matchesSearch = (pet.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            pet.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecies = selectedSpecies === "all" || pet.species.toLowerCase() === selectedSpecies.toLowerCase();

        return matchesTab && matchesSearch && matchesSpecies;
    });

    return (
        <section className="w-full font-sans pb-16">
            {/* Cabeçalho da Seção */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-3xl font-bold font-['Manrope'] text-[#2D2D2D] mb-1 tracking-tight">
                        Rede de Apoio: Perdidos e Achados
                    </h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed">
                        Ajude a reunir famílias. Veja animais procurados por tutores ou encontrados na sua região.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-[#FF7A59] hover:bg-[#e0694a] text-white font-semibold px-4.5 py-3 rounded-2xl transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0 text-sm"
                >
                    <FaPlus className="w-4 h-4" /> Cadastrar Ocorrência
                </button>
            </div>

            {/* Alerta Informativo / Banner de Apoio */}
            <div className="bg-[#FFF4F0] border border-[#FF7A59]/30 rounded-3xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-3 bg-[#FF7A59] text-white rounded-2xl shrink-0">
                    <FaTriangleExclamation className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold font-['Manrope'] text-[#2D2D2D] text-base mb-1">
                        O que fazer ao encontrar ou perder um pet?
                    </h4>
                    <p className="text-sm text-[#6B7280]">
                        Se o seu pet fugiu, cadastre em <strong>Perdidos</strong>. Se acolheu um animal na rua sem dono aparente, cadastre em <strong>Achados</strong> para que o tutor o encontre.
                    </p>
                </div>
            </div>

            {/* Seletor de Abas */}
            <div className="flex items-center gap-2 mb-6 border-b border-[#E4E4E1] pb-4 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("all")}
                    className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition cursor-pointer whitespace-nowrap ${activeTab === "all"
                        ? "bg-[#2D2D2D] text-white shadow-xs"
                        : "bg-[#FAFAF8] text-[#6B7280] hover:bg-[#F4F4F2] border border-[#E4E4E1]"
                        }`}
                >
                    Todos ({petsList.length})
                </button>
                <button
                    onClick={() => setActiveTab("lost")}
                    className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition cursor-pointer whitespace-nowrap ${activeTab === "lost"
                        ? "bg-red-600 text-white shadow-xs"
                        : "bg-[#FAFAF8] text-[#6B7280] hover:bg-[#F4F4F2] border border-[#E4E4E1]"
                        }`}
                >
                    Pets Perdidos (Tutores procurando)
                </button>
                <button
                    onClick={() => setActiveTab("found")}
                    className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition cursor-pointer whitespace-nowrap ${activeTab === "found"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "bg-[#FAFAF8] text-[#6B7280] hover:bg-[#F4F4F2] border border-[#E4E4E1]"
                        }`}
                >
                    Pets Achados (Procurando o tutor)
                </button>
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
                        onClick={() => setSelectedSpecies("all")}
                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer whitespace-nowrap ${selectedSpecies === "all"
                            ? "bg-[#FF7A59] text-white shadow-xs"
                            : "bg-[#F4F4F2] text-[#6B7280] hover:bg-[#E4E4E1]"
                            }`}
                    >
                        Todas Espécies
                    </button>
                    <button
                        onClick={() => setSelectedSpecies("cachorro")}
                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer whitespace-nowrap ${selectedSpecies === "cachorro"
                            ? "bg-[#FF7A59] text-white shadow-xs"
                            : "bg-[#F4F4F2] text-[#6B7280] hover:bg-[#E4E4E1]"
                            }`}
                    >
                        Cachorros
                    </button>
                    <button
                        onClick={() => setSelectedSpecies("gato")}
                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer whitespace-nowrap ${selectedSpecies === "gato"
                            ? "bg-[#FF7A59] text-white shadow-xs"
                            : "bg-[#F4F4F2] text-[#6B7280] hover:bg-[#E4E4E1]"
                            }`}
                    >
                        Gatos
                    </button>
                </div>
            </div>

            {/* Grid de Cards ou Estado de Carregamento */}
            {isLoading ? (
                <div className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-3xl p-12 text-center text-[#6B7280]">
                    Carregando ocorrências...
                </div>
            ) : filteredPets.length === 0 ? (
                <div className="bg-[#F4F4F2] border border-[#E4E4E1] rounded-3xl p-12 text-center">
                    <h4 className="text-lg font-bold font-['Manrope'] text-[#2D2D2D] mb-1">Nenhum registro encontrado</h4>
                    <p className="text-[#6B7280] text-sm">Não há ocorrências correspondentes aos filtros selecionados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredPets.map((pet) => {
                        const cleanPhone = pet.phone.replace(/\D/g, "");
                        const whatsappMessage = encodeURIComponent(
                            `Olá ${pet.contactName}, vi a ocorrência sobre o pet "${pet.name || "Pet"}" (${pet.breed}) na rede de apoio e gostaria de ajudar/obter mais informações.`
                        );
                        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappMessage}`;

                        return (
                            <div
                                key={pet.id}
                                className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-3xl overflow-hidden hover:border-[#FF7A59]/50 transition-all duration-300 flex flex-col group shadow-xs hover:shadow-xl relative"
                            >
                                <div className="relative w-full aspect-square bg-[#F4F4F2] overflow-hidden">
                                    <img
                                        src={pet.photo}
                                        alt={pet.name || "Pet"}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
                                        {pet.type === "lost" ? (
                                            <span className="text-xs px-3 py-1 rounded-full bg-red-600 text-white font-bold shadow-xs">
                                                Perdido (Tutor Procura)
                                            </span>
                                        ) : (
                                            <span className="text-xs px-3 py-1 rounded-full bg-amber-600 text-white font-bold shadow-xs">
                                                Achado na Rua (Procura Tutor)
                                            </span>
                                        )}

                                        {pet.reward && (
                                            <span className="text-xs px-3 py-1 rounded-full bg-amber-400 text-gray-950 font-bold shadow-xs">
                                                {pet.reward}
                                            </span>
                                        )}
                                    </div>
                                </div>

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
                                            <span className="font-medium">
                                                {pet.type === "lost" ? "Desaparecido em: " : "Encontrado em: "} {pet.date}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <a
                                            href={whatsappUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold py-3 px-4 rounded-2xl transition text-xs shadow-sm cursor-pointer"
                                        >
                                            <FaWhatsapp className="w-4 h-4" /> Mandar Mensagem ({pet.contactName})
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <LostPetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddPet}
            />
        </section>
    );
}