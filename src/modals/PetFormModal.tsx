import { useState, useEffect, useRef } from "react";
import type React from "react";
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
import { LocationAutocomplete } from "../components/LocationAutocomplete";
import { formatPhone } from "../utils/formatPhone"

type AdObjective = "adoption" | "lost" | "found";

const objectivesList: { id: AdObjective; label: string; description: string }[] = [
    {
        id: "adoption",
        label: "Adoção",
        description: "Encontre um novo lar cheio de amor para um pet resgatado ou que precisa de um tutor."
    },
    {
        id: "lost",
        label: "Perdido",
        description: "Divulgue informações sobre um animal que fugiu para mobilizar a comunidade na busca."
    },
    {
        id: "found",
        label: "Achado",
        description: "Achou um animal perdido na rua? Ajude a reencontrar a família original dele."
    },
];

interface PetFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Pet | null;
    onDelete?: (pet: Pet) => void; // Adicionado para suportar exclusão direta do modal
}

const createPetSchema = z.object({
    name: z.string().trim().min(2, "Informe o nome do pet (mínimo 2 caracteres)"),
    type: z.enum(["adoption", "lost", "found"]),
    species: z.enum(["dog", "cat", "other"]),
    breed: z.string().optional().or(z.literal("")),
    age: z.number().min(0, "Idade inválida").optional(),
    size: z.enum(["small", "medium", "large"]).optional().or(z.literal("")),
    gender: z.enum(["male", "female"]).optional().or(z.literal("")),
    city: z.string().trim().min(2, "Informe a cidade"),
    state: z.string().trim().min(2, "Informe o estado (UF)"),
    description: z.string().optional().or(z.literal("")),
    contactName: z.string().trim().min(2, "Informe o nome de contato"),
    phone: z.string().trim().min(8, "Informe um telefone válido"),
    reward: z.string().optional().or(z.literal("")).nullable(),
    date: z.string().optional().or(z.literal("")).nullable(),
});

const selectClasses = `
    w-full
    bg-[#F4F4F2]
    border border-[#E4E4E1]
    rounded-2xl
    px-4 py-3.5
    text-sm text-[#2D2D2D]
    hover:border-[#6B7280]/40
    focus:outline-none
    focus:border-[#FF7A59]
    focus:ring-2 focus:ring-[#FF7A59]/20
    focus:bg-white
    transition-all duration-200
    shadow-xs
    cursor-pointer
    appearance-none
    bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236B7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')]
    bg-[length:12px_12px]
    bg-[right_1rem_center]
    bg-no-repeat
    pr-10
`;

export function PetFormModal({ isOpen, onClose, initialData, onDelete }: PetFormModalProps) {
    const queryClient = useQueryClient();
    const [name, setName] = useState("");
    const [type, setType] = useState<AdObjective>("adoption");
    const [species, setSpecies] = useState<"dog" | "cat" | "other">("dog");
    const [breed, setBreed] = useState("");
    const [years, setYears] = useState("0");
    const [months, setMonths] = useState("0");
    const [size, setSize] = useState("");
    const [gender, setGender] = useState("");
    const [city, setCity] = useState("Curitiba");
    const [state, setState] = useState("PR");
    const [description, setDescription] = useState("");

    const [reward, setReward] = useState("");
    const [date, setDate] = useState("");

    const [contactName, setContactName] = useState("");
    const [phone, setPhone] = useState("");

    const [photos, setPhotos] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Referência para guardar o estado inicial e comparar se houve alterações reais
    const initialSnapshot = useRef<string>("");

    const isEditing = Boolean(initialData?.id);
    const currentDescription = objectivesList.find(obj => obj.id === type)?.description;

    useEscapeKey(handleRequestClose, isOpen);

    // Função para gerar um snapshot atual do formulário em formato JSON
    function getFormSnapshot(currentData = {
        name, type, species, breed, years, months, size, gender, city, state, description, reward, date, contactName, phone, photos
    }) {
        return JSON.stringify(currentData);
    }

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                const loadedName = initialData.name || "";
                const loadedType = (initialData.type as AdObjective) || "adoption";
                const loadedSpecies = (initialData.species as "dog" | "cat" | "other") || "dog";
                const loadedBreed = initialData.breed || "";

                const totalMonths = initialData.age ?? 0;
                const loadedYears = String(Math.floor(totalMonths / 12));
                const loadedMonths = String(totalMonths % 12);

                const loadedSize = initialData.size || "";
                const loadedGender = initialData.gender || "";
                const loadedCity = initialData.city || "Curitiba";
                const loadedState = initialData.state || "PR";
                const loadedDescription = initialData.description || "";
                const loadedReward = initialData.reward || "";
                const loadedDate = initialData.date ? initialData.date.substring(0, 10) : "";
                const loadedContactName = initialData.contactName || "";
                const loadedPhone = initialData.phone || "";

                const initialPhotos = initialData.photos && initialData.photos.length > 0
                    ? initialData.photos
                    : initialData.photo ? [initialData.photo] : [];

                setName(loadedName);
                setType(loadedType);
                setSpecies(loadedSpecies);
                setBreed(loadedBreed);
                setYears(loadedYears);
                setMonths(loadedMonths);
                setSize(loadedSize);
                setGender(loadedGender);
                setCity(loadedCity);
                setState(loadedState);
                setDescription(loadedDescription);
                setReward(loadedReward);
                setDate(loadedDate);
                setContactName(loadedContactName);
                setPhone(loadedPhone);
                setPhotos(initialPhotos);
                setSelectedFiles([]);

                // Salva o snapshot inicial para comparar modificações depois
                initialSnapshot.current = getFormSnapshot({
                    name: loadedName, type: loadedType, species: loadedSpecies, breed: loadedBreed,
                    years: loadedYears, months: loadedMonths, size: loadedSize, gender: loadedGender,
                    city: loadedCity, state: loadedState, description: loadedDescription,
                    reward: loadedReward, date: loadedDate, contactName: loadedContactName,
                    phone: loadedPhone, photos: initialPhotos
                });
            } else {
                resetForm();
                initialSnapshot.current = getFormSnapshot({
                    name: "", type: "adoption", species: "dog", breed: "", years: "0", months: "0",
                    size: "", gender: "", city: "Curitiba", state: "PR", description: "",
                    reward: "", date: "", contactName: "", phone: "", photos: []
                });
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    function resetForm() {
        setName("");
        setType("adoption");
        setSpecies("dog");
        setBreed("");
        setYears("0");
        setMonths("0");
        setSize("");
        setGender("");
        setCity("Curitiba");
        setState("PR");
        setDescription("");
        setReward("");
        setDate("");
        setContactName("");
        setPhone("");
        setPhotos([]);
        setSelectedFiles([]);
        setErrorMessage(null);
    }

    function handleRequestClose() {
        const currentSnapshot = getFormSnapshot();
        // Só exibe o aviso se o formulário foi alterado em relação ao estado inicial
        if (currentSnapshot !== initialSnapshot.current) {
            setShowConfirmModal(true);
            return;
        }
        forceClose();
    }

    function forceClose() {
        setShowConfirmModal(false);
        setShowDeleteConfirm(false);
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

    function handleDeleteClick() {
        setShowDeleteConfirm(true);
    }

    function confirmDelete() {
        if (!initialData) return;
        if (onDelete) {
            onDelete(initialData);
        }
        forceClose();
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
            const formattedDate = type !== "adoption" && date ? date : null;

            const validatedData = createPetSchema.parse({
                name,
                type,
                species,
                breed: breed.trim() ? breed.trim() : undefined,
                age: totalAgeInMonths,
                size: size ? size : undefined,
                gender: gender ? gender : undefined,
                city,
                state,
                description: description.trim() ? description.trim() : undefined,
                contactName,
                phone,
                reward: type === "lost" && reward.trim() ? reward.trim() : null,
                date: formattedDate,
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
                const serverMsg =
                    typeof responseData === "object" && responseData !== null && "message" in responseData
                        ? (responseData.message as string)
                        : typeof responseData === "string"
                            ? responseData
                            : null;

                setErrorMessage(
                    serverMsg ||
                    JSON.stringify(responseData) ||
                    "Erro ao salvar as informações do pet. Verifique os campos."
                );
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
                    <div className="p-6 sm:p-7 pb-4 border-b border-[#E4E4E1] flex items-center justify-between gap-3.5">
                        <div className="flex items-center gap-3.5">
                            <div className="p-3 bg-[#FF7A59]/10 rounded-2xl text-[#FF7A59]">
                                <FaPaw className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold font-['Manrope'] text-[#2D2D2D] tracking-tight">
                                    {isEditing ? "Editar Anúncio" : "Cadastrar Anúncio de Pet"}
                                </h2>
                                <p className="text-xs text-[#6B7280] mt-0.5">
                                    Preencha os detalhes para divulgar na comunidade
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="p-6 sm:p-7 overflow-y-auto space-y-4 flex-1">
                        {errorMessage && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl text-center break-words font-medium">
                                {errorMessage}
                            </div>
                        )}

                        {/* Objetivo do Anúncio */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-[#6B7280] uppercase">Objetivo do Anúncio</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setType("adoption")}
                                    className={`py-2.5 px-3 rounded-2xl text-xs font-semibold border transition cursor-pointer ${type === "adoption" ? "bg-[#FF7A59] text-white border-[#FF7A59] shadow-xs" : "bg-[#F4F4F2] text-[#6B7280] border-[#E4E4E1] hover:bg-[#E4E4E1]"}`}
                                >
                                    Adoção
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType("lost")}
                                    className={`py-2.5 px-3 rounded-2xl text-xs font-semibold border transition cursor-pointer ${type === "lost" ? "bg-red-600 text-white border-red-600 shadow-xs" : "bg-[#F4F4F2] text-[#6B7280] border-[#E4E4E1] hover:bg-[#E4E4E1]"}`}
                                >
                                    Perdido
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType("found")}
                                    className={`py-2.5 px-3 rounded-2xl text-xs font-semibold border transition cursor-pointer ${type === "found" ? "bg-amber-600 text-white border-amber-600 shadow-xs" : "bg-[#F4F4F2] text-[#6B7280] border-[#E4E4E1] hover:bg-[#E4E4E1]"}`}
                                >
                                    Achado
                                </button>
                            </div>

                            {currentDescription && (
                                <p className="text-xs text-[#6B7280] bg-[#F4F4F2] p-3 rounded-2xl border border-[#E4E4E1] transition-all">
                                    💡 <span className="font-medium text-[#2D2D2D]">Como funciona:</span> {currentDescription}
                                </p>
                            )}
                        </div>

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
                                <label className="block text-xs font-semibold text-[#2D2D2D] mb-1.5">
                                    Espécie <span className="text-[#FF7A59]">*</span>
                                </label>
                                <select
                                    value={species}
                                    onChange={(e) => setSpecies(e.target.value as "dog" | "cat" | "other")}
                                    className={selectClasses}
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
                                <label className="block text-xs font-semibold text-[#2D2D2D] mb-1.5">
                                    Idade Aproximada
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        value={years}
                                        onChange={(e) => setYears(e.target.value)}
                                        className={selectClasses}
                                    >
                                        {Array.from({ length: 21 }, (_, i) => (
                                            <option key={i} value={i}>{i} {i === 1 ? "ano" : "anos"}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={months}
                                        onChange={(e) => setMonths(e.target.value)}
                                        className={selectClasses}
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
                                <label className="block text-xs font-semibold text-[#2D2D2D] mb-1.5">Porte</label>
                                <select
                                    value={size}
                                    onChange={(e) => setSize(e.target.value)}
                                    className={selectClasses}
                                >
                                    <option value="">Selecione o porte</option>
                                    <option value="small">Pequeno</option>
                                    <option value="medium">Médio</option>
                                    <option value="large">Grande</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#2D2D2D] mb-1.5">Sexo / Gênero</label>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className={selectClasses}
                                >
                                    <option value="">Selecione o sexo</option>
                                    <option value="male">Macho</option>
                                    <option value="female">Fêmea</option>
                                </select>
                            </div>
                        </div>


                        {/* Contato (Nome e Telefone) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <Input
                                required
                                legend="Nome para Contato"
                                placeholder="Seu nome ou responsável"
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                            />
                            <Input
                                required
                                legend="Telefone / WhatsApp"
                                placeholder="(41) 99999-9999"
                                value={phone}
                                onChange={(e) => setPhone(formatPhone(e.target.value))}

                            />
                        </div>
                        {/* Localização (Cidade e Estado) */}
                        <div className="grid grid-cols-1 gap-3">
                            <LocationAutocomplete
                                city={city}
                                state={state}
                                onChange={(newCity, newState) => {
                                    setCity(newCity);
                                    setState(newState);
                                }}
                            />
                        </div>
                        {/* Descrição */}
                        <div>
                            <label className="block text-xs font-semibold text-[#2D2D2D] mb-1.5">
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


                        {/* Campos Dinâmicos: Data e Recompensa */}
                        {(type === "lost" || type === "found") && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F4F4F2]/50 p-4 rounded-2xl border border-[#E4E4E1]">
                                <div>
                                    <label className="block text-xs font-semibold text-[#2D2D2D] mb-1.5">
                                        {type === "lost" ? "Data em que foi perdido" : "Data em que foi achado"}
                                    </label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-white border border-[#E4E4E1] rounded-2xl px-4 py-3.5 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition shadow-xs"
                                    />
                                </div>

                                {type === "lost" && (
                                    <div>
                                        <Input
                                            legend="Recompensa (Opcional)"
                                            placeholder="Ex: R$100,00"
                                            value={reward}
                                            onChange={(e) => setReward(e.target.value)}
                                            isCurrency
                                        />
                                    </div>
                                )}
                            </div>
                        )}


                        {/* Botões de Ação na Base (Salvar e Excluir se estiver editando) */}
                        <div className="pt-2 flex items-center gap-3">
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={handleDeleteClick}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-4 py-3.5 rounded-2xl transition text-sm flex items-center justify-center gap-2 cursor-pointer border border-red-200 shrink-0"
                                    title="Excluir Anúncio"
                                >
                                    <FaTrash className="w-4 h-4" />
                                    <span className="hidden sm:inline">Excluir</span>
                                </button>
                            )}

                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="w-full bg-[#FF7A59] hover:bg-[#e0694a] text-white font-semibold py-3.5 rounded-2xl shadow-sm text-sm transition cursor-pointer flex-1"
                            >
                                {isEditing ? "Salvar Alterações" : "Publicar Anúncio"}
                            </Button>
                        </div>
                    </form>

                </div>
            </div>

            {/* Modal de confirmação ao tentar fechar com alterações não salvas */}
            <ConfirmModal
                isOpen={showConfirmModal}
                title="Descartar alterações?"
                message="Você tem modificações não salvas. Tem certeza que deseja fechar?"
                confirmText="Sim, descartar"
                cancelText="Continuar editando"
                onConfirm={forceClose}
                onCancel={() => setShowConfirmModal(false)}
            />

            {/* Modal de confirmação ao clicar em excluir dentro do formulário */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                title={`Excluir "${initialData?.name || 'este pet'}"?`}
                message="Tem certeza que deseja remover este anúncio do sistema? Esta ação é irreversível."
                confirmText="Sim, excluir"
                cancelText="Cancelar"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </>
    );
}