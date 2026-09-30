import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";
import { FaSliders, FaXmark, FaMagnifyingGlass } from "react-icons/fa6";
import { getPets } from "../services/petService";
import { PetListCard } from "../sections/PetListCard";
import { PetDetailModal } from "../modals/PetDetailModal";
import { Pagination } from "../components/Pagination";
import { type Pet, type PetsResponse, Species, PetSize, PetSex } from "../types";
import { Hero } from "../sections/Hero";

const PER_PAGE = 9;

export function PetList() {

  const [activeTab] = useState<"adoption" | "lost" | "found">("adoption");

  const [filters, setFilters] = useState({
    species: "" as Species | "",
    size: "" as PetSize | "",
    sex: "" as PetSex | "",
    age: "",
    search: "",
    city: "",
  });

  const [page, setPage] = useState(1);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const { data, isPending, isFetching, isError } = useQuery<PetsResponse>({
    queryKey: ["pets", activeTab, filters, page],
    queryFn: () =>
      getPets({
        page,
        perPage: PER_PAGE,
        type: activeTab,
        ...filters,
      }),
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
      age: "",
      search: "",
      city: "",
    });
    setPage(1);
  }

  if (isPending) {
    return <p className="text-center py-12 text-[#6B7280] font-sans">Carregando pets...</p>;
  }

  if (isError) {
    return <p className="text-center py-12 text-red-500 font-sans">Erro ao carregar pets.</p>;
  }

  return (
    <section id="pets" className="w-full font-sans space-y-6 text-base">
      {/* Cabeçalho / Hero */}
      <div className="flex flex-col gap-4">
        <Hero pets={pets} />
      </div>

      {/* Barra de Ações: Botão "Adicionar Pet" logo antes dos Filtros */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setIsFiltersOpen((prev) => !prev)}
          type="button"
          className="inline-flex items-center gap-2 bg-[#FAFAF8] hover:bg-[#F4F4F2] border border-[#E4E4E1] text-[#2D2D2D] text-xs font-semibold px-4 py-3 rounded-2xl transition cursor-pointer shadow-xs"
        >
          {isFiltersOpen ? (
            <>
              <FaXmark className="w-4 h-4 text-[#FF7A59]" /> Ocultar Filtros
            </>
          ) : (
            <>
              <FaSliders className="w-4 h-4 text-[#FF7A59]" /> Filtrar Pets
              {activeFiltersCount > 0 && (
                <span className="bg-[#FF7A59] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Caixa de Filtros Avançados Retrátil */}
      <div
        className={`grid transition-all duration-300 ease-in-out overflow-hidden ${isFiltersOpen ? "grid-rows-[1fr] opacity-100 mb-6" : "grid-rows-[0fr] opacity-0 mb-0"
          }`}
      >
        <div className="overflow-hidden space-y-4">
          {/* Barra de Busca Geral */}
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
              className="w-full bg-[#FAFAF8] border border-[#E4E4E1] rounded-2xl pl-11 pr-4 py-3.5 text-base text-[#2D2D2D] placeholder-[#6B7280] focus:outline-none focus:border-[#FF7A59] shadow-xs transition"
            />
          </div>

          {/* Seletadores de Filtros Avançados */}
          <div className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Filtros Avançados
              </h4>
              {activeFiltersCount > 0 && (
                <span className="text-[11px] font-semibold text-[#FF7A59]">
                  {activeFiltersCount} {activeFiltersCount === 1 ? "filtro ativo" : "filtros ativos"}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              <select
                name="species"
                value={filters.species}
                onChange={handleFilterChange}
                className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-4 py-3.5 text-base text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition cursor-pointer shadow-xs"
              >
                <option value="">Espécie</option>
                <option value={Species.DOG}>Cachorro</option>
                <option value={Species.CAT}>Gato</option>
                <option value={Species.OTHER}>Outros</option>
              </select>

              <select
                name="size"
                value={filters.size}
                onChange={handleFilterChange}
                className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-4 py-3.5 text-base text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition cursor-pointer shadow-xs"
              >
                <option value="">Tamanho</option>
                <option value={PetSize.SMALL}>Pequeno</option>
                <option value={PetSize.MEDIUM}>Médio</option>
                <option value={PetSize.LARGE}>Grande</option>
              </select>

              <select
                name="sex"
                value={filters.sex}
                onChange={handleFilterChange}
                className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-4 py-3.5 text-base text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition cursor-pointer shadow-xs"
              >
                <option value="">Sexo</option>
                <option value={PetSex.MALE}>Macho</option>
                <option value={PetSex.FEMALE}>Fêmea</option>
              </select>

              <input
                type="text"
                name="city"
                placeholder="Cidade (ex: Curitiba)"
                value={filters.city}
                onChange={handleFilterChange}
                className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-4 py-3.5 text-base text-[#2D2D2D] placeholder-[#6B7280] focus:outline-none focus:border-[#FF7A59] transition shadow-xs"
              />

              <select
                name="age"
                value={filters.age}
                onChange={handleFilterChange}
                className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-4 py-3.5 text-base text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition cursor-pointer shadow-xs"
              >
                <option value="">Idade</option>
                <option value="0-24">Até 2 anos</option>
                <option value="24-84">2 a 7 anos</option>
                <option value="84+">Mais de 7 anos</option>
              </select>

              <button
                onClick={resetFilters}
                type="button"
                className="w-full bg-[#F4F4F2] hover:bg-[#E4E4E1] text-[#2D2D2D] text-base font-semibold rounded-2xl px-4 py-3.5 border border-[#E4E4E1] transition cursor-pointer shadow-xs"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Cards de Pets */}
      {pets.length === 0 ? (
        <div className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-3xl p-12 text-center my-6 shadow-xs">
          <h4 className="text-lg font-bold font-['Manrope'] text-[#2D2D2D] mb-1">Nenhum pet encontrado</h4>
          <p className="text-[#6B7280] text-sm">Tente ajustar os filtros de busca.</p>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 transition-opacity duration-200 ${isFetching ? "opacity-50" : "opacity-100"
            }`}
        >
          {pets.map((pet: Pet) => (
            <PetListCard
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

      {/* Modais */}
      <PetDetailModal
        pet={selectedPet}
        isOpen={Boolean(selectedPet)}
        onClose={() => setSelectedPet(null)}
      />
    </section>
  );
}