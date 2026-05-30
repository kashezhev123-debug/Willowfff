import { motion, AnimatePresence } from "framer-motion";
import { 
  Monitor, Cpu, Gamepad2, Clock, 
  MapPin, Phone, MessageCircle, Clock4, 
  ChevronDown, Send, Menu, X, XCircle 
} from "lucide-react";
import { 
  SiCounterstrike, SiDota2, SiValorant, 
  SiFortnite, SiPubg, SiRockstargames, SiTelegram
} from "react-icons/si";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [activeTab, setActiveTab] = useState("standard");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans overflow-x-hidden">
      
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md border-b border-white/5 py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          <div className="text-2xl font-black tracking-tighter text-white neon-text-glow cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            WILLOW
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 text-sm font-medium text-muted-foreground">
            <button onClick={() => scrollToSection('advantages')} className="hover:text-primary transition-colors">Преимущества</button>
            <button onClick={() => scrollToSection('gallery')} className="hover:text-primary transition-colors">Галерея</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-primary transition-colors">Тарифы</button>
            <button onClick={() => scrollToSection('games')} className="hover:text-primary transition-colors">Игры</button>
            <button onClick={() => scrollToSection('contacts')} className="hover:text-primary transition-colors">Контакты</button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-24 px-6 flex flex-col space-y-6 md:hidden"
          >
            <button onClick={() => scrollToSection('advantages')} className="text-2xl font-bold text-white text-left">Преимущества</button>
            <button onClick={() => scrollToSection('gallery')} className="text-2xl font-bold text-white text-left">Галерея</button>
            <button onClick={() => scrollToSection('pricing')} className="text-2xl font-bold text-white text-left">Тарифы</button>
            <button onClick={() => scrollToSection('games')} className="text-2xl font-bold text-white text-left">Игры</button>
            <button onClick={() => scrollToSection('contacts')} className="text-2xl font-bold text-white text-left">Контакты</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15)_0%,rgba(0,0,0,0)_60%)]"></div>
          
          {/* Animated Particles */}
          <div className="absolute inset-0 opacity-30">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-primary"
                initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: Math.random() * window.innerHeight,
                  opacity: Math.random() * 0.5 + 0.3
                }}
                animate={{ 
                  y: [null, Math.random() * window.innerHeight],
                  x: [null, Math.random() * window.innerWidth],
                }}
                transition={{ 
                  duration: Math.random() * 20 + 10,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            ))}
          </div>
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white mb-6 neon-text-glow"
          >
            WILLOW
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-3xl text-muted-foreground font-medium mb-10 max-w-2xl mx-auto"
          >
            Компьютерный клуб нового поколения
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-xl neon-glow w-full sm:w-auto"
              onClick={() => window.location.href = "tel:89287097705"}
            >
              Забронировать
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary/50 hover:bg-primary/10 text-white px-8 py-6 text-lg rounded-xl w-full sm:w-auto flex items-center gap-2"
              onClick={() => window.open("https://t.me/willow_valley", "_blank")}
            >
              <SiTelegram /> Telegram
            </Button>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-muted-foreground cursor-pointer"
          onClick={() => scrollToSection('advantages')}
        >
          <span className="text-sm uppercase tracking-widest mb-2">Скролл вниз</span>
          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </motion.div>
      </section>

      {/* Advantages */}
      <section id="advantages" className="py-24 relative z-10 bg-background/50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Почему WILLOW?</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full neon-glow"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Monitor, title: "18 игровых ПК", desc: "Мощные сборки для любых современных игр на ультра-настройках" },
              { icon: Cpu, title: "5 VIP ПК", desc: "Премиальное железо в закрытой зоне для максимального погружения" },
              { icon: Gamepad2, title: "PlayStation", desc: "Отдельная PS зона и VIP комната с огромными TV экранами" },
              { icon: Clock, title: "24/7", desc: "Мы открыты круглосуточно. Играй когда удобно." }
            ].map((adv, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 rounded-2xl flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 neon-glow-hover group"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <adv.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{adv.title}</h3>
                <p className="text-muted-foreground">{adv.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-24 relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Наш клуб</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full neon-glow"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((num, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="aspect-video relative overflow-hidden rounded-xl cursor-pointer group"
                onClick={() => setSelectedImage(`/gallery/${num}.png`)}
              >
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                <img 
                  src={`/gallery/${num}.png`} 
                  alt={`WILLOW Gallery ${num}`} 
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-6 right-6 text-white/70 hover:text-white" onClick={() => setSelectedImage(null)}>
              <XCircle className="w-10 h-10" />
            </button>
            <motion.img 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage} 
              alt="Enlarged view" 
              className="max-w-full max-h-[90vh] rounded-lg shadow-[0_0_50px_rgba(139,92,246,0.3)]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pricing */}
      <section id="pricing" className="py-24 relative z-10 bg-background/50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Тарифы</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full neon-glow mb-12"></div>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { id: "standard", label: "Стандарт" },
              { id: "vip", label: "VIP" },
              { id: "ps", label: "PlayStation" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-8 py-3 rounded-full text-lg font-medium transition-all ${
                  activeTab === tab.id ? "text-white" : "text-muted-foreground hover:text-white"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/20 border border-primary/50 rounded-full neon-glow"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="max-w-4xl mx-auto glass-card rounded-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === "standard" && (
                <motion.div
                  key="standard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 md:p-8"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-muted-foreground">
                          <th className="py-4 font-medium">Время</th>
                          <th className="py-4 font-medium text-center">1 час</th>
                          <th className="py-4 font-medium text-center">3 часа</th>
                          <th className="py-4 font-medium text-center">5 часов</th>
                        </tr>
                      </thead>
                      <tbody className="text-white">
                        <tr className="border-b border-white/5">
                          <td className="py-4 text-primary">Будни 08:00–15:00</td>
                          <td className="py-4 text-center">125₽</td>
                          <td className="py-4 text-center">325₽</td>
                          <td className="py-4 text-center font-bold">490₽</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-4 text-primary">Будни 15:00–08:00</td>
                          <td className="py-4 text-center">135₽</td>
                          <td className="py-4 text-center">355₽</td>
                          <td className="py-4 text-center font-bold">530₽</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-4 text-primary">Выходные 08:00–15:00</td>
                          <td className="py-4 text-center">135₽</td>
                          <td className="py-4 text-center">355₽</td>
                          <td className="py-4 text-center font-bold">530₽</td>
                        </tr>
                        <tr className="border-b border-white/10">
                          <td className="py-4 text-primary">Выходные 15:00–08:00</td>
                          <td className="py-4 text-center">135₽</td>
                          <td className="py-4 text-center">385₽</td>
                          <td className="py-4 text-center font-bold">605₽</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10 flex-1">
                      <div className="text-sm text-muted-foreground mb-1">Ночь Будни</div>
                      <div className="text-2xl font-bold text-white">550₽</div>
                    </div>
                    <div className="bg-primary/20 rounded-xl p-4 text-center border border-primary/30 flex-1 neon-glow">
                      <div className="text-sm text-primary-foreground/70 mb-1">Ночь Выходные</div>
                      <div className="text-2xl font-bold text-white">660₽</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "vip" && (
                <motion.div
                  key="vip"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 md:p-8"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-muted-foreground">
                          <th className="py-4 font-medium">Время</th>
                          <th className="py-4 font-medium text-center">1 час</th>
                          <th className="py-4 font-medium text-center">3 часа</th>
                          <th className="py-4 font-medium text-center">5 часов</th>
                        </tr>
                      </thead>
                      <tbody className="text-white">
                        <tr className="border-b border-white/5">
                          <td className="py-4 text-primary">Будни 08:00–15:00</td>
                          <td className="py-4 text-center">180₽</td>
                          <td className="py-4 text-center">440₽</td>
                          <td className="py-4 text-center font-bold">715₽</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-4 text-primary">Будни 15:00–08:00</td>
                          <td className="py-4 text-center">195₽</td>
                          <td className="py-4 text-center">520₽</td>
                          <td className="py-4 text-center font-bold">825₽</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-4 text-primary">Выходные 08:00–15:00</td>
                          <td className="py-4 text-center">195₽</td>
                          <td className="py-4 text-center">520₽</td>
                          <td className="py-4 text-center font-bold">825₽</td>
                        </tr>
                        <tr className="border-b border-white/10">
                          <td className="py-4 text-primary">Выходные 15:00–08:00</td>
                          <td className="py-4 text-center">195₽</td>
                          <td className="py-4 text-center">550₽</td>
                          <td className="py-4 text-center font-bold">865₽</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10 flex-1">
                      <div className="text-sm text-muted-foreground mb-1">VIP Ночь Будни</div>
                      <div className="text-2xl font-bold text-white">825₽</div>
                    </div>
                    <div className="bg-[#a78bfa]/20 rounded-xl p-4 text-center border border-[#a78bfa]/30 flex-1 neon-glow">
                      <div className="text-sm text-[#a78bfa] mb-1">VIP Ночь Выходные</div>
                      <div className="text-2xl font-bold text-white">990₽</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "ps" && (
                <motion.div
                  key="ps"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 md:p-8"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
                      <div className="text-muted-foreground mb-2">1 час</div>
                      <div className="text-3xl font-bold text-white">210₽</div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
                      <div className="text-muted-foreground mb-2">3 часа</div>
                      <div className="text-3xl font-bold text-white">540₽</div>
                    </div>
                    <div className="bg-primary/20 rounded-2xl p-6 text-center border border-primary/30 neon-glow">
                      <div className="text-primary-foreground/80 mb-2">5 часов</div>
                      <div className="text-3xl font-bold text-white">870₽</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 rounded-2xl p-8 text-center border border-primary/30">
                    <h3 className="text-2xl font-bold text-white mb-2">VIP PlayStation</h3>
                    <div className="text-4xl font-black text-primary neon-text-glow">500₽ <span className="text-lg text-muted-foreground font-normal">/ час</span></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Popular Games */}
      <section id="games" className="py-24 relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Популярные игры</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full neon-glow"></div>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
              { name: "CS2", icon: SiCounterstrike, color: "#f97316" },
              { name: "Dota 2", icon: SiDota2, color: "#ef4444" },
              { name: "Valorant", icon: SiValorant, color: "#ff4655" },
              { name: "Fortnite", icon: SiFortnite, color: "#3b82f6" },
              { name: "PUBG", icon: SiPubg, color: "#eab308" },
              { name: "GTA V", icon: SiRockstargames, color: "#22c55e" }
            ].map((game, i) => (
              <motion.div
                key={game.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6 md:p-10 flex flex-col items-center justify-center group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                  style={{ background: `radial-gradient(circle at center, ${game.color} 0%, transparent 70%)` }}
                ></div>
                <game.icon 
                  className="w-16 h-16 md:w-20 md:h-20 mb-4 transition-transform duration-300 group-hover:scale-110" 
                  style={{ color: game.color }}
                />
                <h3 className="text-xl md:text-2xl font-bold text-white relative z-10">{game.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacts & Map */}
      <section id="contacts" className="py-24 relative z-10 bg-background/50 border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Контакты</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full neon-glow"></div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 neon-glow">
                  <MapPin className="text-primary w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-muted-foreground mb-1">Адрес</h4>
                  <p className="text-xl text-white font-medium">Залукокоаже, ул. Комсомольская, 81</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 neon-glow">
                  <Phone className="text-primary w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-muted-foreground mb-1">Телефон</h4>
                  <a href="tel:89287097705" className="text-xl text-white font-medium hover:text-primary transition-colors">
                    8 (928) 709-77-05
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 neon-glow">
                  <MessageCircle className="text-primary w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-muted-foreground mb-1">Telegram</h4>
                  <a href="https://t.me/willow_valley" target="_blank" rel="noreferrer" className="text-xl text-white font-medium hover:text-primary transition-colors">
                    @willow_valley
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 neon-glow">
                  <Clock4 className="text-primary w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-muted-foreground mb-1">Режим работы</h4>
                  <p className="text-xl text-white font-medium">24/7 (Круглосуточно)</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="h-[400px] rounded-2xl overflow-hidden glass-card p-2"
            >
              <iframe 
                src="https://yandex.ru/map-widget/v1/?ll=43.6890,43.2688&z=16&pt=43.6890,43.2688,pm2rdl1" 
                width="100%" 
                height="100%" 
                frameBorder="0"
                className="rounded-xl"
                title="Yandex Map WILLOW"
              ></iframe>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-white/5 bg-background">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-2xl font-black tracking-tighter text-white neon-text-glow">
            WILLOW
          </div>
          <p className="text-muted-foreground text-sm text-center">
            &copy; 2025 WILLOW Gaming Club. Все права защищены.
          </p>
          <a 
            href="https://t.me/willow_valley" 
            target="_blank" 
            rel="noreferrer"
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all text-muted-foreground"
          >
            <SiTelegram className="w-5 h-5" />
          </a>
        </div>
      </footer>

      {/* Floating Telegram Button */}
      <motion.a
        href="https://t.me/willow_valley"
        target="_blank"
        rel="noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center neon-glow hover:scale-110 transition-transform z-50 shadow-lg"
      >
        <SiTelegram className="w-6 h-6 ml-[-2px]" />
      </motion.a>

    </div>
  );
}