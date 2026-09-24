import { useState } from "react";
import type { Pet } from "../types";

export function PetListCard({ pet }: { pet: Pet }) {
  const [open, setOpen] = useState(false);

  // fallback baseado na espécie (caso algo escape da validação do PetList)
  const fallbackImage =
    pet.species === "dog"
      ? "/imagens/dog-icon.png"
      : "/imagens/cat-icon.png";

  return (
    <>
      {/* CARD */}
      <div
        onClick={() => setOpen(true)}
        className="cursor-pointer border rounded-xl shadow-md bg-white hover:shadow-lg transition p-4"
      >
        <img
          src={pet.photo || fallbackImage}
          alt={pet.name}
          className="w-full h-48 object-cover rounded-lg mb-3"
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
        />

        <h3 className="text-xl font-bold">{pet.name}</h3>
        <p className="text-gray-600">
          {pet.species} • {pet.breed || "SRD"}
        </p>

        <span className="inline-block mt-3 text-xs uppercase bg-blue-100 text-blue-800 font-semibold px-2 py-1 rounded">
          {pet.status}
        </span>

        {pet.user && (
          <p className="text-gray-500 text-sm mt-3">
            Publicado por: <strong>{pet.user.name}</strong>
          </p>
        )}
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              ✕
            </button>

            <img
              src={pet.photo || fallbackImage}
              alt={pet.name}
              className="w-full h-64 object-cover rounded-lg mb-4"
              onError={(e) => {
                e.currentTarget.src = fallbackImage;
              }}
            />

            <h2 className="text-2xl font-bold mb-2">{pet.name}</h2>

            <p className="text-gray-700 mb-2">
              <strong>Espécie:</strong> {pet.species}
            </p>

            <p className="text-gray-700 mb-2">
              <strong>Raça:</strong> {pet.breed || "SRD"}
            </p>

            <p className="text-gray-700 mb-2">
              <strong>Idade:</strong> {pet.age} anos
            </p>

            <p className="text-gray-700 mb-2">
              <strong>Porte:</strong> {pet.size}
            </p>

            <p className="text-gray-700 mb-4">
              <strong>Descrição:</strong> {pet.description}
            </p>

            {pet.user && (
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={`https://ui-avatars.com/api/?name=${pet.user.name}`}
                  className="w-10 h-10 rounded-full"
                />
                <p className="text-gray-700">
                  <strong>Criado por:</strong> {pet.user.name} ({pet.user.email})
                </p>
              </div>
            )}

            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
              Quero Adotar ❤️
            </button>
          </div>
        </div>
      )}
    </>
  );
}
