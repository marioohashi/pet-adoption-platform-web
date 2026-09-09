export function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-20">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Encontre seu novo melhor amigo 🐾
        </h2>

        <p className="text-lg mb-8 opacity-90">
          Conectamos pessoas a animais que precisam de um lar cheio de amor.
        </p>

        <a
          href="#pets"
          className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-gray-100 transition"
        >
          Ver Pets Disponíveis
        </a>
      </div>
    </section>
  );
}
