import { createContext } from "react"

export type UserAPIResponse = {
    token: string
    user: {
        id: string
        name: string
        email: string
        role: string
        avatar: string
        phone?: string | null
        bio?: string | null
        city?: string | null
        state?: string | null
    }
}

export type AuthContextData = {
    session: null | UserAPIResponse
    save: (data: UserAPIResponse) => void
    updateSession: (updatedUser: UserAPIResponse["user"]) => void
    remove: () => void
    isAdmin: boolean
}

export const AuthContext = createContext<AuthContextData | undefined>(undefined)