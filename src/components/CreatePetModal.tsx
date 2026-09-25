import { useState } from "react";
import { FaXmark, FaPaw, FaCamera } from "react-icons/fa6";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ZodError, z } from "zod";

import { api } from "../services/api";
import { Input } from "./Input";
import { Button } from "./Button";

interface CreatePetModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Helper para converter o arquivo File em String Base64
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
}

const createPetSchema = z.object({
    name: z.string().trim().min(2, "Informe o nome do pet (mínimo 2 caracteres)"),
    species: z.enum(["dog", "cat", "other"], {
        errorMap: () => ({ message: "Selecione uma espécie válida" }),
    }),
    breed: z.string().optional(),
    age: z.coerce.number().min(0, "Idade não pode ser negativa").optional(),
    size: z.string().optional(),
    sex: z.string().optional(),
    description: z.string().optional(),
});

export function CreatePetModal({ isOpen, onClose }: CreatePetModalProps) {
    const queryClient = useQueryClient();

    const [name, setName] = useState("");
    const [species, setSpecies] = useState<"dog" | "cat" | "other">("dog");
    const [breed, setBreed] = useState("");
    const [age, setAge] = useState("");
    const [size, setSize] = useState("");
    const [sex, setSex] = useState("");
    const [description, setDescription] = useState("");

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    if (!isOpen) return null;

    function resetForm() {
        setName("");
        setSpecies("dog");
        setBreed("");
        setAge("");
        setSize("");
        setSex("");
        setDescription("");
        setPhotoFile(null);
        setPhotoPreview(null);
        setErrorMessage(null);
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMessage(null);
        setIsLoading(true);

        try {
            // 1. Validações locais
            const validatedData = createPetSchema.parse({
                name,
                species,
                breed: breed.trim() || undefined,
                age: age !== "" ? Number(age) : undefined,
                size: size || undefined,
                sex: sex || undefined,
                description: description.trim() || undefined,
            });

            // 2. Converte foto para string Base64 (se houver arquivo)
            let photoString: string | undefined = undefined;
            if (photoFile) {
                photoString = await fileToBase64(photoFile);
            }

            // 3. Monta o Payload JSON puro
            const payload = {
                name: validatedData.name,
                species: validatedData.species,
                breed: validatedData.breed,
                age: validatedData.age, // Número (ex: 3)
                size: validatedData.size,
                sex: validatedData.sex,
                description: validatedData.description,
                photo: photoString, // String Base64 ou undefined
            };

            // 4. Envia a requisição JSON
            await api.post("/animals", payload);

            queryClient.invalidateQueries({ queryKey: ["pets"] });

            resetForm();
            onClose();
        } catch (error) {
            if (error instanceof ZodError) {
                setErrorMessage(error.issues[0].message);
            } else if (error instanceof AxiosError) {
                const responseData = error.response?.data;
                if (responseData?.issues) {
                    setErrorMessage(JSON.stringify(responseData.issues));
                } else {
                    setErrorMessage(responseData?.message || "Erro ao cadastrar o pet.");
                }
            } else {
                setErrorMessage("Erro inesperado. Tente novamente.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-gray-800 border border-gray-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative text-gray-100 flex flex-col max-h-[90vh]">

                {/* Botão Fechar */}
                <button
                    onClick={onClose}
                    type="button"
                    className="absolute top-4 right-4 z-10 bg-gray-900/60 text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-700 transition cursor-pointer"
                >
                    <FaXmark className="w-5 h-5" />
                </button>

                {/* Cabeçalho */}
                <div className="p-6 pb-2 border-b border-gray-700/60 flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400">
                        <FaPaw className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Anunciar Pet</h2>
                        <p className="text-xs text-gray-400">Preencha as informações do bichinho para adoção</p>
                    </div>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
                    {errorMessage && (
                        <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-xs p-3 rounded-lg text-center break-words">
                            {errorMessage}
                        </div>
                    )}

                    {/* Upload de Foto */}
                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1.5">
                            Foto do Pet
                        </label>
                        <label className="border-2 border-dashed border-gray-600 hover:border-amber-500/60 rounded-xl h-36 flex flex-col items-center justify-center cursor-pointer transition relative overflow-hidden bg-gray-900/40">
                            {photoPreview ? (
                                <img
                                    src={photoPreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center text-gray-400">
                                    <FaCamera className="w-8 h-8 mb-2 text-amber-500/80" />
                                    <span className="text-xs font-medium">Clique para selecionar uma foto</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
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

                    {/* Raça e Idade */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            legend="Raça"
                            placeholder="Ex: Vira-lata, Poodle..."
                            value={breed}
                            onChange={(e) => setBreed(e.target.value)}
                        />

                        <Input
                            legend="Idade (em anos)"
                            type="number"
                            placeholder="Ex: 2"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                        />
                    </div>

                    {/* Porte e Sexo */}
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
                                onChange={(e) => setSex(e.target.value)}
                                className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500 transition"
                            >
                                <option value="">Selecione o sexo</option>
                                <option value="male">Macho</option>
                                <option value="female">Fêmea</option>
                            </select>
                        </div>
                    </div>

                    {/* Descrição */}
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

                    {/* Botão Salvar */}
                    <div className="pt-2">
                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold"
                        >
                            Cadastrar Pet
                        </Button>
                    </div>
                </form>

            </div>
        </div>
    );
}