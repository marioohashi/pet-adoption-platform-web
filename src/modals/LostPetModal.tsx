import { useState } from "react";
import { FaXmark, FaCamera, FaTrashCan } from "react-icons/fa6";

interface LostPetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (newPet: any) => void;
}

export function LostPetModal({ isOpen, onClose, onSubmit }: LostPetModalProps) {
    const [formData, setFormData] = useState({
        type: "lost" as "lost" | "found",
        name: "",
        species: "Cachorro",
        breed: "",
        location: "",
        date: "",
        phone: "",
        contactName: "",
        description: "",
        reward: "",
        photo: ""
    });

    const [previewImage, setPreviewImage] = useState<string | null>(null);

    if (!isOpen) return null;

    // Manipulador de upload de imagem igual ao cadastro de pets
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreviewImage(result);
                setFormData({ ...formData, photo: result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setPreviewImage(null);
        setFormData({ ...formData, photo: "" });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validação básica
        if (!formData.location || !formData.phone || !formData.contactName) {
            alert("Por favor, preencha os campos obrigatórios de contato e localização.");
            return;
        }

        // Cria o objeto da nova ocorrência
        const newOccurrence = {
            id: Date.now().toString(),
            ...formData,
            name: formData.name.trim() || (formData.type === "found" ? "Pet Encontrado (Sem Nome)" : "Sem Nome"),
            photo: formData.photo || "https://images.unsplash.com/photo-1543466835-00a7907e9de1" // Imagem padrão se nenhuma for enviada
        };

        onSubmit(newOccurrence);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-[#FAFAF8] border border-[#E4E4E1] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">

                {/* Cabeçalho do Modal */}
                <div className="flex items-center justify-between p-6 border-b border-[#E4E4E1] sticky top-0 bg-[#FAFAF8] z-10">
                    <div>
                        <h3 className="text-xl font-bold font-['Manrope'] text-[#2D2D2D] tracking-tight">
                            Cadastrar Ocorrência
                        </h3>
                        <p className="text-xs text-[#6B7280]">
                            Preencha os dados do pet perdido ou encontrado para alertar a rede local.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 text-[#6B7280] hover:text-[#2D2D2D] bg-[#F4F4F2] hover:bg-[#E4E4E1] rounded-2xl transition cursor-pointer"
                    >
                        <FaXmark className="w-5 h-5" />
                    </button>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Seletor de Tipo (Input estilo Segmented Control / Alternância) */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#2D2D2D] uppercase tracking-wider">
                            Qual é a situação? *
                        </label>
                        <div className="flex bg-[#F4F4F2] p-1.5 rounded-2xl border border-[#E4E4E1]">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: "lost" })}
                                className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm transition cursor-pointer ${formData.type === "lost"
                                        ? "bg-[#FF7A59] text-white shadow-xs"
                                        : "text-[#6B7280] hover:text-[#2D2D2D]"
                                    }`}
                            >
                                🐾 Meu Pet Fugiu (Perdido)
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: "found" })}
                                className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm transition cursor-pointer ${formData.type === "found"
                                        ? "bg-[#FF7A59] text-white shadow-xs"
                                        : "text-[#6B7280] hover:text-[#2D2D2D]"
                                    }`}
                            >
                                🔍 Achei um Pet na Rua
                            </button>
                        </div>
                    </div>

                    {/* Nome e Espécie */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#2D2D2D] uppercase tracking-wider">
                                {formData.type === "lost" ? "Nome do Pet *" : "Nome (se souber ou apelido)"}
                            </label>
                            <input
                                type="text"
                                placeholder={formData.type === "lost" ? "Ex: Mel" : "Ex: Caramelo / Desconhecido"}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-xl px-4 py-2.5 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59]"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#2D2D2D] uppercase tracking-wider">
                                Espécie *
                            </label>
                            <select
                                value={formData.species}
                                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                                className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-xl px-4 py-2.5 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59]"
                            >
                                <option value="Cachorro">Cachorro</option>
                                <option value="Gato">Gato</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>
                    </div>

                    {/* Raça e Localização */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#2D2D2D] uppercase tracking-wider">
                                Raça / Aparência
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: Golden Retriever ou SRD Rajado"
                                value={formData.breed}
                                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                                className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-xl px-4 py-2.5 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59]"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#2D2D2D] uppercase tracking-wider">
                                Localização (Bairro / Cidade) *
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: Batel, Curitiba - PR"
                                required
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-xl px-4 py-2.5 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59]"
                            />
                        </div>
                    </div>

                    {/* Data e Recompensa (se for perdido) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#2D2D2D] uppercase tracking-wider">
                                Data do Ocorrido *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-xl px-4 py-2.5 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59]"
                            />
                        </div>

                        {formData.type === "lost" && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#2D2D2D] uppercase tracking-wider">
                                    Recompensa (Opcional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: Recompensa oferecida"
                                    value={formData.reward}
                                    onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                                    className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-xl px-4 py-2.5 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59]"
                                />
                            </div>
                        )}
                    </div>

                    {/* Upload de Foto (Padrão igual ao cadastro de novos pets) */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#2D2D2D] uppercase tracking-wider">
                            Foto do Pet *
                        </label>
                        {previewImage ? (
                            <div className="relative w-full h-48 bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl overflow-hidden flex items-center justify-center">
                                <img
                                    src={previewImage}
                                    alt="Pré-visualização"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute bottom-3 right-3 p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition cursor-pointer flex items-center gap-2 text-xs font-semibold"
                                >
                                    <FaTrashCan className="w-3.5 h-3.5" /> Remover foto
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-[#E4E4E1] hover:border-[#FF7A59] bg-[#F4F4F2] rounded-2xl cursor-pointer transition">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                                    <div className="p-3 bg-[#FF7A59]/10 text-[#FF7A59] rounded-2xl mb-2">
                                        <FaCamera className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-semibold text-[#2D2D2D] mb-1">
                                        Clique para carregar ou arraste a foto do pet
                                    </p>
                                    <p className="text-[11px] text-[#6B7280]">
                                        PNG, JPG ou WEBP
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    {/* Dados de Contato */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E4E4E1]">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#2D2D2D] uppercase tracking-wider">
                                Seu Nome (Contato) *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Ex: Mariana"
                                value={formData.contactName}
                                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-xl px-4 py-2.5 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59]"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#2D2D2D] uppercase tracking-wider">
                                Telefone / WhatsApp *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Ex: (41) 99888-7766"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-xl px-4 py-2.5 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59]"
                            />
                        </div>
                    </div>

                    {/* Descrição */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#2D2D2D] uppercase tracking-wider">
                            Descrição e Detalhes
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Descreva detalhes como cor da coleira, marcações no pelo, comportamento ou onde foi visto pela última vez..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-xl px-4 py-2.5 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] resize-none"
                        />
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E4E4E1]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#F4F4F2] hover:bg-[#E4E4E1] text-[#6B7280] transition cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-[#FF7A59] hover:bg-[#e0694a] text-white transition shadow-sm cursor-pointer"
                        >
                            Cadastrar Ocorrência
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}