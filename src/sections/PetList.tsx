import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";
import { getPets } from "../services/petService";
import { PetListCard } from "../sections/PetListCard";
import { PetDetailModal } from "../modals/PetDetailModal";
import { AuthModal } from "../modals/AuthModal";
import { Pagination } from "../components/Pagination";
import { type Pet, type PetsResponse, Species, PetSize, PetSex } from "../types";

const PER_PAGE = 9;

export function PetList() {
  const [filters, setFilters] = useState({
    species: "" as Species | "",
    size: "" as PetSize | "",
    sex: "" as PetSex | "",
    age: "",
  });

  const [page, setPage] = useState(1);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { data, isPending, isFetching, isError } = useQuery<PetsResponse>({
    queryKey: ["pets", filters, page],
    queryFn: () =>
      getPets({
        page,
        perPage: PER_PAGE,
        ...filters,
      }),
    placeholderData: keepPreviousData,
  });

  const pets = data?.animals ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  function handleFilterChange(e: React.ChangeEvent<HTMLSelectElement>) {
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
    <section id="pets" className="w-full font-sans">
      {/* Título */}
      <div className="mb-6">
        <h3 className="text-3xl font-bold font-['Manrope'] text-[#2D2D2D] mb-1 tracking-tight">
          Pets Disponíveis
        </h3>
        <p className="text-sm text-[#6B7280]">
          Encontre seu novo amigo e agende um match de adoção
        </p>
      </div>

      {/* Caixa de Filtros */}
      <div className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-2xl p-4 shadow-sm mb-8">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-3 block">
          Filtrar Pets
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <select
            name="species"
            value={filters.species}
            onChange={handleFilterChange}
            className="bg-[#F4F4F2] border border-[#E4E4E1] rounded-xl px-3 py-2.5 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition cursor-pointer"
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
            className="bg-[#F4F4F2] border border-[#E4E4E1] rounded-xl px-3 py-2.5 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition cursor-pointer"
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
            className="bg-[#F4F4F2] border border-[#E4E4E1] rounded-xl px-3 py-2.5 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition cursor-pointer"
          >
            <option value="">Sexo</option>
            <option value={PetSex.MALE}>Macho</option>
            <option value={PetSex.FEMALE}>Fêmea</option>
          </select>

          <select
            name="age"
            value={filters.age}
            onChange={handleFilterChange}
            className="bg-[#F4F4F2] border border-[#E4E4E1] rounded-xl px-3 py-2.5 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition cursor-pointer"
          >
            <option value="">Idade</option>
            <option value="0-2">0–2 anos</option>
            <option value="3-6">3–6 anos</option>
            <option value="7-10">7–10 anos</option>
            <option value="11+">11+ anos</option>
          </select>

          <button
            onClick={resetFilters}
            className="bg-[#F4F4F2] hover:bg-[#E4E4E1] text-[#2D2D2D] text-sm font-semibold rounded-xl px-4 py-2.5 border border-[#E4E4E1] transition cursor-pointer"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Grid de Cards */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 transition-opacity ${isFetching ? "opacity-50" : "opacity-100"
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

      {/* Componente de Paginação */}
      <div className="mt-8">
        <Pagination
          current={page}
          total={totalPages}
          onNext={() => handlePagination("next")}
          onPrevious={() => handlePagination("previous")}
        />
      </div>

      {/* Modal de Detalhes do Pet */}
      <PetDetailModal
        pet={selectedPet}
        onClose={() => setSelectedPet(null)}
        onRequireAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Modal de Autenticação (caso clique em adotar sem estar logado) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="signin"
      />
    </section>
  );
}