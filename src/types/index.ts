// ==========================================
// Enums
// ==========================================

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export enum Species {
  CAT = "cat",
  DOG = "dog",
  OTHER = "other",
}

export enum PetStatus {
  AVAILABLE = "available",
  IN_PROCESS = "in_process",
  ADOPTED = "adopted",
}

export enum PetSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
}

export enum PetSex {
  MALE = "male",
  FEMALE = "female",
}

// ==========================================
// Tipos de Usuário
// ==========================================

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

// ==========================================
// Tipos de Animais (Pet)
// ==========================================

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed?: string | null;
  age?: number | null;
  size?: PetSize | null;
  sex?: PetSex | null;
  description?: string | null;
  status: PetStatus;
  photo?: string | null;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// Inputs
// ==========================================

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

// ==========================================
// Paginação
// ==========================================

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
  species?: Species;
  size?: PetSize;
  sex?: PetSex;
  age?: string; // "0-2", "3-6", etc.
}
