import { useState, useEffect } from "react";
import { FaXmark, FaPaw, FaTrash, FaPlus } from "react-icons/fa6";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ZodError, z } from "zod";

import { api } from "../services/api";
import { uploadToCloudinary } from "../services/cloudinary";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { ConfirmModal } from "./ConfirmModal";
import { useEscapeKey } from "../hooks/useEscapeKey";
import type { Pet } from "../types/index";

interface CreatePetModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Pet | null;
}

const createPetSchema = z.object({
    name: z.string().trim().min(2, "Informe o nome do pet (mínimo 2 caracteres)"),
    species: z.enum(["dog", "cat", "other"]),
    breed: z.string().optional(),
    age: z.number().min(0, "Idade inválida").optional(),
    size: z.string().optional(),
    gender: z.string().optional(),
    city: z.string().trim().min(2, "Informe a cidade"),
    state: z.string().trim().min(2, "Informe o estado (UF)"),
    contactName: z.string().trim().min(2, "Informe o nome para contato"),
    phone: z.string().trim().min(8, "Informe um telefone válido"),
    description: z.string().optional(),
});

export function CreatePetModal({ isOpen, onClose, initialData }: CreatePetModalProps) {
    const queryClient = useQueryClient();

    const [name, setName] = useState("");
    const [species, setSpecies] = useState<"dog" | "cat" | "other">("dog");
    const [breed, setBreed] = useState("");
    const [years, setYears] = useState("0");
    const [months, setMonths] = useState("0");
    const [size, setSize] = useState("");
    const [gender, setGender] = useState("");
    const [city, setCity] = useState("Curitiba");
    const [state, setState] = useState("PR");
    const [contactName, setContactName] = useState("");
    const [phone, setPhone] = useState("");
    const [description, setDescription] = useState("");

    const [photos, setPhotos] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const isEditing = Boolean(initialData?.id);

    useEscapeKey(handleRequestClose, isOpen);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name || "");
                setSpecies((initialData.species as "dog" | "cat" | "other") || "dog");
                setBreed(initialData.breed || "");

                const totalMonths = initialData.age ?? 0;
                setYears(String(Math.floor(totalMonths / 12)));
                setMonths(String(totalMonths % 12));

                setSize(initialData.size || "");
                setGender(initialData.gender || initialData.sex || "");
                setCity(initialData.city || "Curitiba");
                setState(initialData.state || "PR");
                setContactName(initialData.contactName || "");
                setPhone(initialData.phone || "");
                setDescription(initialData.description || "");

                const initialPhotos = initialData.photos && initialData.photos.length > 0
                    ? initialData.photos
                    : initialData.photo ? [initialData.photo] : [];

                setPhotos(initialPhotos);
                setSelectedFiles([]);
            } else {
                resetForm();
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    function resetForm() {
        setName("");
        setSpecies("dog");
        setBreed("");
        setYears("0");
        setMonths("0");
        setSize("");
        setGender("");
        setCity("Curitiba");
        setState("PR");
        setContactName("");
        setPhone("");
        setDescription("");
        setPhotos([]);
        setSelectedFiles([]);
        setErrorMessage(null);
    }

    function handleRequestClose() {
        if (photos.length > 0 || name.trim() !== "") {
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

    function handleAddPhotos(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const maxAvailableSlots = 5 - (photos.length + selectedFiles.length);
        const filesToAdd = files.slice(0, maxAvailableSlots);

        const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file));

        setSelectedFiles((prev) => [...prev, ...filesToAdd]);
        setPhotos((prev) => [...prev, ...newPreviews]);
    }

    function handleRemovePhoto(indexToRemove: number) {
        setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
        setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMessage(null);
        setIsLoading(true);

        try {
            const uploadedUrls = await Promise.all(
                selectedFiles.map((file) => uploadToCloudinary(file))
            );

            const existingUrls = photos.filter((p) => p.startsWith("http"));
            const finalPhotosList = [...existingUrls, ...uploadedUrls];

            const totalAgeInMonths = (Number(years) || 0) * 12 + (Number(months) || 0);

            const validatedData = createPetSchema.parse({
                name,
                type: "adoption", // Forçado fixo como adoção
                species,
                breed: breed.trim() || undefined,
                age: totalAgeInMonths,
                size: size || undefined,
                gender: gender || undefined,
                city,
                state,
                contactName,
                phone,
                description: description.trim() || undefined,
            });

            const payload = {
                ...validatedData,
                photos: finalPhotosList,
                photo: finalPhotosList[0] || "",
            };

            if (isEditing && initialData) {
                await api.put(`/pets/${initialData.id}`, payload);
            } else {
                await api.post("/pets", payload);
            }

            queryClient.invalidateQueries({ queryKey: ["pets"] });
            queryClient.invalidateQueries({ queryKey: ["my-pets"] });
            forceClose();
        } catch (error) {
            if (error instanceof ZodError) {
                setErrorMessage(error.issues[0].message);
            } else if (error instanceof AxiosError) {
                const responseData = error.response?.data;
                setErrorMessage(responseData?.message || "Erro ao salvar as informações do pet.");
            } else {
                setErrorMessage("Erro ao realizar upload das imagens. Tente novamente.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sans">
                <div className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative text-[#2D2D2D] flex flex-col max-h-[92vh]">

                    {/* Botão Fechar */}
                    <button
                        onClick={handleRequestClose}
                        type="button"
                        className="absolute top-5 right-5 z-10 bg-[#F4F4F2] hover:bg-[#E4E4E1] text-[#6B7280] hover:text-[#2D2D2D] p-2.5 rounded-xl transition cursor-pointer"
                    >
                        <FaXmark className="w-5 h-5" />
                    </button>

                    {/* Cabeçalho */}
                    <div className="p-6 sm:p-7 pb-4 border-b border-[#E4E4E1] flex items-center gap-3.5">
                        <div className="p-3 bg-[#FF7A59]/10 rounded-2xl text-[#FF7A59]">
                            <FaPaw className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold font-['Manrope'] text-[#2D2D2D] tracking-tight">
                                {isEditing ? "Editar Anúncio de Adoção" : "Cadastrar Pet para Adoção"}
                            </h2>
                            <p className="text-xs text-[#6B7280] mt-0.5">
                                Preencha os detalhes do pet para encontrar um novo lar responsável
                            </p>
                        </div>
                    </div>

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="p-6 sm:p-7 overflow-y-auto space-y-4 flex-1">
                        {errorMessage && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl text-center break-words font-medium">
                                {errorMessage}
                            </div>
                        )}

                        {/* Galeria de Fotos */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-semibold text-[#2D2D2D]">
                                    Fotos ({photos.length}/5)
                                </label>
                                {photos.length > 0 && (
                                    <span className="text-[10px] text-[#FF7A59] font-medium">
                                        A primeira foto será a capa
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                                {photos.map((photo, index) => (
                                    <div
                                        key={index}
                                        className="relative aspect-square bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl overflow-hidden group shadow-xs"
                                    >
                                        <img
                                            src={photo}
                                            alt={`Foto ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        {index === 0 && (
                                            <span className="absolute top-1.5 left-1.5 bg-[#FF7A59] text-white font-bold text-[9px] px-2 py-0.5 rounded-lg shadow-xs">
                                                Capa
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePhoto(index)}
                                            className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-600 text-white p-1.5 rounded-lg transition"
                                            title="Remover foto"
                                        >
                                            <FaTrash className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}

                                {photos.length < 5 && (
                                    <label className="aspect-square bg-[#F4F4F2] border-2 border-dashed border-[#E4E4E1] hover:border-[#FF7A59] rounded-2xl flex flex-col items-center justify-center cursor-pointer transition text-[#6B7280] hover:text-[#FF7A59]">
                                        <FaPlus className="w-5 h-5 mb-1" />
                                        <span className="text-[10px] font-semibold">Adicionar</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleAddPhotos}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Nome e Espécie */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                required
                                legend="Nome do Pet"
                                placeholder="Ex: Thor"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />

                            <div>
                                <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">
                                    Espécie <span className="text-[#FF7A59]">*</span>
                                </label>
                                <select
                                    value={species}
                                    onChange={(e) => setSpecies(e.target.value as "dog" | "cat" | "other")}
                                    className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-3 py-3 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition shadow-xs"
                                >
                                    <option value="dog">Cachorro</option>
                                    <option value="cat">Gato</option>
                                    <option value="other">Outros</option>
                                </select>
                            </div>
                        </div>

                        {/* Raça e Idade */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                legend="Raça"
                                placeholder="Ex: Vira-lata, Poodle..."
                                value={breed}
                                onChange={(e) => setBreed(e.target.value)}
                            />

                            <div>
                                <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">
                                    Idade Aproximada
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        value={years}
                                        onChange={(e) => setYears(e.target.value)}
                                        className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-2.5 py-3 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition shadow-xs"
                                    >
                                        {Array.from({ length: 21 }, (_, i) => (
                                            <option key={i} value={i}>{i} {i === 1 ? "ano" : "anos"}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={months}
                                        onChange={(e) => setMonths(e.target.value)}
                                        className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-2.5 py-3 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition shadow-xs"
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i} value={i}>{i} {i === 1 ? "mês" : "meses"}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Porte e Gênero */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">Porte</label>
                                <select
                                    value={size}
                                    onChange={(e) => setSize(e.target.value)}
                                    className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-3 py-3 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition shadow-xs"
                                >
                                    <option value="">Selecione o porte</option>
                                    <option value="small">Pequeno</option>
                                    <option value="medium">Médio</option>
                                    <option value="large">Grande</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">Sexo / Gênero</label>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-3 py-3 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition shadow-xs"
                                >
                                    <option value="">Selecione o sexo</option>
                                    <option value="male">Macho</option>
                                    <option value="female">Fêmea</option>
                                </select>
                            </div>
                        </div>

                        {/* Localização (Cidade e Estado) */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                                <Input
                                    required
                                    legend="Cidade"
                                    placeholder="Ex: Curitiba"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                            </div>
                            <div>
                                <Input
                                    required
                                    legend="Estado (UF)"
                                    placeholder="PR"
                                    value={state}
                                    onChange={(e) => setState(e.target.value.toUpperCase())}
                                    maxLength={2}
                                />
                            </div>
                        </div>

                        {/* Dados de Contato */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                required
                                legend="Nome para Contato"
                                placeholder="Seu nome"
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                            />

                            <Input
                                required
                                legend="Telefone / WhatsApp"
                                placeholder="(41) 99999-9999"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        {/* Descrição */}
                        <div>
                            <label className="block text-xs font-semibold text-[#2D2D2D] mb-1">
                                História / Informações sobre o Pet
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Conte sobre a personalidade do pet, se é castrado, vacinado ou se dá bem com outros animais..."
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
                                {isEditing ? "Salvar Alterações" : "Publicar Anúncio de Adoção"}
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