import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export function AppLayout() {

    return (
        <div className="min-h-screen w-full bg-gray-900 text-gray-100 flex flex-col">

            <Header />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Outlet />
            </main>
        </div>
    );
}