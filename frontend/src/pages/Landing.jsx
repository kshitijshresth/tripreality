import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Features, HowItWorks, FeaturedCities, Testimonials, Footer } from "@/components/LandingSections";

export default function Landing() {
  return (
    <div className="bg-stars text-white min-h-screen" data-testid="landing-page">
      <Navigation />
      <Hero />
      <Features />
      <HowItWorks />
      <FeaturedCities />
      <Testimonials />
      <Footer />
    </div>
  );
}
