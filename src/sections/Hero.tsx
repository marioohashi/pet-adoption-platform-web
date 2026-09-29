import { useState } from "react";
import { type Pet } from "../types";

interface HeroProps {
  pets?: Pet[];
}

const HERO_PHRASES = [
  "Adote um amigo, divulgue um pet perdido ou ajude a encontrar o tutor de um animal achado.",
  "Conectamos pessoas a animais que precisam de um lar cheio de amor.",
  "Encontre seu novo melhor amigo e transforme uma vida hoje mesmo.",
  "Cada final feliz começa com um ato de amor e solidariedade.",
  "Um novo companheiro de quatro patas está esperando por você.",
  "Dê uma segunda chance para quem só quer te dar carinho.",
  "Adotar é um ato de amor que muda duas vidas: a do pet e a sua."
];

const DEFAULT_BACKGROUND = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1000&auto=format&fit=crop";

export function Hero({ pets = [] }: HeroProps) {
  // Extrai as imagens disponíveis dos pets
  const petImages = pets
    .map((pet) => pet.imageUrl || pet.photo || pet.photos?.[0])
    .filter((img): img is string => Boolean(img));

  // Define uma combinação aleatória de índice APENAS quando a página é recarregada
  const [initialState] = useState(() => {
    const randomPhraseIndex = Math.floor(Math.random() * HERO_PHRASES.length);
    const hasPets = petImages.length > 0;
    const randomPetIndex = hasPets ? Math.floor(Math.random() * petImages.length) : 0;

    return {
      phrase: HERO_PHRASES[randomPhraseIndex],
      image: hasPets ? petImages[randomPetIndex] : DEFAULT_BACKGROUND
    };
  });

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-md block md:hidden min-h-[360px] flex items-end">
      {/* Imagem de Fundo cobrindo 100% da extensão e altura */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 ease-in-out scale-105"
        style={{ backgroundImage: `url(${initialState.image})` }}
      />

      {/* Gradiente Escuro Sobreposto de ponta a ponta para garantir leitura */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

      {/* Conteúdo de Texto com largura total */}
      <div className="relative z-10 p-6 text-white w-full space-y-3">
        <p className="text-sm sm:text-base text-white/95 leading-relaxed font-medium drop-shadow-md">
          {initialState.phrase}
        </p>

        <div className="pt-1">
          <span className="inline-block bg-[#FF7A59] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
            Adoção Responsável
          </span>
        </div>
      </div>
    </div>
  );
}