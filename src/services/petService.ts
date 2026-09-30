import { api } from "./api";
import { AxiosError } from "axios";

import type {
  Pet,
  Species,
  PetSize,
  PetSex,
  PetType,
  PetsResponse,
} from "../types";

export interface GetPetsParams {
  page: number;
  perPage: number;
  type?: PetType | string;
  species?: Species | string;
  size?: PetSize | string;
  sex?: PetSex | string;
  gender?: PetSex | string;
  city?: string;
  search?: string;
  age?: string;
}

export async function getPets(params: GetPetsParams): Promise<PetsResponse> {
  const response = await api.get("/pets", {
    params: {
      page: params.page,
      perPage: params.perPage,
      type: params.type || undefined,
      species: params.species || undefined,
      size: params.size || undefined,
      sex: params.sex || params.gender || undefined,
      city: params.city || undefined,
      search: params.search || undefined,
      age: params.age || undefined,
    },
  });

  return response.data;
}

export async function getMyPets(): Promise<Pet[]> {
  const response = await api.get("/pets/me");
  return response.data;
}

export async function deletePet(id: string): Promise<void> {
  try {
    await api.delete(`/pets/${id}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Erro detalhado do backend ao deletar:", error.response?.data);
      const serverMessage = error.response?.data?.message || "Erro interno ao excluir o pet.";

      throw new Error(serverMessage, { cause: error });
    }
    throw error;
  }
}

export async function updatePet(id: string, data: Partial<Pet>): Promise<Pet> {
  try {
    const response = await api.put(`/pets/${id}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Erro detalhado do backend ao atualizar pet:", error.response?.data);
      const serverMessage = error.response?.data?.message || "Erro interno ao atualizar o pet.";

      throw new Error(serverMessage, { cause: error });
    }
    throw error;
  }
}