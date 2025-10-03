import Header from "@/components/organisms/Header";
import Hero from "@/components/organisms/Hero";
import Features from "@/components/organisms/Features";
import Pricing from "@/components/organisms/Pricing";
import CTA from "@/components/organisms/CTA";
import Footer from "@/components/organisms/Footer";
export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}