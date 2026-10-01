import axios from 'axios';

export interface StateIBGE {
    id: number;
    sigla: string;
    nome: string;
}

export interface CityIBGE {
    id: number;
    nome: string;
}

export interface CityState {
    id: number;
    nome: string;
    uf: string;
    label: string; // Ex: "Curitiba - PR"
}

export const getStates = async (): Promise<StateIBGE[]> => {
    const response = await axios.get<StateIBGE[]>(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome'
    );
    return response.data;
};

export const getCitiesByState = async (uf: string): Promise<CityIBGE[]> => {
    if (!uf) return [];
    const response = await axios.get<CityIBGE[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
    );
    return response.data;
};