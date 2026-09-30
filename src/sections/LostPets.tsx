import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { FaTriangleExclamation, FaMagnifyingGlass, FaSliders, FaXmark } from "react-icons/fa6";
import { getPets } from "../services/petService";
import { Pagination } from "../components/Pagination";
import { PetDetailModal } from "../modals/PetDetailModal";
import { PetCard } from "../components/PetCard"
import type { PetsResponse, Species, PetSize, PetSex } from "../types";
const PER_PAGE = 9;

// Mock local robusto para testes e fallback
const fallbackMockPets = [
    {
        id: "m1",
        type: "lost",
        name: "Thor",
        species: "dog",
        breed: "Golden Retriever",
        size: "large",
        sex: "male",
        city: "Curitiba",
        location: "Batel, Curitiba - PR",
        date: "2026-09-25",
        description: "Cachorro muito dócil, usa coleira azul. Se assustou com fogos.",
        photo: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600",
        photos: ["https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600"],
        contactName: "Mariana",
        phone: "(41) 99999-9999",
        reward: "Recompensa",
    },
    {
        id: "m2",
        type: "found",
        name: "Mia",
        species: "cat",
        breed: "SRD (Persa mix)",
        size: "small",
        sex: "female",
        city: "Curitiba",
        location: "Mercadorias, Curitiba - PR",
        date: "2026-09-27",
        description: "Encontrada miando bastante perto de um mercado, pelagem cinza clara.",
        photo: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600",
        photos: ["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600"],
        contactName: "Carlos",
        phone: "(41) 98888-8888",
    },
];

export function LostPets() {
    const [activeTab, setActiveTab] = useState<"lost" | "found">("lost");
    const [page, setPage] = useState(1);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [selectedPet, setSelectedPet] = useState<any | null>(null);

    const [filters, setFilters] = useState({
        species: "" as Species | "",
        size: "" as PetSize | "",
        sex: "" as PetSex | "",
        search: "",
        city: "",
    });

    const { data, isPending, isFetching } = useQuery<PetsResponse | any>({
        queryKey: ["lost-found-pets", activeTab, filters, page],
        queryFn: async () => {
            try {
                const response = await getPets({
                    page,
                    perPage: PER_PAGE,
                    type: activeTab,
                    ...filters,
                });

                const apiPets = response?.pets ?? response?.animals ?? [];
                if (apiPets.length === 0) {
                    throw new Error("Nenhum pet retornado pela API, usando mock.");
                }

                return response;
            } catch (error) {
                let filtered = fallbackMockPets.filter((p) => p.type === activeTab);

                if (filters.species) filtered = filtered.filter(p => p.species === filters.species);
                if (filters.size) filtered = filtered.filter(p => p.size === filters.size);
                if (filters.sex) filtered = filtered.filter(p => p.sex === filters.sex);
                if (filters.city) filtered = filtered.filter(p => p.city.toLowerCase().includes(filters.city.toLowerCase()));
                if (filters.search) {
                    const query = filters.search.toLowerCase();
                    filtered = filtered.filter(p =>
                        p.name.toLowerCase().includes(query) ||
                        p.breed.toLowerCase().includes(query) ||
                        p.description.toLowerCase().includes(query)
                    );
                }

                return {
                    pets: filtered,
                    animals: filtered,
                    pagination: {
                        totalPages: 1,
                        currentPage: 1,
                        totalItems: filtered.length
                    }
                };
            }
        },
        placeholderData: keepPreviousData,
    });

    const pets = data?.pets ?? data?.animals ?? [];
    const totalPages = data?.pagination?.totalPages ?? 1;

    const activeFiltersCount = Object.entries(filters).filter(([_, val]) => val !== "").length;

    function handleFilterChange(e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
        setPage(1);
    }

    function handlePagination(action: "next" | "previous") {
        setPage((prev) => {
            if (action === "next" && prev < totalPages) return prev + 1;
            if (action === "previous" && prev > 1) return prev - 1;
            return prev;
        });
    }

    function resetFilters() {
        setFilters({
            species: "",
            size: "",
            sex: "",
            search: "",
            city: "",
        });
        setPage(1);
    }

    return (
        <section className="w-full font-sans pb-16">
            {/* Cabeçalho da Seção com Botão de Cadastro */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-3xl font-bold font-['Manrope'] text-[#2D2D2D] mb-1 tracking-tight">
                        Rede de Apoio: Perdidos e Achados
                    </h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed">
                        Ajude a reunir famílias. Veja animais procurados por tutores ou encontrados na sua região.
                    </p>
                </div>
            </div>

            {/* Alerta Informativo */}
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

            {/* Seletor de Abas e Botão de Filtros */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 border-b border-[#E4E4E1] pb-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    <button
                        onClick={() => { setActiveTab("lost"); setPage(1); }}
                        className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${activeTab === "lost"
                            ? "bg-red-600 text-white shadow-xs"
                            : "bg-[#FAFAF8] text-[#6B7280] hover:bg-[#F4F4F2] border border-[#E4E4E1]"
                            }`}
                    >
                        Pets Perdidos
                    </button>
                    <button
                        onClick={() => { setActiveTab("found"); setPage(1); }}
                        className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${activeTab === "found"
                            ? "bg-amber-600 text-white shadow-xs"
                            : "bg-[#FAFAF8] text-[#6B7280] hover:bg-[#F4F4F2] border border-[#E4E4E1]"
                            }`}
                    >
                        Pets Achados
                    </button>
                </div>

                <button
                    onClick={() => setIsFiltersOpen((prev) => !prev)}
                    type="button"
                    className="inline-flex items-center justify-center gap-2 bg-[#FAFAF8] hover:bg-[#F4F4F2] border border-[#E4E4E1] text-[#2D2D2D] text-xs font-semibold px-4 py-3 rounded-2xl transition cursor-pointer shadow-xs shrink-0"
                >
                    {isFiltersOpen ? (
                        <>
                            <FaXmark className="w-4 h-4 text-[#FF7A59]" /> Ocultar Filtros
                        </>
                    ) : (
                        <>
                            <FaSliders className="w-4 h-4 text-[#FF7A59]" /> Filtrar Ocorrências
                            {activeFiltersCount > 0 && (
                                <span className="bg-[#FF7A59] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </>
                    )}
                </button>
            </div>

            {/* Caixa de Filtros Retrátil */}
            <div
                className={`grid transition-all duration-300 ease-in-out overflow-hidden ${isFiltersOpen ? "grid-rows-[1fr] opacity-100 mb-6" : "grid-rows-[0fr] opacity-0 mb-0"
                    }`}
            >
                <div className="overflow-hidden space-y-4">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#6B7280]">
                            <FaMagnifyingGlass className="w-4 h-4" />
                        </span>
                        <input
                            type="text"
                            name="search"
                            placeholder="Buscar por nome, raça ou descrição..."
                            value={filters.search}
                            onChange={handleFilterChange}
                            className="w-full bg-[#FAFAF8] border border-[#E4E4E1] rounded-2xl pl-11 pr-4 py-3 text-sm text-[#2D2D2D] placeholder-[#6B7280] focus:outline-none focus:border-[#FF7A59] shadow-xs transition"
                        />
                    </div>

                    <div className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-3xl p-4 sm:p-5 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            <select
                                name="species"
                                value={filters.species}
                                onChange={handleFilterChange}
                                className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-4 py-3 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition cursor-pointer shadow-xs"
                            >
                                <option value="">Todas Espécies</option>
                                <option value="dog">Cachorro</option>
                                <option value="cat">Gato</option>
                                <option value="other">Outros</option>
                            </select>

                            <select
                                name="size"
                                value={filters.size}
                                onChange={handleFilterChange}
                                className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-4 py-3 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition cursor-pointer shadow-xs"
                            >
                                <option value="">Tamanho</option>
                                <option value="small">Pequeno</option>
                                <option value="medium">Médio</option>
                                <option value="large">Grande</option>
                            </select>

                            <select
                                name="sex"
                                value={filters.sex}
                                onChange={handleFilterChange}
                                className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-4 py-3 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition cursor-pointer shadow-xs"
                            >
                                <option value="">Sexo</option>
                                <option value="male">Macho</option>
                                <option value="female">Fêmea</option>
                            </select>

                            <input
                                type="text"
                                name="city"
                                placeholder="Cidade (ex: Curitiba)"
                                value={filters.city}
                                onChange={handleFilterChange}
                                className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-4 py-3 text-sm text-[#2D2D2D] placeholder-[#6B7280] focus:outline-none focus:border-[#FF7A59] transition shadow-xs"
                            />

                            <button
                                onClick={resetFilters}
                                type="button"
                                className="w-full bg-[#F4F4F2] hover:bg-[#E4E4E1] text-[#2D2D2D] text-sm font-semibold rounded-2xl px-4 py-3 border border-[#E4E4E1] transition cursor-pointer shadow-xs sm:col-span-2 lg:col-span-1"
                            >
                                Limpar Filtros
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de Cards */}
            {isPending ? (
                <div className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-3xl p-12 text-center text-[#6B7280]">
                    Carregando ocorrências...
                </div>
            ) : pets.length === 0 ? (
                <div className="bg-[#F4F4F2] border border-[#E4E4E1] rounded-3xl p-12 text-center">
                    <h4 className="text-lg font-bold font-['Manrope'] text-[#2D2D2D] mb-1">Nenhum registro encontrado</h4>
                    <p className="text-[#6B7280] text-sm">Não há ocorrências correspondentes aos filtros selecionados.</p>
                </div>
            ) : (
                <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 transition-opacity duration-200 ${isFetching ? "opacity-50" : "opacity-100"}`}>
                    {pets.map((pet: any) => (
                        <PetCard
                            key={pet.id}
                            pet={pet}
                            onClick={() => setSelectedPet(pet)}
                        />
                    ))}
                </div>
            )}

            {/* Paginação */}
            {totalPages > 1 && (
                <div className="mt-8">
                    <Pagination
                        current={page}
                        total={totalPages}
                        onNext={() => handlePagination("next")}
                        onPrevious={() => handlePagination("previous")}
                    />
                </div>
            )}

            {/* Modal Unificado de Detalhes */}
            <PetDetailModal
                pet={selectedPet}
                isOpen={Boolean(selectedPet)}
                onClose={() => setSelectedPet(null)}
            />
        </section>
    );
}