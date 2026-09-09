import { useQuery } from "@tanstack/react-query";
import { getPets } from "../services/petService";
import { PetListCard } from "./PetListCard";

export function PetList() {
  const { data: pets, isLoading, isError } = useQuery({
    queryKey: ["pets"],
    queryFn: getPets,
  });

  if (isLoading) return <p className="text-center py-6">Carregando pets...</p>;
  if (isError) return <p className="text-center py-6 text-red-500">Erro ao carregar.</p>;

  return (
    <section id="pets" className="max-w-6xl mx-auto px-6 py-12">
      <h3 className="text-3xl font-bold mb-6 text-gray-800">Pets Disponíveis</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pets?.map((pet) => (
          <PetListCard key={pet.id} pet={pet} />
        ))}
      </div>
    </section>
  );
}
