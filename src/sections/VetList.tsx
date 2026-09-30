import { useState } from "react";
import { FaPhone, FaLocationDot, FaClock, FaXmark } from "react-icons/fa6";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

interface VetPartner {
    id: string;
    name: string;
    type?: "Clinica" | "Veterinario";
    image?: string;
    avatarUrl: string;
    crmv?: string;
    city?: string;
    phone: string;
    address: string;
    hours?: string;
    specialty: string;
    description?: string | null;
}

const MOCK_VETS: VetPartner[] = [
    {
        id: "mock-1",
        name: "Clínica Veterinária Amigo Fiel",
        type: "Clinica",
        avatarUrl: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7",
        crmv: "CRMV-PR 1234",
        city: "Curitiba - PR",
        phone: "(41) 3322-1122",
        address: "Av. Visconde de Guarapuava, 2800",
        hours: "Seg a Sex: 08h às 20h | Sáb: 08h às 14h",
        specialty: "Clínica Geral, Cirurgia e Internamento",
        description: "Infraestrutura completa com centro cirúrgico moderno, exames laboratoriais e atendimento humanizado para cães e gatos."
    },
    {
        id: "mock-2",
        name: "Dra. Juliana Mendes",
        type: "Veterinario",
        avatarUrl: "https://images.unsplash.com/photo-1594824813575-263a23a886df",
        crmv: "CRMV-PR 5678",
        city: "Curitiba - PR",
        phone: "(41) 99888-7766",
        address: "Atendimento Domiciliar e Especializado",
        hours: "Com hora marcada",
        specialty: "Dermatologia Veterinária e Alergias",
        description: "Especialista em cuidados de pele, testes alérgicos e tratamentos dermatológicos avançados para pets."
    },
    {
        id: "mock-3",
        name: "Hospital Veterinário 24h PetSaúde",
        type: "Clinica",
        avatarUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09",
        crmv: "CRMV-PR 9988",
        city: "Curitiba - PR",
        phone: "(41) 3019-9900",
        address: "Rua Dos Canários, 450",
        hours: "Plantão 24 Horas",
        specialty: "Emergência, UTI e Diagnóstico por Imagem",
        description: "Pronto-socorro veterinário 24h equipado com raio-x digital, ultrassonografia e equipe de plantão especializada."
    }
];

export function VetsList() {

    const [selectedVet, setSelectedVet] = useState<VetPartner | null>(null);
    const { data: rawVets = [], isLoading } = useQuery<VetPartner[]>({
        queryKey: ["vets"],
        queryFn: async () => {
            try {
                const response = await api.get("/vets");
                return response.data;
            } catch {
                return [];
            }
        },
    });

    const vets = rawVets.length > 0 ? rawVets : MOCK_VETS;

    return (
        <section className="w-full font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-3xl font-bold font-['Manrope'] text-[#2D2D2D] mb-1 tracking-tight">
                        Clínicas e Veterinários
                    </h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed">
                        Profissionais e estabelecimentos parceiros prontos para cuidar da saúde do seu pet no Adote2Pets.
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="bg-[#F4F4F2] border border-[#E4E4E1] rounded-3xl h-80 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {vets.map((vet) => {
                        const avatarSrc = vet.avatarUrl || vet.image;
                        return (
                            <div
                                key={vet.id}
                                onClick={() => setSelectedVet(vet)}
                                className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-3xl overflow-hidden hover:border-[#FF7A59]/50 transition-all duration-300 cursor-pointer flex flex-col group relative shadow-xs hover:shadow-xl"
                            >
                                <div className="relative w-full aspect-[4/5] sm:aspect-square bg-[#F4F4F2] flex items-center justify-center overflow-hidden">
                                    <img
                                        src={avatarSrc || "https://images.unsplash.com/photo-1584132967334-10e028bd69f7"}
                                        alt={vet.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 left-3 z-10">
                                        <span className="text-xs px-3 py-1 rounded-full bg-[#FAFAF8]/90 backdrop-blur-md text-[#FF7A59] font-semibold border border-[#FF7A59]/20 shadow-xs">
                                            {vet.type === "Clinica" ? "Clínica" : "Veterinário(a)"}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="text-base font-bold font-['Manrope'] text-[#2D2D2D] leading-snug group-hover:text-[#FF7A59] transition-colors line-clamp-1">
                                                {vet.name}
                                            </h3>
                                            <p className="text-xs text-[#6B7280] font-medium mt-1 line-clamp-1">
                                                {vet.specialty}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedVet && (
                <div className="fixed inset-0 z-50 bg-[#2D2D2D]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative text-[#2D2D2D] p-6 sm:p-8 space-y-6">
                        <button
                            onClick={() => setSelectedVet(null)}
                            type="button"
                            className="absolute top-5 right-5 bg-[#F4F4F2] hover:bg-[#E4E4E1] text-[#6B7280] hover:text-[#2D2D2D] p-2.5 rounded-2xl transition cursor-pointer z-20 border border-[#E4E4E1]"
                            title="Fechar"
                        >
                            <FaXmark className="w-5 h-5" />
                        </button>

                        <div className="relative w-full aspect-square bg-[#F4F4F2] rounded-2xl overflow-hidden shadow-inner border border-[#E4E4E1]">
                            <img src={selectedVet.avatarUrl || selectedVet.image} alt={selectedVet.name} className="w-full h-full object-cover" />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FF7A59]/10 text-[#FF7A59] border border-[#FF7A59]/20">
                                        {selectedVet.type === "Clinica" ? "Clínica Veterinária" : "Profissional Autônomo"}
                                    </span>
                                    {selectedVet.city && (
                                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F4F4F2] text-[#6B7280] border border-[#E4E4E1]">
                                            {selectedVet.city}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-2xl font-bold font-['Manrope'] text-[#2D2D2D] mt-2">{selectedVet.name}</h3>
                                <p className="text-xs font-semibold text-[#FF7A59] mt-1 uppercase tracking-wider">
                                    {selectedVet.specialty}
                                </p>
                                {selectedVet.description && (
                                    <p className="text-sm text-[#6B7280] leading-relaxed mt-2">{selectedVet.description}</p>
                                )}
                            </div>

                            <div className="bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl p-4 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-[#2D2D2D]">
                                    <div className="p-2.5 bg-[#FF7A59]/10 text-[#FF7A59] rounded-xl shrink-0">
                                        <FaPhone className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">{selectedVet.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-[#2D2D2D]">
                                    <div className="p-2.5 bg-[#FF7A59]/10 text-[#FF7A59] rounded-xl shrink-0">
                                        <FaLocationDot className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">{selectedVet.address}</span>
                                </div>
                                {selectedVet.hours && (
                                    <div className="flex items-center gap-3 text-sm text-[#2D2D2D]">
                                        <div className="p-2.5 bg-[#FF7A59]/10 text-[#FF7A59] rounded-xl shrink-0">
                                            <FaClock className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium">{selectedVet.hours}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedVet(null)}
                            className="w-full bg-[#FF7A59] hover:bg-[#e0694a] text-white font-semibold py-3.5 rounded-2xl transition cursor-pointer shadow-sm text-sm"
                        >
                            Fechar Informações
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}