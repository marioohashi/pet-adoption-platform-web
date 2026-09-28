import { useState, useEffect } from "react";
import { FaXmark, FaBuilding, FaTrash, FaPlus } from "react-icons/fa6";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ZodError, z } from "zod";

import { api } from "../services/api";
import { uploadToCloudinary } from "../services/cloudinary";
import { Input } from "./Input";
import { Button } from "./Button";
import { ConfirmModal } from "./ConfirmModal";
import { useEscapeKey } from "../hooks/useEscapeKey";

interface NGO {
    id: string;
    name: string;
    image: string;
    city: string;
    phone: string;
    website: string;
    description?: string | null;
}

interface CreateNgoModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: NGO | null;
}

const createNgoSchema = z.object({
    name: z.string().trim().min(2, "Informe o nome da ONG (mínimo 2 caracteres)"),
    city: z.string().trim().min(2, "Informe a cidade e estado (ex: Curitiba - PR)"),
    phone: z.string().trim().min(5, "Informe um telefone válido"),
    website: z.string().trim().min(3, "Informe o site ou rede social"),
    description: z.string().optional(),
});

export function CreateNgoModal({ isOpen, onClose, initialData }: CreateNgoModalProps) {
    const queryClient = useQueryClient();

    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [phone, setPhone] = useState("");
    const [website, setWebsite] = useState("");
    const [description, setDescription] = useState("");

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
                setCity(initialData.city || "");
                setPhone(initialData.phone || "");
                setWebsite(initialData.website || "");
                setDescription(initialData.description || "");
                setImagePreview(initialData.image || "");
                setSelectedFile(null);
            } else {
                resetForm();
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    function resetForm() {
        setName("");
        setCity("");
        setPhone("");
        setWebsite("");
        setDescription("");
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

            // Se o usuário selecionou um arquivo novo, envia direto para o Cloudinary
            if (selectedFile) {
                finalImageUrl = await uploadToCloudinary(selectedFile);
            }

            if (!finalImageUrl || finalImageUrl.startsWith("blob:")) {
                throw new Error("A imagem da ONG é obrigatória e deve ser enviada com sucesso.");
            }

            const validatedData = createNgoSchema.parse({
                name,
                city,
                phone,
                website,
                description: description.trim() || undefined,
            });

            const payload = {
                ...validatedData,
                image: finalImageUrl, // Envia a URL segura do Cloudinary (ex: https://res.cloudinary.com/...)
            };

            if (isEditing && initialData) {
                await api.put(`/ngos/${initialData.id}`, payload);
            } else {
                await api.post("/ngos", payload);
            }

            queryClient.invalidateQueries({ queryKey: ["ngos"] });
            forceClose();
        } catch (error) {
            if (error instanceof ZodError) {
                setErrorMessage(error.issues[0].message);
            } else if (error instanceof AxiosError) {
                const responseData = error.response?.data;
                setErrorMessage(responseData?.error || responseData?.message || "Erro ao salvar ONG.");
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
                            <FaBuilding className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {isEditing ? "Editar ONG Parceira" : "Cadastrar ONG Parceira"}
                            </h2>
                            <p className="text-xs text-gray-400">
                                Insira as informações da instituição de proteção animal
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

                        {/* Imagem da ONG */}
                        <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1.5">
                                Foto / Logotipo da ONG <span className="text-amber-500">*</span>
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="relative w-20 h-20 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <FaBuilding className="w-8 h-8 text-gray-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-700 border border-gray-700 text-gray-200 text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition">
                                        <FaPlus className="w-3.5 h-3.5 text-amber-400" /> Escolher imagem
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-[10px] text-gray-400 mt-1">Recomendado formato PNG ou JPG proporção quadrada.</p>
                                </div>
                                {imagePreview && (
                                    <button
                                        type="button"
                                        onClick={() => { setImagePreview(""); setSelectedFile(null); }}
                                        className="p-2 text-gray-400 hover:text-red-400 transition"
                                        title="Remover imagem"
                                    >
                                        <FaTrash className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <Input
                            required
                            legend="Nome da ONG"
                            placeholder="Ex: Amigo Animal Curitiba"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                required
                                legend="Cidade / Estado"
                                placeholder="Ex: Curitiba - PR"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />

                            <Input
                                required
                                legend="Telefone / Contato"
                                placeholder="(41) 99999-8888"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        <Input
                            required
                            legend="Website / Rede Social"
                            placeholder="https://www.exemplo.org.br"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                        />

                        <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1">
                                Descrição / Sobre a Instituição
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Conte sobre o trabalho da ONG..."
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
                                {isEditing ? "Salvar Alterações" : "Cadastrar ONG"}
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