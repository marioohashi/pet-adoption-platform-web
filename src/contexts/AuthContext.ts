import { createContext } from "react"

export type UserAPIResponse = {
    token: string
    user: {
        id: string
        name: string
        email: string
        role: string
    }
}

export type AuthContextData = {
    session: null | UserAPIResponse
    save: (data: UserAPIResponse) => void
    remove: () => void
}

export const AuthContext = createContext<AuthContextData | undefined>(undefined)