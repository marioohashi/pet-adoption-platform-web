import { useState } from "react";
import { FaCamera } from "react-icons/fa6";
import { uploadToCloudinary } from "../services/cloudinary"; // Certifique-se do caminho correto
import { api } from "../services/api";

interface AvatarUploadProps {
    currentAvatar?: string | null;
    onAvatarUpdated: (newUrl: string) => void;
}

export function AvatarUpload({ currentAvatar, onAvatarUpdated }: AvatarUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentAvatar || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Função para lidar com a seleção do arquivo
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        // Cria um link temporário para exibir o preview imediatamente na tela
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
    }

    // Função opcional caso queira fazer o upload imediato ao selecionar a foto
    async function handleSaveAvatar() {
        if (!selectedFile) return;

        try {
            setIsUploading(true);
            // 1. Faz o upload para o Cloudinary (ou rota do backend)
            const uploadedUrl = await uploadToCloudinary(selectedFile);

            // 2. Atualiza no backend do usuário
            await api.put("/users/me", { avatar: uploadedUrl });

            // 3. Notifica o componente pai / estado global
            onAvatarUpdated(uploadedUrl);
            setSelectedFile(null);
        } catch (error) {
            console.error("Erro ao atualizar o avatar:", error);
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-28 h-28 rounded-full overflow-hidden bg-[#F4F4F2] border-2 border-[#E4E4E1] shadow-sm group">
                <img
                    src={preview || "https://via.placeholder.com/150?text=Avatar"}
                    alt="Avatar do usuário"
                    className="w-full h-full object-cover"
                />

                {/* Overlay de hover para trocar a foto */}
                <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer">
                    <FaCamera className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-semibold">Alterar</span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </label>
            </div>

            {/* Botão de salvar específico caso queira salvar separado */}
            {selectedFile && (
                <button
                    type="button"
                    onClick={handleSaveAvatar}
                    disabled={isUploading}
                    className="bg-[#FF7A59] hover:bg-[#e0694a] text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                    {isUploading ? "Salvando foto..." : "Salvar nova foto"}
                </button>
            )}
        </div>
    );
}