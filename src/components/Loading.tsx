export function Loading() {
    return (
        <div className="w-screen h-screen flex justify-center items-center bg-[#FAFAF8] font-sans">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-[#FF7A59] border-t-transparent rounded-full animate-spin" />
                <span className="text-[#6B7280] font-medium text-sm">
                    Carregando...
                </span>
            </div>
        </div>
    );
}