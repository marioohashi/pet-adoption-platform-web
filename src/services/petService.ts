import { api } from "./api";
import type {
  Pet,
  Species,
  PetSize,
  PetSex,
  PetsResponse,
} from "../types";

export interface GetPetsParams {
  page: number;
  perPage: number;
  species?: Species | string;
  size?: PetSize | string;
  sex?: PetSex | string;
  age?: string;
}

export async function getPets({
  page,
  perPage,
  species,
  size,
  sex,
  age,
}: GetPetsParams): Promise<PetsResponse> {
  const response = await api.get("/animals", {
    params: {
      page,
      perPage,
      species: species || undefined,
      size: size || undefined,
      sex: sex || undefined,
      age: age || undefined,
    },
  });

  return response.data;
}


export async function getMyPets(): Promise<Pet[]> {
  const response = await api.get("/animals/me");
  // Se a sua API retornar um objeto { animals: [...] }, troque para: response.data.animals
  return response.data;
}


export async function deletePet(id: string): Promise<void> {
  await api.delete(`/animals/${id}`);
}

export async function updatePet(id: string, data: Partial<Pet>): Promise<Pet> {
  const response = await api.put(`/animals/${id}`, data);
  return response.data;
}