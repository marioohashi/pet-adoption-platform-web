import { Outlet } from "react-router-dom";
import { Header } from "../sections/Header";
import { Footer } from "../sections/Footer";

export function AppLayout() {

    return (
        <div className="min-h-screen w-full bg-[#FAFAF8] text-[#2D2D2D] flex flex-col font-sans selection:bg-[#FF7A59]/20 selection:text-[#FF7A59]">

            <Header />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}