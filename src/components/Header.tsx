// import logoSvg from "../assets/logo.svg";
import { Link } from "react-router-dom"
import logoutSvg from "../assets/logout.svg";
import { useAuth } from "../hooks/useAuth"

export function Header() {
  const auth = useAuth()

  return (
    <header className="bg-white shadow-sm w-full flex justify-between px-8">
      {/* <img src={logoSvg} alt="Logo" className="my-8" /> */}
      <h1 className=" my-8 text-2xl font-bold text-blue-600">Encontre seu pet ❤️</h1>

      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">


        <nav className="flex gap-6 text-gray-700 font-medium">
          <a href="/" className="hover:text-blue-600 transition">Início</a>
          <a href="/pets" className="hover:text-blue-600 transition">Pets</a>
          <a href="/sobre" className="hover:text-blue-600 transition">Sobre</a>
        </nav>

      </div>

      <div className="flex items-center gap-4">
        {auth.session ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">
              Olá, {auth.session?.user.name}
            </span>
            <img
              src={logoutSvg}
              alt="Ícone de sair"
              className="my-8 cursor-pointer hover:opacity-75 transition ease-linear"
              onClick={() => auth.remove()}
            />
          </div>
        ) : (
          <div className="flex gap-4">
            <Link to="/signin" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Login</Link>
          </div>
        )}
      </div>
    </header>
  );
}
