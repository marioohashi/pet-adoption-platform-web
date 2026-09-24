import { createContext, useEffect, useState, type ReactNode } from "react"
import { api } from "../services/api"

type UserAPIResponse = {
    token: string
    user: {
        id: string
        name: string
        email: string
        role: string
    }
}

type AuthContext = {
    isLoading: boolean
    session: null | UserAPIResponse
    save: (data: UserAPIResponse) => void
    remove: () => void
}

const LOCAL_STORAGE_KEY = "pet_adoption"

export const AuthContext = createContext({} as AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<null | UserAPIResponse>(null)
    const [isLoading, setIsLoading] = useState(true)

    function save(data: UserAPIResponse) {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_user`, JSON.stringify(data.user))
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_token`, data.token)

        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`

        setSession(data)
    }

    function remove() {
        setSession(null)
        localStorage.removeItem(`${LOCAL_STORAGE_KEY}_user`)
        localStorage.removeItem(`${LOCAL_STORAGE_KEY}_token`)
        window.location.assign("/")
    }

    function loadUser() {
        const user = localStorage.getItem(`${LOCAL_STORAGE_KEY}_user`)
        const token = localStorage.getItem(`${LOCAL_STORAGE_KEY}_token`)

        if (token && user) {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`
            setSession({ token, user: JSON.parse(user) })
        }

        setIsLoading(false)
    }

    useEffect(() => {
        loadUser()
    }, [])

    return (
        <AuthContext.Provider value={{ session, save, isLoading, remove }}>
            {children}
        </AuthContext.Provider>
    )
}