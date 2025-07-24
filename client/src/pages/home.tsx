/**
 * home.tsx
 * 
 * Página principal do site da psicóloga
 * Organiza todas as seções em uma single-page application
 * Layout: Header -> Hero -> About -> Services -> Quotes -> Testimonials -> FAQ -> Contact -> Footer
 * Controla botão "voltar ao topo" baseado na posição do scroll
 */

import React, { useState, useEffect, useRef } from "react"; // Controle do botão scroll to top
import { ChevronUp } from "lucide-react"; // Ícone do botão voltar ao topo
import Navigation from "@/components/Navigation"; // Menu de navegação fixo
import HeroSection from "@/components/HeroSection"; // Seção principal com CTA
import AboutSection from "@/components/AboutSection"; // Sobre a psicóloga
import ServicesSection from "@/components/ServicesSection"; // Serviços oferecidos
import InspirationalQuotes from "@/components/InspirationalQuotes"; // Frases inspiracionais
import TestimonialsCarousel from "@/components/TestimonialsCarousel"; // Depoimentos
import FAQSection from "@/components/FAQSection"; // Perguntas frequentes
import ContactSection from "@/components/ContactSection"; // Informações de contato
import Footer from "@/components/Footer"; // Rodapé com links
import PhotoCarousel from "@/components/PhotoCarousel"; // Carrossel de fotos
import { useSectionVisibility } from "@/hooks/useSectionVisibility"; // Hook para controlar visibilidade das seções
import { useQuery } from "@tanstack/react-query"; // Hook para buscar dados da API
import { apiRequest } from "@/lib/queryClient";
import MaintenancePage from "@/components/MaintenancePage";
import MarketingPixels from "@/components/MarketingPixels";

// Componente principal da página home
export default function Home() {
  // Verifica modo de manutenção usando endpoint público
  const { data: maintenanceCheck } = useQuery({
    queryKey: ["/api/maintenance-check"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/maintenance-check");
      return response.json();
    },
    staleTime: 30000, // Cache por 30 segundos
  });

  const [showBackToTop, setShowBackToTop] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);

  // Hook para controlar visibilidade das seções
  const {
    isHeroVisible,
    isAboutVisible,
    isServicesVisible,
    isTestimonialsVisible,
    isFaqVisible,
    isContactVisible,
    isPhotoCarouselVisible,
    isInspirationalVisible
  } = useSectionVisibility();

  // Buscar ordem das seções
  const { data: configs } = useQuery({
    queryKey: ["/api/admin/config"],
    staleTime: 5 * 60 * 1000,
  });

  const orderConfig = Array.isArray(configs) ? 
    configs.find((c: any) => c.key === 'sections_order')?.value as any || {} : 
    {};

  // Definir seções ordenáveis com seus componentes
  const sections = [
    {
      key: 'hero',
      component: <HeroSection />,
      visible: isHeroVisible,
      order: orderConfig.hero ?? 0
    },
    {
      key: 'about', 
      component: <AboutSection />,
      visible: isAboutVisible,
      order: orderConfig.about ?? 1
    },
    {
      key: 'services',
      component: <ServicesSection />,
      visible: isServicesVisible, 
      order: orderConfig.services ?? 2
    },
    {
      key: 'testimonials',
      component: <TestimonialsCarousel />,
      visible: isTestimonialsVisible,
      order: orderConfig.testimonials ?? 3
    },
    {
      key: 'faq',
      component: <FAQSection />,
      visible: isFaqVisible,
      order: orderConfig.faq ?? 4
    },
    {
      key: 'contact',
      component: <ContactSection />,
      visible: isContactVisible,
      order: orderConfig.contact ?? 5
    },
    {
      key: 'photo-carousel',
      component: <PhotoCarousel />,
      visible: isPhotoCarouselVisible,
      order: orderConfig['photo-carousel'] ?? 3.5
    },

    {
      key: 'inspirational',
      component: <InspirationalQuotes />,
      visible: isInspirationalVisible,
      order: orderConfig.inspirational ?? 6
    }
  ].sort((a, b) => a.order - b.order);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Botão aparece quando usuário rola mais que 300px
      setShowBackToTop(scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // Verifica se o modo de manutenção está ativo
  const isMaintenanceMode = maintenanceCheck?.maintenance?.enabled || false;

  // Se o modo de manutenção estiver ativo, exibe apenas a página de manutenção
  if (isMaintenanceMode) {
    return (
      <>
        <MarketingPixels />
        <MaintenancePage />
      </>
    );
  }

  return (
    // Container principal com fonte e overflow controlado
    <div className="main-page-container font-sans text-gray-800 overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Background decorativo sutil */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-100/15 to-blue-100/15 rounded-full blur-3xl"></div>
      </div>

      {/* Navegação fixa no topo - sempre visível */}
      <Navigation />

      {/* Container principal das seções */}
      <main className="relative z-10 w-full flex-1">
        {/* Seções dinâmicas ordenadas pelo admin */}
        {sections.map((section, index) => 
          section.visible ? (
            <section 
              key={section.key} 
              className="w-full"
            >
              {section.component}
            </section>
          ) : null
        )}
      </main>

      {/* Rodapé - informações finais */}
      <div ref={footerRef} className="relative z-10">
        <Footer />
      </div>

      {/* Botão voltar ao topo - aparece quando scroll > 300px */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-[120] card-aesthetic p-4 text-gray-700 hover:text-purple-600 hover:scale-110 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 group"
          aria-label="Voltar ao topo"
        >
          <ChevronUp size={24} className="group-hover:animate-bounce" />
        </button>
      )}

      <MarketingPixels />
    </div>
  );
}