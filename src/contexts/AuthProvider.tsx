import { useState, type ReactNode } from "react"
import { api } from "../services/api"
import { AuthContext, type UserAPIResponse } from "./AuthContext"

const LOCAL_STORAGE_KEY = "pet_adoption"

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<null | UserAPIResponse>(() => {
        const user = localStorage.getItem(`${LOCAL_STORAGE_KEY}_user`)
        const token = localStorage.getItem(`${LOCAL_STORAGE_KEY}_token`)

        if (token && user) {
            try {
                api.defaults.headers.common["Authorization"] = `Bearer ${token}`
                return { token, user: JSON.parse(user) }
            } catch {
                localStorage.removeItem(`${LOCAL_STORAGE_KEY}_user`)
                localStorage.removeItem(`${LOCAL_STORAGE_KEY}_token`)
            }
        }

        return null
    })

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
        delete api.defaults.headers.common["Authorization"]

        window.location.assign("/")
    }

    return (
        <AuthContext.Provider value={{ session, save, remove }}>
            {children}
        </AuthContext.Provider>
    )
}