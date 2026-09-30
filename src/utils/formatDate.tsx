export function formatDate(dateString?: string | null) {
    if (!dateString) return null;
    const rawDate = dateString.substring(0, 10);
    const parts = rawDate.split("-");
    if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
    }
    return rawDate;
}
