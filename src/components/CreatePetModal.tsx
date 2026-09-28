import { useState, useEffect } from "react";
import { FaXmark, FaPaw, FaTrash, FaPlus } from "react-icons/fa6";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ZodError, z } from "zod";

import { api } from "../services/api";
import { uploadToCloudinary } from "../services/cloudinary"; // 🟢 Nosso helper do Cloudinary
import { Input } from "./Input";
import { Button } from "./Button";
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
    sex: z.string().optional(),
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
    const [sex, setSex] = useState("");
    const [description, setDescription] = useState("");

    // Armazena as URLs das fotos ou arquivos selecionados localmente
    const [photos, setPhotos] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // Para arquivos novos

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
                setSex(initialData.sex || "");
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
        setSex("");
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

    // 🟢 Acumula os arquivos reais selecionados para upload posterior
    function handleAddPhotos(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const maxAvailableSlots = 5 - (photos.length + selectedFiles.length);
        const filesToAdd = files.slice(0, maxAvailableSlots);

        // Cria previews locais imediatos para o usuário ver
        const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file));

        setSelectedFiles((prev) => [...prev, ...filesToAdd]);
        setPhotos((prev) => [...prev, ...newPreviews]);
    }

    function handleRemovePhoto(indexToRemove: number) {
        setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
        // Se for um arquivo novo pendente de upload, remove da lista de files também
        setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMessage(null);
        setIsLoading(true);

        try {
            // 1. Faz upload dos novos arquivos para o Cloudinary e obtém as URLs oficiais
            const uploadedUrls = await Promise.all(
                selectedFiles.map((file) => uploadToCloudinary(file))
            );

            // Junta as URLs que já existiam (caso de edição) com as recém-upadas do Cloudinary
            const existingUrls = photos.filter((p) => p.startsWith("http"));
            const finalPhotosList = [...existingUrls, ...uploadedUrls];

            const totalAgeInMonths = (Number(years) || 0) * 12 + (Number(months) || 0);

            const validatedData = createPetSchema.parse({
                name,
                species,
                breed: breed.trim() || undefined,
                age: totalAgeInMonths,
                size: size || undefined,
                sex: sex || undefined,
                description: description.trim() || undefined,
            });

            const payload = {
                ...validatedData,
                photos: finalPhotosList,
                photo: finalPhotosList[0] || "", // Primeira foto como capa
            };

            if (isEditing && initialData) {
                await api.put(`/animals/${initialData.id}`, payload);
            } else {
                await api.post("/animals", payload);
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
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-gray-800 border border-gray-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative text-gray-100 flex flex-col max-h-[90vh]">

                    {/* Botão Fechar */}
                    <button
                        onClick={handleRequestClose}
                        type="button"
                        className="absolute top-4 right-4 z-10 bg-gray-900/60 text-gray-400 hover:text-white p-1.5 rounded-lg transition cursor-pointer"
                    >
                        <FaXmark className="w-5 h-5" />
                    </button>

                    {/* Cabeçalho */}
                    <div className="p-6 pb-2 border-b border-gray-700/60 flex items-center gap-3">
                        <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400">
                            <FaPaw className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {isEditing ? "Editar Pet" : "Anunciar Pet"}
                            </h2>
                            <p className="text-xs text-gray-400">
                                Adicione até 5 fotos para a galeria do pet
                            </p>
                        </div>
                    </div>

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
                        {errorMessage && (
                            <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-xs p-3 rounded-lg text-center break-words">
                                {errorMessage}
                            </div>
                        )}

                        {/* Galeria de Fotos */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-medium text-gray-300">
                                    Fotos do Pet ({photos.length}/5)
                                </label>
                                {photos.length > 0 && (
                                    <span className="text-[10px] text-amber-400">
                                        A primeira foto será a capa
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {photos.map((photo, index) => (
                                    <div
                                        key={index}
                                        className="relative aspect-square bg-gray-900 border border-gray-700 rounded-xl overflow-hidden group"
                                    >
                                        <img
                                            src={photo}
                                            alt={`Foto ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        {index === 0 && (
                                            <span className="absolute top-1 left-1 bg-amber-500 text-gray-950 font-bold text-[9px] px-1.5 py-0.5 rounded-md shadow-md">
                                                Capa
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePhoto(index)}
                                            className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white p-1 rounded-md transition"
                                            title="Remover foto"
                                        >
                                            <FaTrash className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}

                                {photos.length < 5 && (
                                    <label className="aspect-square bg-gray-900 border-2 border-dashed border-gray-700 hover:border-amber-500/60 rounded-xl flex flex-col items-center justify-center cursor-pointer transition text-gray-400 hover:text-amber-400">
                                        <FaPlus className="w-5 h-5 mb-1" />
                                        <span className="text-[10px] font-medium">Adicionar</span>
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

                        {/* Demais campos do formulário (Nome, Espécie, Raça, Idade, Porte, Sexo, Descrição) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                required
                                legend="Nome do Pet"
                                placeholder="Ex: Thor"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />

                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">
                                    Espécie <span className="text-amber-500">*</span>
                                </label>
                                <select
                                    value={species}
                                    onChange={(e) => setSpecies(e.target.value as "dog" | "cat" | "other")}
                                    className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500 transition"
                                >
                                    <option value="dog">Cachorro</option>
                                    <option value="cat">Gato</option>
                                    <option value="other">Outros</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                legend="Raça"
                                placeholder="Ex: Vira-lata, Poodle..."
                                value={breed}
                                onChange={(e) => setBreed(e.target.value)}
                            />

                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">
                                    Idade Aproximada
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        value={years}
                                        onChange={(e) => setYears(e.target.value)}
                                        className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-2.5 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500 transition"
                                    >
                                        {Array.from({ length: 21 }, (_, i) => (
                                            <option key={i} value={i}>{i} {i === 1 ? "ano" : "anos"}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={months}
                                        onChange={(e) => setMonths(e.target.value)}
                                        className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-2.5 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500 transition"
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i} value={i}>{i} {i === 1 ? "mês" : "meses"}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">Porte</label>
                                <select
                                    value={size}
                                    onChange={(e) => setSize(e.target.value)}
                                    className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500 transition"
                                >
                                    <option value="">Selecione o porte</option>
                                    <option value="small">Pequeno</option>
                                    <option value="medium">Médio</option>
                                    <option value="large">Grande</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">Sexo</label>
                                <select
                                    value={sex}
                                    onChange={(e) => sex}
                                    onChange={(e) => setSex(e.target.value)}
                                    className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500 transition"
                                >
                                    <option value="">Selecione o sexo</option>
                                    <option value="male">Macho</option>
                                    <option value="female">Fêmea</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1">
                                História / Descrição
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Conte um pouco sobre o temperamento e os cuidados que o pet precisa..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-gray-900/60 border border-gray-700 rounded-lg p-3 text-sm text-gray-100 focus:outline-none focus:border-amber-500 transition resize-none"
                            />
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold"
                            >
                                {isEditing ? "Salvar" : "Cadastrar Pet"}
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