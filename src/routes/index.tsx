import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AppLayout } from "../layouts/AppLayout";
import { ProtectedRoute } from "../layouts/ProtectedRoute";

import { PetList } from "../sections/PetList";
import { MyPetsList } from "../sections/MyPetsList";
import { NGOsList } from "../sections/NGOsList"
import { VetsList } from "../sections/VetList"
import { LostPets } from "../sections/LostPets"
import { Settings } from "../sections/Settings"

import { NotFound } from "../sections/NotFound"

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppLayout />}>

                    <Route path="/" element={<PetList />} />
                    <Route path="/pets" element={<PetList />} />
                    <Route path="/perdidos" element={<LostPets />} />
                    <Route path="/ongs" element={<NGOsList />} />
                    <Route path="/clinicas" element={<VetsList />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/meus-pets" element={<MyPetsList />} />
                        <Route path="/minha-conta" element={<Settings />} />
                    </Route>

                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}