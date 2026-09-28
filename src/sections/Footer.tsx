// src/components/Footer.tsx
export function Footer() {
  return (
    <footer className="bg-gray-100 py-6 mt-12">
      <div className="max-w-6xl mx-auto px-6 text-center text-gray-600">
        <p>© {new Date().getFullYear()} PetAdopt — Plataforma de Adoção Responsável</p>
        <p className="mt-2">Feito com ❤️ por Mario Ohashi </p>
      </div>
    </footer>
  );
}
