import Navbar from "../components/HeroPage/Navbar";
import Hero from "../components/HeroPage/Hero";
import Footer from "../components/HeroPage/Footer";
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-black to-black text-white pt-16">
        <Hero />
      </main>
      <Footer />
    </div>
  );
}
