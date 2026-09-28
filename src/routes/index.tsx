import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AppLayout } from "../components/AppLayout";
import { ProtectedRoute } from "../components/ProtectedRoute";

import { PetList } from "../components/PetList";
import { MyPetsList } from "../components/MyPetsList";
import { NGOsList } from "../components/NGOsList"
import { VetsList } from "../components/VetList"
import { LostPets } from "../components/LostPets"

const NewPetPage = () => <div className="p-4 text-white">Anunciar Pet</div>;

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppLayout />}>

                    <Route path="/" element={<Navigate to="/pets" replace />} />
                    <Route path="/pets" element={<PetList />} />
                    <Route path="/perdidos" element={<LostPets />} />
                    <Route path="/ongs" element={<NGOsList />} />
                    <Route path="/clinicas" element={<VetsList />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/meus-pets" element={<MyPetsList />} />
                    </Route>

                </Route>

                <Route path="*" element={<Navigate to="/pets" replace />} />
            </Routes>
        </BrowserRouter>
    );
}