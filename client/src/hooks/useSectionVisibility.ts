/**
 * useSectionVisibility.ts
 * 
 * Hook personalizado para controlar a visibilidade das seções do site
 * Verifica configurações do admin e retorna se cada seção deve ser exibida
 * Permite ativar/desativar seções inteiras através do painel administrativo
 */

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { SiteConfig } from "@shared/schema";

interface SectionVisibilityConfig {
  hero?: boolean;
  about?: boolean;
  services?: boolean;
  testimonials?: boolean;
  faq?: boolean;
  contact?: boolean;
}

export const useSectionVisibility = () => {
  const { data: configs } = useQuery({
    queryKey: ["/api/admin/config"],
    staleTime: 5 * 60 * 1000,
  });

  const visibilityConfig = Array.isArray(configs) ? 
    configs.find((c: any) => c.key === 'sections_visibility')?.value as any || {} : 
    {};

  const isHeroVisible = visibilityConfig.hero ?? true;
  const isAboutVisible = visibilityConfig.about ?? true;
  const isServicesVisible = visibilityConfig.services ?? true;
  const isTestimonialsVisible = visibilityConfig.testimonials ?? true;
  const isFaqVisible = visibilityConfig.faq ?? true;
  const isContactVisible = visibilityConfig.contact ?? true;
  const isPhotoCarouselVisible = visibilityConfig['photo-carousel'] ?? true;
  const isInspirationalVisible = visibilityConfig.inspirational ?? true;

  // Log dos dados para debug
  console.log('Dados de visibilidade carregados:', configs);
  console.log('Visibilidade individual:', {
    hero: isHeroVisible,
    about: isAboutVisible,
    services: isServicesVisible,
    testimonials: isTestimonialsVisible,
    faq: isFaqVisible,
    contact: isContactVisible,
    photoCarousel: isPhotoCarouselVisible,
    inspirational: isInspirationalVisible
  });

  return {
    isHeroVisible: isHeroVisible,
    isAboutVisible: isAboutVisible,
    isServicesVisible: isServicesVisible,
    isTestimonialsVisible: isTestimonialsVisible,
    isFaqVisible: isFaqVisible,
    isContactVisible: isContactVisible,
    isPhotoCarouselVisible: isPhotoCarouselVisible,
    isInspirationalVisible: isInspirationalVisible
  };
};