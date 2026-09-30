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

export const PetType = {
  ADOPTION: "adoption",
  LOST: "lost",
  FOUND: "found",
} as const;
export type PetType = (typeof PetType)[keyof typeof PetType];

export const PetStatus = {
  ACTIVE: "active",
  RESOLVED: "resolved",
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

export interface Ngo {
  id: string;
  name: string;
  description?: string | null;
  city: string;
  state: string;
  phone: string;
  pixKey?: string | null;
  logo?: string | null;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Pet {
  id: string;
  name: string;
  species: Species | string;
  breed?: string | null;
  age?: number | null;
  gender?: PetSex | string | null;
  size?: PetSize | string | null;
  type: PetType | string;
  status: PetStatus | string;
  city: string;
  state: string;
  date?: string | null;
  contactName: string;
  phone: string;
  description?: string | null;
  photos?: string[];
  photo?: string | null;
  reward?: string | null;
  userId: string;
  user?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePetInput {
  name: string;
  species: Species;
  breed?: string;
  age?: number;
  gender?: PetSex;
  size?: PetSize;
  type?: PetType;
  city: string;
  state: string;
  date?: string;
  contactName: string;
  phone: string;
  description?: string;
  photos?: string[];
  photo?: string;
  reward?: string;
}

export interface Pagination {
  page: number;
  perPage: number;
  totalRecords: number;
  totalPages: number;
}

export interface PetsResponse {
  pets?: Pet[];
  animals?: Pet[]; // Suporte temporário a legado caso alguma rota antiga retorne "animals"
  pagination: Pagination;
}

export interface PetFilters {
  type?: PetType | string;
  species?: Species | "";
  size?: PetSize | "";
  gender?: PetSex | "";
  sex?: PetSex | "";
  city?: string;
  search?: string;
  age?: string;
  page?: number;
  perPage?: number;
}