import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AppLayout } from "../components/AppLayout";
import { ProtectedRoute } from "../components/ProtectedRoute";

import { PetList } from "../components/PetList";

// Páginas temporárias
const LostPetsPage = () => <div className="p-4 text-white">Pets Perdidos</div>;
const NgosPage = () => <div className="p-4 text-white">ONGs</div>;
const ClinicsPage = () => <div className="p-4 text-white">Clínicas</div>;
const MyPetsPage = () => <div className="p-4 text-white">Meus Pets</div>;
const NewPetPage = () => <div className="p-4 text-white">Anunciar Pet</div>;

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Layout Principal com Header */}
                <Route element={<AppLayout />}>

                    {/* 1. ROTAS PÚBLICAS (Visitantes podem ver livremente) */}
                    <Route path="/" element={<Navigate to="/pets" replace />} />
                    <Route path="/pets" element={<PetList />} />
                    <Route path="/perdidos" element={<LostPetsPage />} />
                    <Route path="/ongs" element={<NgosPage />} />
                    <Route path="/clinicas" element={<ClinicsPage />} />

                    {/* 2. ROTAS PROTEGIDAS (Exigem Login) */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/pets/novo" element={<NewPetPage />} />
                        <Route path="/meus-pets" element={<MyPetsPage />} />
                    </Route>

                </Route>

                {/* Redirecionamento para URLs inválidas */}
                <Route path="*" element={<Navigate to="/pets" replace />} />
            </Routes>
        </BrowserRouter>
    );
}