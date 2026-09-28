export const UserRole = {
  ADMIN: "admin",
  USER: "user",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const Species = {
  CAT: "cat",
  DOG: "dog",
  OTHER: "other",
} as const;
export type Species = (typeof Species)[keyof typeof Species];

export const PetStatus = {
  AVAILABLE: "available",
  IN_PROCESS: "in_process",
  ADOPTED: "adopted",
} as const;
export type PetStatus = (typeof PetStatus)[keyof typeof PetStatus];

export const PetSize = {
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
} as const;
export type PetSize = (typeof PetSize)[keyof typeof PetSize];

export const PetSex = {
  MALE: "male",
  FEMALE: "female",
} as const;
export type PetSex = (typeof PetSex)[keyof typeof PetSex];


export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  bio?: string | null;
  city?: string | null;
  state?: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  size?: string;
  sex?: string;
  description?: string;
  photos?: string[]; // 🟢 Lista de fotos da galeria
  photo?: string;    // Foto principal
  status?: string;
  createdAt?: string;
}

export interface CreatePetInput {
  name: string;
  species: Species;
  breed?: string;
  age?: number;
  size?: PetSize;
  sex?: PetSex;
  description?: string;
  photo?: string;
}


export interface Pagination {
  page: number;
  perPage: number;
  totalRecords: number;
  totalPages: number;
}

export interface PetsResponse {
  animals: Pet[];
  pagination: Pagination;
}

export interface PetFilters {
  species?: Species | "";
  size?: PetSize | "";
  sex?: PetSex | "";
  age?: string;
}