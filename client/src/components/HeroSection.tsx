/**
 * HeroSection.tsx
 *
 * Seção principal da homepage do site da Dra. Adrielle Benhossi
 * Contém: título principal, subtítulo, botões de ação e avatar da psicóloga
 * Utiliza animações em Framer Motion para entrada suave dos elementos
 */

import { motion } from "framer-motion"; // Biblioteca para animações suaves
import { Calendar } from "lucide-react"; // Ícone de calendário para botão de agendamento
import { Avatar } from "./Avatar"; // Componente do avatar da psicóloga
import { useQuery } from "@tanstack/react-query"; // Para buscar configurações do site
import { processTextWithGradient } from "@/utils/textGradient"; // Utilitário para processar texto com gradiente

export default function HeroSection() {
  // Buscar configurações do site incluindo a imagem do hero
  const { data: configs } = useQuery({
    queryKey: ["/api/admin/config"],
    queryFn: async () => {
      const response = await fetch("/api/admin/config");
      return response.json();
    },
  });

  // Extrair configurações dinâmicas
  const heroImage = configs?.find((c: any) => c.key === "hero_image");
  const customImage = heroImage?.value?.path || null;

  // Extrair informações gerais e da seção hero
  const generalInfo =
    (configs?.find((c: any) => c.key === "general_info")?.value as any) || {};
  const heroSection =
    (configs?.find((c: any) => c.key === "hero_section")?.value as any) || {};

  // Valores dinâmicos com fallbacks
  const psychologistName = generalInfo.name || "Dra. Adrielle Benhossi";
  const heroTitle =
    heroSection.title || "Cuidando da sua saúde mental com carinho";
  const heroSubtitle =
    heroSection.subtitle ||
    "Psicóloga especializada em terapia cognitivo-comportamental, oferecendo um espaço seguro e acolhedor para seu bem-estar emocional.";
  const schedulingButtonColor = generalInfo.schedulingButtonColor || "#ec4899";

  // Função para rolar suavemente até a seção de contato
  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Função para rolar suavemente até a seção sobre
  const scrollToAbout = () => {
    const element = document.getElementById("about");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const buttonText1 = heroSection.buttonText1 || "Agendar consulta";
  const buttonText2 = heroSection.buttonText2 || "Saiba mais";
  const buttonColor1 = heroSection.buttonColor1 || "#ec4899";
  const buttonColor2 = heroSection.buttonColor2 || "#8b5cf6";

  return (
    <section
      id="home"
      className="min-h-[120vh] relative overflow-hidden w-full"
    >
      {/* Gradient Background com cores suaves e femininas */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-purple-50"></div>

      {/* Elementos decorativos flutuantes mais sutis */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-rose-200/30 to-pink-300/20 rounded-full blur-2xl"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-20 w-28 h-28 bg-gradient-to-br from-purple-200/25 to-indigo-300/20 rounded-full blur-xl"
          animate={{
            y: [0, -15, 0],
            x: [0, -10, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute bottom-32 left-1/4 w-24 h-24 bg-gradient-to-br from-yellow-200/20 to-orange-300/15 rounded-full blur-lg"
          animate={{
            y: [0, -25, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
      </div>

      {/* Conteúdo principal centralizado */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-stretch min-h-[calc(110vh-80px)] pt-24 lg:pt-32 pb-16">
            {/* Conteúdo textual */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left flex flex-col h-full"
            >
              {/* Card principal do conteúdo - agora com altura fixa no desktop */}
              <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-8 lg:p-10 shadow-2xl shadow-rose-200/20 flex flex-col justify-between h-full min-h-[28rem] lg:min-h-[26rem]">
                {/* Conteúdo superior */}
                <div className="flex-1 flex flex-col justify-center">
                  {/* Título principal */}
                  <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-gray-800 mb-6 leading-tight tracking-tight">
                    {processTextWithGradient(heroTitle)}
                  </h1>

                  {/* Subtítulo/descrição */}
                  <p className="text-xl sm:text-2xl text-gray-600 mb-8 font-light leading-relaxed">
                    {heroSubtitle}
                  </p>

                  {/* Linha decorativa */}
                  <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-purple-400 rounded-full mx-auto lg:mx-0 mb-8"></div>
                </div>

                {/* Botões de ação - fixos na parte inferior */}
                <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center lg:justify-start mt-auto">
                  {/* Botão principal - Agendamento - maior */}
                  <button
                    onClick={scrollToContact}
                    className="group text-white px-10 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-3 flex-1 sm:flex-none sm:min-w-[200px]"
                    style={{
                      background: `linear-gradient(to right, ${schedulingButtonColor}, ${schedulingButtonColor}dd)`,
                      boxShadow: `0 10px 25px ${schedulingButtonColor}40`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = `0 15px 35px ${schedulingButtonColor}60`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = `0 10px 25px ${schedulingButtonColor}40`;
                    }}
                  >
                    <Calendar className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    {buttonText1}
                  </button>

                  {/* Botão secundário - Saiba mais - menor */}
                  <button
                    onClick={scrollToAbout}
                    className="bg-white/80 backdrop-blur-sm border-2 px-8 py-4 rounded-2xl font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 sm:min-w-[160px]"
                    style={{
                      borderColor: `${buttonColor2}50`,
                      color: `${buttonColor2}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = buttonColor2;
                      e.currentTarget.style.color = buttonColor2;
                      e.currentTarget.style.boxShadow = `0 15px 35px ${buttonColor2}30`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${buttonColor2}50`;
                      e.currentTarget.style.color = buttonColor2;
                      e.currentTarget.style.boxShadow = `0 10px 25px rgba(156, 163, 175, 0.4)`;
                    }}
                  >
                    {buttonText2}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Coluna da Foto - Segundo no mobile, lado direito no desktop */}
            <motion.div
              className="w-full flex justify-center lg:justify-end order-2 lg:order-2 h-full"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <div className="relative h-full flex items-center">
                {/* Container principal da foto com glassmorphism elegante - altura adaptada */}
                <div className="relative bg-white/40 backdrop-blur-xl border border-white/30 rounded-3xl p-4 sm:p-8 shadow-2xl shadow-purple-200/20 h-full min-h-[16rem] sm:min-h-[28rem] lg:min-h-[26rem] flex items-center">
                  {/* Foto de perfil - mantém proporções mas alinha com o card */}
                  <div className="w-48 h-56 sm:w-80 sm:h-96 lg:w-96 lg:h-[22rem] bg-gradient-to-br from-rose-100 to-purple-100 rounded-2xl overflow-hidden relative border border-white/40">
                    {/* Elementos decorativos internos - ajustados para mobile */}
                    <div className="absolute inset-0">
                      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 w-8 h-8 sm:w-16 sm:h-16 bg-white/30 rounded-full"></div>
                      <div className="absolute bottom-6 left-3 sm:bottom-12 sm:left-6 w-6 h-6 sm:w-12 sm:h-12 bg-rose-300/25 rounded-full"></div>
                      <div className="absolute top-1/3 left-4 sm:left-8 w-4 h-4 sm:w-8 sm:h-8 bg-purple-300/20 rounded-full"></div>
                    </div>

                    {customImage ? (
                      <img
                        src={customImage}
                        alt="Dra. Adrielle Benhossi"
                        className="w-full h-full object-cover relative z-10"
                      />
                    ) : (
                      <div className="relative z-10 h-full flex items-center justify-center">
                        <Avatar size="lg" />
                      </div>
                    )}
                  </div>

                  {/* Efeitos decorativos ao redor da foto - ajustados para mobile */}
                  <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-12 h-12 sm:w-24 sm:h-24 bg-gradient-to-br from-rose-300/20 to-pink-400/20 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-3 -left-3 sm:-bottom-6 sm:-left-6 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-300/15 to-indigo-400/15 rounded-full blur-2xl"></div>
                </div>

                {/* Elementos flutuantes ao redor da foto - ajustados para mobile */}
                <motion.div
                  className="absolute -top-4 left-6 sm:-top-8 sm:left-12 w-3 h-3 sm:w-6 sm:h-6 bg-rose-400/40 rounded-full"
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute -bottom-2 right-8 sm:-bottom-4 sm:right-16 w-2 h-2 sm:w-4 sm:h-4 bg-purple-400/50 rounded-full"
                  animate={{
                    y: [0, -8, 0],
                    x: [0, 5, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}