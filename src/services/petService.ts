import { api } from "./api";
import type {
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