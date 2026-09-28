import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FaPaw } from "react-icons/fa6";

export function AuthLayout() {
    const { session } = useAuth();

    if (session) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen w-full bg-gray-400 flex flex-col justify-center items-center text-gray-100 p-8">
            <main className="bg-gray-500 p-8 rounded-md flex items-center flex-col w-full md:max-w-[462px]">
                <FaPaw className="my-8 text-amber-500 w-16 h-16" />
                <Outlet />
            </main>
        </div>
    );
}