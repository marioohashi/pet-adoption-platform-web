import { useState } from "react";
import type {Pet} from "../types"

export function PetListCard({ pet }: { pet: Pet }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* CARD */}
      <div
        onClick={() => setOpen(true)}
        className="cursor-pointer border rounded-xl shadow-md bg-white hover:shadow-lg transition p-4"
      >
        <img
          src={pet.photo || "/imagens/pet-default.jpg"}
          alt={pet.name}
          className="w-full h-48 object-cover rounded-lg mb-3"
        />

        <h3 className="text-xl font-bold">{pet.name}</h3>
        <p className="text-gray-600">
          {pet.species} • {pet.breed || "SRD"}
        </p>

        <span className="inline-block mt-3 text-xs uppercase bg-blue-100 text-blue-800 font-semibold px-2 py-1 rounded">
          {pet.status}
        </span>
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            <img
              src={pet.photo || "/imagens/pet-default.jpg"}
              alt={pet.name}
              className="w-full h-64 object-cover rounded-lg mb-4"
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

            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
              Quero Adotar ❤️
            </button>
          </div>
        </div>
      )}
    </>
  );
}
