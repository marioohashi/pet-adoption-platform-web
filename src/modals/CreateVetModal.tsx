import { useState, useEffect } from "react";
import { FaXmark, FaUserDoctor, FaTrash, FaPlus } from "react-icons/fa6";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ZodError, z } from "zod";

import { api } from "../services/api";
import { uploadToCloudinary } from "../services/cloudinary";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { ConfirmModal } from "./ConfirmModal";
import { useEscapeKey } from "../hooks/useEscapeKey";

interface Vet {
    id: string;
    name: string;
    avatarUrl: string;
    crmv: string;
    specialty: string;
    phone: string;
    address: string;
}

interface CreateVetModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Vet | null;
}

const createVetSchema = z.object({
    name: z.string().trim().min(2, "Informe o nome do veterinário"),
    crmv: z.string().trim().min(2, "Informe o CRMV"),
    specialty: z.string().trim().min(2, "Informe a especialidade"),
    phone: z.string().trim().min(5, "Informe um telefone válido"),
    address: z.string().trim().min(3, "Informe o endereço ou clínica"),
});

export function CreateVetModal({ isOpen, onClose, initialData }: CreateVetModalProps) {
    const queryClient = useQueryClient();

    const [name, setName] = useState("");
    const [crmv, setCrmv] = useState("");
    const [specialty, setSpecialty] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    const [imagePreview, setImagePreview] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const isEditing = Boolean(initialData?.id);

    useEscapeKey(handleRequestClose, isOpen);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name || "");
                setCrmv(initialData.crmv || "");
                setSpecialty(initialData.specialty || "");
                setPhone(initialData.phone || "");
                setAddress(initialData.address || "");
                setImagePreview(initialData.avatarUrl || "");
                setSelectedFile(null);
            } else {
                resetForm();
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    function resetForm() {
        setName("");
        setCrmv("");
        setSpecialty("");
        setPhone("");
        setAddress("");
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
            let finalAvatarUrl = imagePreview;

            if (selectedFile) {
                finalAvatarUrl = await uploadToCloudinary(selectedFile);
            }

            if (!finalAvatarUrl || finalAvatarUrl.startsWith("blob:")) {
                throw new Error("A foto do veterinário é obrigatória.");
            }

            const validatedData = createVetSchema.parse({
                name,
                crmv,
                specialty,
                phone,
                address,
            });

            const payload = {
                ...validatedData,
                avatarUrl: finalAvatarUrl,
            };

            if (isEditing && initialData) {
                await api.put(`/vets/${initialData.id}`, payload);
            } else {
                await api.post("/vets", payload);
            }

            queryClient.invalidateQueries({ queryKey: ["vets"] });
            forceClose();
        } catch (error) {
            if (error instanceof ZodError) {
                setErrorMessage(error.issues[0].message);
            } else if (error instanceof AxiosError) {
                const responseData = error.response?.data;
                setErrorMessage(responseData?.error || responseData?.message || "Erro ao salvar veterinário.");
            } else if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("Erro ao processar a imagem ou requisição.");
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
                            <FaUserDoctor className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold font-['Manrope'] text-[#2D2D2D] tracking-tight">
                                {isEditing ? "Editar Veterinário" : "Cadastrar Veterinário"}
                            </h2>
                            <p className="text-xs text-[#6B7280] mt-0.5">
                                Insira as informações do profissional parceiro
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
                                Foto do Profissional <span className="text-[#FF7A59]">*</span>
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="relative w-20 h-20 bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <FaUserDoctor className="w-8 h-8 text-[#6B7280]" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="inline-flex items-center gap-2 bg-[#F4F4F2] hover:bg-[#E4E4E1] border border-[#E4E4E1] text-[#2D2D2D] text-xs font-semibold px-4 py-3 rounded-2xl cursor-pointer transition shadow-xs">
                                        <FaPlus className="w-3.5 h-3.5 text-[#FF7A59]" /> Escolher foto
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
                                        title="Remover foto"
                                    >
                                        <FaTrash className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <Input
                            required
                            legend="Nome do Veterinário"
                            placeholder="Ex: Dr. Carlos Silva"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                required
                                legend="CRMV"
                                placeholder="Ex: CRMV-PR 12345"
                                value={crmv}
                                onChange={(e) => setCrmv(e.target.value)}
                            />

                            <Input
                                required
                                legend="Especialidade"
                                placeholder="Ex: Clínico Geral / Cirurgião"
                                value={specialty}
                                onChange={(e) => setSpecialty(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                required
                                legend="Telefone / Contato"
                                placeholder="(41) 99999-8888"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />

                            <Input
                                required
                                legend="Endereço / Clínica"
                                placeholder="Ex: Rua das Flores, 123"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="w-full bg-[#FF7A59] hover:bg-[#e0694a] text-white font-semibold py-3.5 rounded-2xl shadow-sm text-sm transition cursor-pointer"
                            >
                                {isEditing ? "Salvar Alterações" : "Cadastrar Veterinário"}
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