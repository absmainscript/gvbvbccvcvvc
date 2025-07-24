/**
 * ContactSection.tsx
 * 
 * Seção de contato e agendamento do site
 * Contém botões para WhatsApp, Instagram e informações de localização
 * Links diretos para agendamento e redes sociais profissionais
 * Animações de hover e efeitos glassmorphism nos cartões
 */

import { motion } from "framer-motion"; // Animações dos elementos de contato
import { FaWhatsapp, FaInstagram } from "react-icons/fa"; // Ícones das redes sociais
import { Mail, MapPin, Clock } from "lucide-react"; // Ícones de contato
import { useEffect, useRef, useState } from "react"; // Controle de visibilidade

const iconMap: { [key: string]: any } = {
  FaWhatsapp: FaWhatsapp,
  FaInstagram: FaInstagram,
  Mail: Mail,
  MapPin: MapPin,
  Clock: Clock,
};

interface ContactSettings {
  contact_items: any[];
  schedule_info: any;
  location_info: any;
}

export default function ContactSection() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [contactItems, setContactItems] = useState<any[]>([]);
  const [scheduleInfo, setScheduleInfo] = useState<any>({});
  const [locationInfo, setLocationInfo] = useState<any>({});
  const [contactConfig, setContactConfig] = useState<any>({});
  const [schedulingButtonColor, setSchedulingButtonColor] = useState<string>("#25D366");

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactResponse, configResponse] = await Promise.all([
          fetch("/api/contact-settings"),
          fetch("/api/admin/config")
        ]);

        if (contactResponse.ok) {
          const contactData: ContactSettings = await contactResponse.json();
          setContactItems(contactData.contact_items || []);
          setScheduleInfo(contactData.schedule_info || {});
          setLocationInfo(contactData.location_info || {});
        }

        if (configResponse.ok) {
          const configData = await configResponse.json();
          const contactSectionConfig = configData.find((c: any) => c.key === 'contact_section')?.value || {};
          setContactConfig(contactSectionConfig);

          // Buscar cor personalizada do botão de agendamento
          const colorsConfig = configData.find((c: any) => c.key === 'colors')?.value || {};
          setSchedulingButtonColor(colorsConfig.schedulingButton || "#25D366");
        }
      } catch (error) {
        console.error('Erro ao buscar dados de contato:', error);
        // Fallback para dados padrão em caso de erro
        setContactItems([
          {
            "id": 1,
            "type": "whatsapp",
            "title": "WhatsApp",
            "description": "(44) 998-362-704",
            "icon": "FaWhatsapp",
            "color": "#25D366",
            "link": "https://wa.me/5544998362704",
            "isActive": true,
            "order": 0
          },
          {
            "id": 2,
            "type": "instagram",
            "title": "Instagram",
            "description": "@adriellebenhossi",
            "icon": "FaInstagram",
            "color": "#E4405F",
            "link": "https://instagram.com/adriellebenhossi",
            "isActive": true,
            "order": 1
          },
          {
            "id": 3,
            "type": "email",
            "title": "Email",
            "description": "escutapsi@adrielle.com.br",
            "icon": "Mail",
            "color": "#EA4335",
            "link": "mailto:escutapsi@adrielle.com.br",
            "isActive": true,
            "order": 2
          }
        ]);
        setScheduleInfo({
          "weekdays": "Segunda à Sexta: 8h às 18h",
          "saturday": "Sábado: 8h às 12h",
          "sunday": "Domingo: Fechado",
          "additional_info": "Horários flexíveis disponíveis"
        });
        setLocationInfo({
          "city": "Campo Mourão, Paraná",
          "maps_link": "https://maps.google.com/search/Campo+Mourão+Paraná"
        });
        setContactConfig({
          schedulingCardTitle: "Vamos conversar?",
          schedulingCardDescription: "Juntas, vamos caminhar em direção ao seu bem-estar e crescimento pessoal, em um espaço de acolhimento e cuidado",
          schedulingCardButton: "AGENDAMENTO"
        });
        setSchedulingButtonColor("#25D366");
      }
    };

    fetchData();
  }, []);

  return (
    <section id="contact" className="gradient-bg py-4 sm:py-6" ref={ref}>
      <div className="container mx-auto mobile-container max-w-7xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block mb-4">
            <span className="text-sm font-medium text-indigo-600 bg-indigo-100 px-4 py-2 rounded-full">
              {contactConfig.schedulingCardButton || "AGENDAMENTO"}
            </span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-6 tracking-tight">
            {contactConfig.schedulingCardTitle ? (
              contactConfig.schedulingCardTitle.includes('(') && contactConfig.schedulingCardTitle.includes(')') ? (
                <>
                  {contactConfig.schedulingCardTitle.split('(')[0]}
                  <span className="text-gradient font-medium">
                    {contactConfig.schedulingCardTitle.match(/\((.*?)\)/)?.[1] || ''}
                  </span>
                  {contactConfig.schedulingCardTitle.split(')')[1] || ''}
                </>
              ) : (
                contactConfig.schedulingCardTitle
              )
            ) : (
              <>
                Vamos{" "}
                <span className="text-gradient font-medium">
                  conversar?
                </span>
              </>
            )}
          </h2>
          <p className="text-gray-600 text-lg font-light leading-relaxed max-w-2xl mx-auto">
            {contactConfig.schedulingCardDescription || "Juntas, vamos caminhar em direção ao seu bem-estar e crescimento pessoal, em um espaço de acolhimento e cuidado"}
          </p>
        </motion.div>

        <div className={`grid gap-8 max-w-4xl mx-auto ${
          (scheduleInfo.isActive !== false || locationInfo.isActive !== false) 
            ? 'md:grid-cols-2' 
            : 'md:grid-cols-1 place-items-center'
        }`}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex w-full max-w-md"
          >
            <div className="card-aesthetic p-6 sm:p-8 rounded-2xl flex flex-col transition-all duration-300 w-full h-full">
              <h3 className="font-display font-semibold text-xl sm:text-2xl text-gray-800 mb-6 text-center sm:text-left">
                Entre em contato
              </h3>

              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                  {contactItems
                    .filter((item: any) => item.isActive)
                    .sort((a: any, b: any) => a.order - b.order)
                    .map((item: any) => {
                      const IconComponent = iconMap[item.icon] || Mail;
                      return (
                        <a
                          key={item.id}
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-4 p-4 glass rounded-2xl hover:scale-105 transition-all duration-300"
                        >
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: item.color }}
                          >
                            <IconComponent className="text-white text-xl" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{item.title}</h4>
                            {item.description && (
                              <p className="text-gray-600">{item.description}</p>
                            )}
                          </div>
                        </a>
                      );
                    })}
                </div>
              </div>
            </div>
          </motion.div>

          {(scheduleInfo.isActive !== false || locationInfo.isActive !== false) && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex w-full max-w-md"
            >
              <div className="card-aesthetic p-6 sm:p-8 rounded-2xl flex flex-col transition-all duration-300 w-full h-full">
                <h3 className="font-display font-semibold text-xl sm:text-2xl text-gray-800 mb-6 text-center sm:text-left">
                  {locationInfo.isActive !== false && scheduleInfo.isActive !== false 
                    ? "Horários e localização"
                    : locationInfo.isActive !== false 
                      ? "Localização" 
                      : "Horários de atendimento"
                  }
                </h3>

                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-10">
                    {locationInfo.isActive !== false && (
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <MapPin className="text-white text-xl" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">Localização</h4>
                          <a
                            href={locationInfo.maps_link || "https://maps.google.com/search/Campo+Mourão+Paraná"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-purple-600 transition-colors cursor-pointer"
                          >
                            {locationInfo.city || "Campo Mourão, Paraná"}
                          </a>
                        </div>
                      </div>
                    )}

                    {scheduleInfo.isActive !== false && (
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Clock className="text-white text-xl" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">Horários</h4>
                          <div className="text-gray-600 space-y-1">
                            <p>{scheduleInfo.weekdays || "Segunda à Sexta: 8h às 18h"}</p>
                            <p>{scheduleInfo.saturday || "Sábado: 8h às 12h"}</p>
                            <p>{scheduleInfo.sunday || "Domingo: Fechado"}</p>
                          </div>
                          {scheduleInfo.additional_info && (
                            <p className="text-gray-500 text-sm mt-2">{scheduleInfo.additional_info}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}