
/**
 * FAQSection.tsx
 * 
 * Seção de Perguntas Frequentes (FAQ) sobre terapia
 * Contém accordion expansível com dúvidas comuns dos clientes
 * Animações suaves para abrir/fechar perguntas
 * Sistema de estado para controlar qual pergunta está aberta
 */

import { motion } from "framer-motion"; // Animações do accordion
import { ChevronDown, Plus, Minus } from "lucide-react"; // Ícones para expandir
import { useEffect, useRef, useState } from "react"; // Gerenciamento de estado
import { useQuery } from "@tanstack/react-query"; // Query para dados do servidor
import type { FaqItem } from "@shared/schema"; // Tipo dos FAQs
import { processTextWithGradient } from "@/utils/textGradient"; // Processa texto com gradiente

export default function FAQSection() {
  // Busca FAQs do banco de dados
  const { data: faqs = [], isLoading } = useQuery<FaqItem[]>({
    queryKey: ["/api/admin/faq"],
  });

  // Buscar configurações da seção FAQ
  const { data: configs } = useQuery({
    queryKey: ["/api/admin/config"],
    queryFn: async () => {
      const response = await fetch("/api/admin/config");
      return response.json();
    },
  });

  // Extrair configurações da seção FAQ
  const faqSection = configs?.find((c: any) => c.key === 'faq_section')?.value as any || {};

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-slate-50 via-white to-purple-50/30" ref={ref}>
      <div className="container mx-auto max-w-4xl px-6 text-center">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block mb-6">
            <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-4 py-2 rounded-full tracking-wider uppercase">
              {faqSection.badge || "DÚVIDAS FREQUENTES"}
            </span>
          </div>
          <h2 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-gray-900 mb-6 tracking-tight leading-tight">
            {processTextWithGradient(faqSection.title || "Respondemos suas (principais dúvidas)")}
          </h2>
          <p className="text-gray-600 text-xl font-light leading-relaxed max-w-3xl mx-auto">
            {faqSection.subtitle || "Esclarecimentos importantes sobre como funciona o processo de acompanhamento psicológico"}
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.filter(faq => faq.isActive).map((faq, index) => (
            <motion.div
              key={faq.id}
              className="group"
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <div 
                className={`
                  relative overflow-hidden rounded-2xl border transition-all duration-500 ease-out cursor-pointer
                  ${openFaq === index 
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-xl shadow-purple-100/50 scale-[1.02]' 
                    : 'bg-white/70 backdrop-blur-sm border-gray-200/60 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-100/30'
                  }
                `}
                onClick={() => toggleFaq(index)}
              >
                {/* Gradient overlay sutil */}
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative p-8">
                  <div className="flex items-center justify-between">
                    <h3 className={`
                      font-semibold text-xl leading-relaxed pr-6 transition-colors duration-300
                      ${openFaq === index ? 'text-purple-900' : 'text-gray-800 group-hover:text-purple-800'}
                    `}>
                      {faq.question}
                    </h3>
                    
                    <div className={`
                      flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                      ${openFaq === index 
                        ? 'bg-purple-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-600'
                      }
                    `}>
                      <motion.div
                        animate={{ rotate: openFaq === index ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        {openFaq === index ? (
                          <Minus size={20} />
                        ) : (
                          <Plus size={20} />
                        )}
                      </motion.div>
                    </div>
                  </div>

                  <motion.div
                    initial={false}
                    animate={{
                      height: openFaq === index ? "auto" : 0,
                      opacity: openFaq === index ? 1 : 0,
                      marginTop: openFaq === index ? 24 : 0
                    }}
                    transition={{ 
                      duration: 0.4, 
                      ease: [0.4, 0.0, 0.2, 1]
                    }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6">
                      <motion.p 
                        className="text-gray-700 leading-relaxed text-lg font-light"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ 
                          y: openFaq === index ? 0 : 10, 
                          opacity: openFaq === index ? 1 : 0 
                        }}
                        transition={{ duration: 0.3, delay: openFaq === index ? 0.1 : 0 }}
                      >
                        {faq.answer}
                      </motion.p>
                    </div>
                  </motion.div>
                </div>

                {/* Borda brilhante no hover */}
                <div className={`
                  absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none
                  ${openFaq === index 
                    ? 'bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-purple-400/20 opacity-100' 
                    : 'bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100'
                  }
                `} 
                style={{
                  background: openFaq === index 
                    ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(236, 72, 153, 0.1) 50%, rgba(147, 51, 234, 0.1) 100%)'
                    : undefined
                }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
