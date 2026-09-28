// src/pages/Home.tsx
import { Header } from "../sections/Header";
import { Hero } from "../sections/Hero";
import { PetList } from "../sections/PetList";
import { Footer } from "../sections/Footer";

export function Home() {
  return (
    <>
      <Header />
      <Hero />
      <PetList />
      <Footer />
    </>
  );
}
