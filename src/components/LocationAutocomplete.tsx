import { useState, useEffect, useRef } from "react";
import { getStates, getCitiesByState } from "../services/locationService";

interface LocationAutocompleteProps {
    city: string;
    state: string;
    onChange: (city: string, state: string) => void;
    label?: string;
    placeholder?: string;
}

export function LocationAutocomplete({
    city,
    state,
    onChange,
    label = "Cidade e Estado",
    placeholder = "Ex: Curitiba - PR"
}: LocationAutocompleteProps) {
    const [locationSearch, setLocationSearch] = useState(
        city && state ? `${city} - ${state}` : ""
    );
    const [allCitiesWithState, setAllCitiesWithState] = useState<{ id: number; nome: string; uf: string; label: string }[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sincroniza o input caso mude externamente
    useEffect(() => {
        if (city && state) {
            setLocationSearch(`${city} - ${state}`);
        } else if (!city && !state) {
            setLocationSearch("");
        }
    }, [city, state]);

    // Carrega todas as cidades combinadas com os estados ao montar
    useEffect(() => {
        async function loadCities() {
            try {
                const statesList = await getStates();
                const promises = statesList.map(async (st) => {
                    const cities = await getCitiesByState(st.sigla);
                    return cities.map((c) => ({
                        id: c.id,
                        nome: c.nome,
                        uf: st.sigla,
                        label: `${c.nome} - ${st.sigla}`
                    }));
                });
                const results = await Promise.all(promises);
                setAllCitiesWithState(results.flat());
            } catch (err) {
                console.error("Erro ao carregar cidades para o autocomplete", err);
            }
        }
        loadCities();
    }, []);

    // Fecha o dropdown ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = allCitiesWithState.filter((item) =>
        item.label.toLowerCase().includes(locationSearch.toLowerCase())
    );

    return (
        <div className="relative" ref={containerRef}>
            {label && (
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">
                    {label}
                </label>
            )}
            <input
                type="text"
                value={locationSearch}
                autoComplete="off"
                role="presentation"
                placeholder={placeholder}
                onChange={(e) => {
                    const val = e.target.value;
                    setLocationSearch(val);
                    setIsOpen(true);
                    if (!val) {
                        onChange("", "");
                    }
                }}
                onFocus={() => setIsOpen(true)}
                className="w-full bg-[#F4F4F2] border border-[#E4E4E1] rounded-2xl px-4 py-3 text-sm text-[#2D2D2D] focus:outline-none focus:border-[#FF7A59] transition shadow-xs"
            />

            {isOpen && filtered.length > 0 && (
                <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto bg-white border border-[#E4E4E1] rounded-2xl shadow-lg">
                    {filtered.slice(0, 50).map((item) => (
                        <li
                            key={item.id}
                            onClick={() => {
                                setLocationSearch(item.label);
                                onChange(item.nome, item.uf);
                                setIsOpen(false);
                            }}
                            className="px-4 py-2.5 text-sm text-[#2D2D2D] hover:bg-[#F4F4F2] cursor-pointer transition flex justify-between items-center first:rounded-t-2xl last:rounded-b-2xl"
                        >
                            <span>{item.nome}</span>
                            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                                {item.uf}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}