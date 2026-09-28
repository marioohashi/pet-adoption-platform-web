export async function uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "adote2pets"); // O nome do preset que você acabou de criar

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/dcgysmw5/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        throw new Error("Falha ao fazer upload da imagem para o Cloudinary");
    }

    const data = await response.json();
    return data.secure_url; // Retorna a URL permanente e segura da imagem
}