import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AppLayout } from "../layouts/AppLayout";
import { ProtectedRoute } from "../layouts/ProtectedRoute";

import { PetList } from "../sections/PetList";
import { MyPetsList } from "../sections/MyPetsList";
import { NGOsList } from "../sections/NGOsList"
import { VetsList } from "../sections/VetList"
import { LostPets } from "../sections/LostPets"

import { NotFound } from "../pages/NotFound"

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

                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}