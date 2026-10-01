import { useState, useEffect } from "react";
import { FaXmark, FaBuilding, FaUserDoctor, FaTrash, FaPlus } from "react-icons/fa6";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ZodError, z } from "zod";
import { formatPhone } from "../utils/formatPhone";
import { api } from "../services/api";
import { uploadToCloudinary } from "../services/cloudinary";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { ConfirmModal } from "./ConfirmModal";
import { useEscapeKey } from "../hooks/useEscapeKey";
import type { NGO, VetPartner } from "../types";
import { LocationAutocomplete } from "../components/LocationAutocomplete";
interface PartnerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: "ngo" | "vet";
    initialData?: NGO | VetPartner | null;
}

const ngoSchema = z.object({
    name: z.string().trim().min(2, "Informe o nome da ONG (mínimo 2 caracteres)"),
    city: z.string().trim().min(2, "Informe a cidade"),
    state: z.string().trim().min(2, "Informe o estado (ex: PR)"),
    phone: z.string().trim().min(5, "Informe um telefone válido"),
    website: z.string().trim().min(3, "Informe o site ou rede social"),
    pixKey: z.string().optional(),
    description: z.string().optional(),
});

const vetSchema = z.object({
    name: z.string().trim().min(2, "Informe o nome do veterinário"),
    type: z.enum(["clinic", "veterinarian"], {
        message: "Selecione o tipo de parceiro",
    }), city: z.string().trim().min(2, "Informe a cidade"),
    state: z.string().trim().min(2, "Informe o estado (ex: PR)"),
    phone: z.string().trim().min(5, "Informe um telefone válido"),
    address: z.string().trim().min(3, "Informe o endereço"),
    hours: z.string().trim().min(3, "Informe os horários de atendimento"),
    specialty: z.string().trim().min(2, "Informe a especialidade"),
    crmv: z.string().optional(),
    website: z.string().optional(),
    description: z.string().optional(),
});

export function PartnerFormModal({ isOpen, onClose, type, initialData }: PartnerFormModalProps) {
    const queryClient = useQueryClient();
    const isEditing = Boolean(initialData?.id);
    const isNgo = type === "ngo";

    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [phone, setPhone] = useState("");
    const [website, setWebsite] = useState("");
    const [description, setDescription] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Campos específicos de ONG
    const [pixKey, setPixKey] = useState("");

    // Campos específicos de Veterinário
    const [vetType, setVetType] = useState("");
    const [address, setAddress] = useState("");
    const [hours, setHours] = useState("");
    const [specialty, setSpecialty] = useState("");
    const [crmv, setCrmv] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEscapeKey(handleRequestClose, isOpen);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name || "");
                setCity(initialData.city || "");
                setState(initialData.state || "");
                setPhone(initialData.phone || "");
                setWebsite(initialData.website || "");
                setDescription(initialData.description || "");
                setImagePreview(initialData.image || "");

                if (isNgo) {
                    const ngo = initialData as NGO;
                    setPixKey(ngo.pixKey || "");
                } else {
                    const vet = initialData as VetPartner;
                    setVetType((vet.type as string) || "");
                    setAddress(vet.address || "");
                    setHours(vet.hours || "");
                    setSpecialty(vet.specialty || "");
                    setCrmv(vet.crmv || "");
                }
                setSelectedFile(null);
            } else {
                resetForm();
            }
        }
    }, [isOpen, initialData, isNgo]);

    if (!isOpen) return null;

    function resetForm() {
        setName("");
        setCity("");
        setState("");
        setPhone("");
        setWebsite("");
        setDescription("");
        setPixKey("");
        setVetType("");
        setAddress("");
        setHours("");
        setSpecialty("");
        setCrmv("");
        setImagePreview("");
        setSelectedFile(null);
        setErrorMessage(null);
    }

    function handleRequestClose() {
        if (name.trim() !== "" || imagePreview !== "") {
            setShowConfirmModal(true);
            return;
        }
        forceClose();
    }

    function forceClose() {
        setShowConfirmModal(false);
        resetForm();
        onClose();
    }

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setImagePreview(URL.createObjectURL(file));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMessage(null);
        setIsLoading(true);

        try {
            let finalImageUrl = imagePreview;

            if (selectedFile) {
                finalImageUrl = await uploadToCloudinary(selectedFile);
            }

            if (!finalImageUrl || finalImageUrl.startsWith("blob:")) {
                throw new Error("A imagem é obrigatória e deve ser enviada com sucesso.");
            }

            if (isNgo) {
                const validatedData = ngoSchema.parse({
                    name,
                    city,
                    state,
                    phone,
                    website,
                    pixKey: pixKey.trim() || undefined,
                    description: description.trim() || undefined,
                });

                const payload = {
                    ...validatedData,
                    image: finalImageUrl,
                };

                if (isEditing && initialData) {
                    await api.put(`/ngos/${initialData.id}`, payload);
                } else {
                    await api.post("/ngos", payload);
                }

                queryClient.invalidateQueries({ queryKey: ["admin-ongs"] });
                queryClient.invalidateQueries({ queryKey: ["ngos"] });
            } else {
                const validatedData = vetSchema.parse({
                    name,
                    type: vetType,
                    city,
                    state,
                    phone,
                    address,
                    hours,
                    specialty,
                    crmv: crmv.trim() || undefined,
                    website: website.trim() || undefined,
                    description: description.trim() || undefined,
                });

                const payload = {
                    ...validatedData,
                    image: finalImageUrl,
                };

                if (isEditing && initialData) {
                    await api.put(`/vets/${initialData.id}`, payload);
                } else {
                    await api.post("/vets", payload);
                }

                queryClient.invalidateQueries({ queryKey: ["admin-vets"] });
                queryClient.invalidateQueries({ queryKey: ["vets"] });
            }

            forceClose();
        } catch (error) {
            if (error instanceof ZodError) {
                setErrorMessage(error.issues[0].message);
            } else if (error instanceof AxiosError) {
                const responseData = error.response?.data;
                setErrorMessage(responseData?.error || responseData?.message || `Erro ao salvar ${isNgo ? "ONG" : "veterinário"}.`);
            } else if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("Erro ao processar a imagem ou requisição. Tente novamente.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sans">
                <div className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative text-[#2D2D2D] flex flex-col max-h-[90vh]">

                    <button
                        onClick={handleRequestClose}
                        type="button"
                        className="absolute top-5 right-5 z-10 bg-[#F4F4F2] hover:bg-[#E4E4E1] text-[#6B7280] hover:text-[#2D2D2D] p-2.5 rounded-xl transition cursor-pointer"
                    >
                        <FaXmark className="w-5 h-5" />
                    </button>

                    <div className="p-6 sm:p-7 pb-4 border-b border-[#E4E4E1] flex items-center gap-3.5">
                        <div className="p-3 bg-[#FF7A59]/10 rounded-2xl text-[#FF7A59]">
                            {isNgo ? <FaBuilding className="w-6 h-6" /> : <FaUserDoctor className="w-6 h-6" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold font-['Manrope'] text-[#2D2D2D] tracking-tight">
                                {isEditing
                                    ? (isNgo ? "Editar ONG Parceira" : "Editar Veterinário")
                                    : (isNgo ? "Cadastrar ONG Parceira" : "Cadastrar Veterinário")}
                            </h2>
                            <p className="text-xs text-[#6B7280] mt-0.5">
                                {isNgo ? "Insira as informações da instituição de proteção animal" : "Insira as informações do profissional parceiro"}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 sm:p-7 overflow-y-auto space-y-4 flex-1">
                        {errorMessage && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl text-center break-words font-medium">
                                {errorMessage}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-[#2D2D2D] mb-1.5">
                                {isNgo ? "Logotipo da ONG" : "Foto / Imagem do Veterinário"} <span className="text-[#FF7A59]">*</span>
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="relative w-20 h-20 bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        isNgo ? <FaBuilding className="w-8 h-8 text-[#6B7280]" /> : <FaUserDoctor className="w-8 h-8 text-[#6B7280]" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="inline-flex items-center gap-2 bg-[#F4F4F2] hover:bg-[#E4E4E1] border border-[#E4E4E1] text-[#2D2D2D] text-xs font-semibold px-4 py-3 rounded-2xl cursor-pointer transition shadow-xs">
                                        <FaPlus className="w-3.5 h-3.5 text-[#FF7A59]" /> Escolher imagem
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-[10px] text-[#6B7280] mt-1">Recomendado formato PNG ou JPG proporção quadrada.</p>
                                </div>
                                {imagePreview && (
                                    <button
                                        type="button"
                                        onClick={() => { setImagePreview(""); setSelectedFile(null); }}
                                        className="p-2.5 text-[#6B7280] hover:text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                                        title="Remover imagem"
                                    >
                                        <FaTrash className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <Input
                            required
                            legend={isNgo ? "Nome da ONG" : "Nome do Veterinário / Clínica"}
                            placeholder={isNgo ? "Ex: Amigo Animal Curitiba" : "Ex: Dr. Carlos Silva"}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        {isNgo ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <LocationAutocomplete
                                        city={city}
                                        state={state}
                                        onChange={(newCity, newState) => {
                                            setCity(newCity);
                                            setState(newState);
                                        }}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        required
                                        legend="Telefone / Contato"
                                        placeholder="(41) 99999-8888"
                                        value={phone}
                                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                                    />

                                    <Input
                                        legend="Chave PIX (Opcional)"
                                        placeholder="CNPJ ou E-mail"
                                        value={pixKey}
                                        onChange={(e) => setPixKey(e.target.value)}
                                    />
                                </div>

                                <Input
                                    required
                                    legend="Website / Rede Social"
                                    placeholder="https://www.exemplo.org.br"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                />
                            </>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-[#2D2D2D] mb-1.5">
                                            Tipo <span className="text-[#FF7A59]">*</span>
                                        </label>
                                        <select
                                            required
                                            value={vetType}
                                            onChange={(e) => setVetType(e.target.value)}
                                            className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl p-3 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition shadow-xs"
                                        >
                                            <option value="" disabled>Selecione o tipo</option>
                                            <option value="clinic">Clínica</option>
                                            <option value="veterinarian">Veterinário(a)</option>
                                        </select>
                                    </div>

                                    <Input
                                        required
                                        legend="Especialidade"
                                        placeholder="Ex: Clínico Geral / Cirurgião"
                                        value={specialty}
                                        onChange={(e) => setSpecialty(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                    <LocationAutocomplete
                                        city={city}
                                        state={state}
                                        onChange={(newCity, newState) => {
                                            setCity(newCity);
                                            setState(newState);
                                        }}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        required
                                        legend="Telefone / Contato"
                                        placeholder="(41) 99999-8888"
                                        value={phone}
                                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                                    />

                                    <Input
                                        legend="CRMV (Opcional)"
                                        placeholder="Ex: CRMV-PR 12345"
                                        value={crmv}
                                        onChange={(e) => setCrmv(e.target.value)}
                                    />
                                </div>

                                <Input
                                    required
                                    legend="Endereço"
                                    placeholder="Ex: Rua das Flores, 123"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        required
                                        legend="Horário de Atendimento"
                                        placeholder="Ex: Seg a Sex das 08h às 18h"
                                        value={hours}
                                        onChange={(e) => setHours(e.target.value)}
                                    />

                                    <Input
                                        legend="Website / Rede Social (Opcional)"
                                        placeholder="https://www.exemplo.com.br"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">
                                Descrição / Sobre {isNgo ? "a Instituição" : "o Profissional"}
                            </label>
                            <textarea
                                rows={3}
                                placeholder={isNgo ? "Conte sobre o trabalho da ONG..." : "Conte sobre os serviços prestados..."}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl p-3 text-sm text-[#2D2D2D] placeholder-[#6B7280] focus:outline-none focus:border-[#FF7A59] transition resize-none shadow-xs"
                            />
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="w-full bg-[#FF7A59] hover:bg-[#e0694a] text-white font-semibold py-3.5 rounded-2xl shadow-sm text-sm transition cursor-pointer"
                            >
                                {isEditing ? "Salvar Alterações" : (isNgo ? "Cadastrar ONG" : "Cadastrar Veterinário")}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            <ConfirmModal
                isOpen={showConfirmModal}
                onConfirm={forceClose}
                onCancel={() => setShowConfirmModal(false)}
            />
        </>
    );
}