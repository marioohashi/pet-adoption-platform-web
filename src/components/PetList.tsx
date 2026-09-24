import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getPets } from "../services/petService";
import { PetListCard } from "./PetListCard";
import { Pagination } from "./Pagination";
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

  const { data, isLoading, isError } = useQuery<PetsResponse>({
    queryKey: ["pets", filters, page],
    queryFn: () =>
      getPets({
        page,
        perPage: PER_PAGE,
        ...filters,
      }),
    placeholderData: (prev) => prev,
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

  if (isLoading) return <p className="text-center py-6">Carregando pets...</p>;
  if (isError) return <p className="text-center py-6 text-red-500">Erro ao carregar.</p>;

  return (
    <section id="pets" className="max-w-6xl mx-auto px-6 py-12">
      <h3 className="text-3xl font-bold mb-6 text-gray-800">Pets Disponíveis</h3>

      {/* Filtros */}
      <div className="bg-white border rounded-xl p-4 shadow-sm mb-8">
        <h4 className="text-lg font-semibold mb-3">Filtrar Pets</h4>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <select
            name="species"
            value={filters.species}
            onChange={handleFilterChange}
            className="border p-2 rounded"
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
            className="border p-2 rounded"
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
            className="border p-2 rounded"
          >
            <option value="">Sexo</option>
            <option value={PetSex.MALE}>Macho</option>
            <option value={PetSex.FEMALE}>Fêmea</option>
          </select>

          <select
            name="age"
            value={filters.age}
            onChange={handleFilterChange}
            className="border p-2 rounded"
          >
            <option value="">Idade</option>
            <option value="0-2">0–2 anos</option>
            <option value="3-6">3–6 anos</option>
            <option value="7-10">7–10 anos</option>
            <option value="11+">11+ anos</option>
          </select>

          <button
            onClick={resetFilters}
            className="border p-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pets.map((pet: Pet) => (
          <PetListCard key={pet.id} pet={pet} />
        ))}
      </div>

      <Pagination
        current={page}
        total={totalPages}
        onNext={() => handlePagination("next")}
        onPrevious={() => handlePagination("previous")}
      />
    </section>
  );
}