import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { SubjectsSection } from '@/components/landing/SubjectsSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
// import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
// import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <SubjectsSection />
        {/* <TestimonialsSection /> */}
        {/* <PricingSection /> */}
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
