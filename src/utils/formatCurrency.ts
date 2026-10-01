export function formatCurrency(value: string): string {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "";

    // Converte para número inteiro e formata para Real sem casas decimais
    const amount = Number(numbers);
    return amount.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}