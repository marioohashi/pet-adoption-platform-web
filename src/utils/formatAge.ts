export function formatAge(totalMonths?: number | null): string {
    if (totalMonths === undefined || totalMonths === null || totalMonths < 0) {
        return "Idade não informada";
    }

    if (totalMonths === 0) {
        return "Recém-nascido";
    }

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    if (years === 0) {
        return `${months} ${months === 1 ? "mês" : "meses"}`;
    }

    if (months === 0) {
        return `${years} ${years === 1 ? "ano" : "anos"}`;
    }

    return `${years} ${years === 1 ? "ano" : "anos"} e ${months} ${months === 1 ? "mês" : "meses"}`;
}