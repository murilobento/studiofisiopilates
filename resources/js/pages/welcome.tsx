import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Phone, Mail, MapPin, MoveRight, Star, Heart, ShieldCheck, Users, Activity, Zap, Target, Send, Clock, MessageCircle, ArrowUp } from 'lucide-react';
import { ReactNode, useState, useEffect } from 'react';

// Pexels videos for hero carousel
const heroVideos = [
    'https://videos.pexels.com/video-files/6111076/6111076-uhd_2560_1440_25fps.mp4',
    'https://videos.pexels.com/video-files/6023252/6023252-uhd_2560_1440_25fps.mp4',
    'https://videos.pexels.com/video-files/6111110/6111110-uhd_2560_1440_25fps.mp4',
    'https://videos.pexels.com/video-files/6023227/6023227-uhd_2560_1440_25fps.mp4'
];

// Unsplash images for other sections
const aboutUs = 'https://images.unsplash.com/photo-1717500252297-b09508db7ceb?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
const avatar1 = 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80';
const avatar2 = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80';
const avatar3 = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80';

const primaryColor = '#40C0B0'; // Custom Teal

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    // Carrossel automático de vídeos (8 segundos)
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentVideoIndex((prevIndex) => 
                prevIndex === heroVideos.length - 1 ? 0 : prevIndex + 1
            );
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    // Detectar scroll para mostrar/esconder botão voltar ao topo
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Aqui você pode adicionar a lógica de envio do formulário
        console.log('Form submitted:', formData);
        alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        setFormData({ name: '', email: '', phone: '', message: '' });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const smoothScroll = (targetId: string) => {
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const NavLink = ({ href, children }: { href: string; children: ReactNode }) => (
        <button 
            onClick={() => smoothScroll(href.replace('#', ''))}
            className="text-gray-600 transition-colors duration-300 cursor-pointer"
            style={{ '--hover-color': primaryColor } as any}
            onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
            onMouseLeave={(e) => e.currentTarget.style.color = ''}
        >
            {children}
        </button>
    );

    const Feature = ({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) => (
        <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <p className="text-gray-600 mt-1 text-justify">{children}</p>
            </div>
        </div>
    );

    const ServiceCard = ({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) => (
        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full mx-auto mb-6" style={{ backgroundColor: `${primaryColor}20` }}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
            <p className="text-gray-600 text-justify">{children}</p>
        </div>
    );

    const TestimonialCard = ({ quote, author, image }: { quote: string; author: string; image: string }) => (
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <img src={image} alt={author} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />
            <p className="text-gray-600 italic mb-4 text-justify">"{quote}"</p>
            <div className="font-bold" style={{ color: primaryColor }}>- {author}</div>
        </div>
    );

    return (
        <>
            <Head title="Studio Fisiopilates - Pilates & Fisioterapia" />
            <div className="bg-gray-50 font-sans">
                {/* Header */}
                <header className="bg-white/90 backdrop-blur-lg shadow-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-20">
                            <Link href="/" className="text-3xl font-bold" style={{ color: primaryColor }}>
                                Studio Fisiopilates
                            </Link>
                            <nav className="hidden md:flex items-center space-x-10">
                                <NavLink href="#inicio">Início</NavLink>
                                <NavLink href="#sobre">Sobre</NavLink>
                                <NavLink href="#servicos">Serviços</NavLink>
                                <NavLink href="#depoimentos">Depoimentos</NavLink>
                                <NavLink href="#contato">Contato</NavLink>
                            </nav>
                            <div>
                                {auth.user ? (
                                    <Link 
                                        href={route('dashboard')} 
                                        className="inline-block px-6 py-2.5 rounded-full font-semibold text-white transition-colors"
                                        style={{ backgroundColor: primaryColor }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link 
                                        href={route('login')} 
                                        className="inline-block px-6 py-2.5 rounded-full font-semibold text-white transition-colors"
                                        style={{ backgroundColor: primaryColor }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                    >
                                        Entrar
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero Section with Video Carousel */}
                <section id="inicio" className="relative min-h-[85vh] flex items-center overflow-hidden">
                    {/* Video Carousel */}
                    <div className="absolute inset-0">
                        {heroVideos.map((videoSrc, index) => (
                            <video
                                key={index}
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                                    index === currentVideoIndex ? 'opacity-100' : 'opacity-0'
                                }`}
                                autoPlay
                                muted
                                loop
                                playsInline
                            >
                                <source src={videoSrc} type="video/mp4" />
                            </video>
                        ))}
                    </div>
                    
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black/50"></div>
                    
                    {/* Content */}
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white z-10">
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">Pilates & Fisioterapia</h1>
                        <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 font-light text-justify">
                            Descubra o equilíbrio perfeito entre corpo e mente em nosso estúdio especializado. 
                            Oferecemos tratamentos personalizados de pilates clínico e fisioterapia, 
                            proporcionando bem-estar, saúde e qualidade de vida através do movimento consciente.
                        </p>
                        <button 
                            onClick={() => smoothScroll('contato')}
                            className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-bold rounded-full text-white hover:scale-105 transition-all duration-300"
                            style={{ backgroundColor: primaryColor }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            Agende sua Aula Experimental
                            <MoveRight className="ml-3 h-6 w-6" />
                        </button>
                    </div>

                    {/* Video Indicators */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
                        {heroVideos.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentVideoIndex(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                    index === currentVideoIndex 
                                        ? 'w-8' 
                                        : 'bg-white/50 hover:bg-white/75'
                                }`}
                                style={index === currentVideoIndex ? { backgroundColor: primaryColor } : {}}
                            />
                        ))}
                    </div>
                </section>

                {/* Sobre Section */}
                <section id="sobre" className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div className="rounded-lg overflow-hidden shadow-2xl">
                                <img src={aboutUs} alt="Studio de Pilates" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <span className="font-semibold" style={{ color: primaryColor }}>Sobre Nós</span>
                                <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-6">Bem-vindo ao seu novo espaço de bem-estar</h2>
                                <p className="text-gray-600 mb-8 text-lg text-justify">
                                    Nosso estúdio foi cuidadosamente projetado para ser um verdadeiro refúgio da rotina corrida do dia a dia, 
                                    onde você pode se reconectar profundamente com seu corpo e mente. Equipado com aparelhos de última geração 
                                    e conduzido por uma equipe de especialistas altamente qualificados, oferecemos uma experiência 
                                    transformadora que transcende o exercício físico tradicional, promovendo healing integral e bem-estar duradouro.
                                </p>
                                <div className="space-y-6">
                                    <Feature icon={<Heart className="h-7 w-7" style={{ color: primaryColor }} />} title="Atendimento Personalizado">
                                        Trabalhamos com turmas reduzidas e oferecemos atenção individualizada para garantir que você alcance seus objetivos pessoais com total segurança e eficácia, respeitando seus limites e potencializando seus resultados.
                                    </Feature>
                                    <Feature icon={<ShieldCheck className="h-7 w-7" style={{ color: primaryColor }} />} title="Ambiente Acolhedor">
                                        Nosso espaço moderno, climatizado e ergonomicamente projetado foi pensado para proporcionar o máximo conforto e bem-estar, criando um ambiente propício para o relaxamento e concentração durante suas sessões.
                                    </Feature>
                                    <Feature icon={<Users className="h-7 w-7" style={{ color: primaryColor }} />} title="Profissionais Qualificados">
                                        Nossa equipe multidisciplinar é composta por fisioterapeutas e educadores físicos certificados, especialistas em pilates clínico e movimento funcional, todos unidos pela paixão genuína em promover saúde e transformação de vidas.
                                    </Feature>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Serviços Section */}
                <section id="servicos" className="py-24 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <span className="font-semibold" style={{ color: primaryColor }}>Nossos Serviços</span>
                            <h2 className="text-4xl font-bold text-gray-900 mt-2">Cuidado completo para sua saúde</h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <ServiceCard icon={<Activity className="h-8 w-8" style={{ color: primaryColor }} />} title="Pilates Clínico">
                                Método terapêutico baseado em exercícios de baixo impacto que fortalece a musculatura profunda, 
                                melhora significativamente a postura corporal e alivia dores crônicas. Nosso pilates clínico é 
                                especialmente adaptado às necessidades individuais de cada paciente, proporcionando recuperação 
                                funcional e prevenção de lesões.
                            </ServiceCard>
                            <ServiceCard icon={<Heart className="h-8 w-8" style={{ color: primaryColor }} />} title="Fisioterapia">
                                Tratamentos especializados e evidence-based para reabilitação de lesões musculoesqueléticas, 
                                alívio de dores crônicas e agudas, recuperação da amplitude de movimento e fortalecimento funcional. 
                                Utilizamos técnicas modernas e equipamentos avançados para acelerar seu processo de recuperação 
                                e restaurar sua qualidade de vida.
                            </ServiceCard>
                            <ServiceCard icon={<Zap className="h-8 w-8" style={{ color: primaryColor }} />} title="Treinamento Funcional">
                                Programa de exercícios dinâmicos e integrados que aumenta sua performance física, resistência 
                                cardiovascular e coordenação motora. Nossos treinos funcionais são especificamente desenhados 
                                para preparar seu corpo para as demandas e atividades da vida cotidiana, melhorando sua 
                                capacidade funcional global.
                            </ServiceCard>
                        </div>
                    </div>
                </section>

                {/* Depoimentos Section */}
                <section id="depoimentos" className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <span className="font-semibold" style={{ color: primaryColor }}>Depoimentos</span>
                            <h2 className="text-4xl font-bold text-gray-900 mt-2">O que nossos alunos dizem</h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <TestimonialCard
                                quote="O Studio Fisiopilates é verdadeiramente excepcional! Os instrutores são extremamente atenciosos e o ambiente é simplesmente incrível. Minha dor lombar crônica, que me incomodava há anos, desapareceu completamente em apenas algumas semanas de tratamento."
                                author="Ana Souza"
                                image={avatar1}
                            />
                            <TestimonialCard
                                quote="Nunca imaginei que me adaptaria tão bem ao pilates, mas este lugar mudou completamente minha perspectiva. A equipe é fantástica, sempre motivadora, e os resultados são visíveis desde as primeiras sessões. Recomendo de olhos fechados para qualquer pessoa!"
                                author="Carlos Andrade"
                                image={avatar2}
                            />
                            <TestimonialCard
                                quote="Este é muito mais que um estúdio - é um verdadeiro santuário para cuidar do corpo e da mente. O profissionalismo combinado com a energia positiva do ambiente é absolutamente contagiante. Amo profundamente cada aula e cada momento aqui!"
                                author="Juliana Lima"
                                image={avatar3}
                            />
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section style={{ backgroundColor: primaryColor }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                        <h2 className="text-4xl font-bold text-white mb-4">Comece sua jornada para uma vida mais saudável hoje!</h2>
                        <p className="text-white/80 text-lg mb-8 max-w-3xl mx-auto text-justify">
                            Não deixe para amanhã o cuidado que seu corpo e mente merecem hoje. Agende uma aula experimental 
                            gratuita e descubra pessoalmente como o Pilates Clínico e a Fisioterapia podem transformar 
                            profundamente sua qualidade de vida, proporcionando bem-estar duradouro e saúde integral.
                        </p>
                        <button 
                            onClick={() => smoothScroll('contato')}
                            className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-bold rounded-full bg-white hover:bg-gray-100 hover:scale-105 transition-all duration-300"
                            style={{ color: primaryColor }}
                        >
                            Fale Conosco
                        </button>
                    </div>
                </section>

                {/* Contato Section */}
                <section id="contato" className="py-24 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <span className="font-semibold" style={{ color: primaryColor }}>Entre em Contato</span>
                            <h2 className="text-4xl font-bold text-gray-900 mt-2">Estamos aqui para ajudar você</h2>
                            <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-justify">
                                Nossa equipe está pronta para esclarecer suas dúvidas e ajudá-lo a dar o primeiro passo 
                                rumo a uma vida mais saudável. Entre em contato conosco através do formulário abaixo 
                                ou utilize nossos canais de comunicação.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-16">
                            {/* Formulário de Contato */}
                            <div className="bg-white p-8 rounded-xl shadow-lg">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Envie sua Mensagem</h3>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Nome Completo
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                                            style={{ '--focus-ring-color': primaryColor, '--focus-border-color': primaryColor } as any}
                                            onFocus={(e) => {
                                                e.currentTarget.style.borderColor = primaryColor;
                                                e.currentTarget.style.boxShadow = `0 0 0 2px ${primaryColor}40`;
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = '';
                                                e.currentTarget.style.boxShadow = '';
                                            }}
                                            placeholder="Seu nome completo"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            E-mail
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                                            placeholder="seu@email.com"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                            Telefone/WhatsApp
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                                            placeholder="(18) 99999-9999"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                            Mensagem
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors resize-none"
                                            placeholder="Conte-nos como podemos ajudá-lo..."
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center"
                                        style={{ backgroundColor: primaryColor }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                    >
                                        <Send className="h-5 w-5 mr-2" />
                                        Enviar Mensagem
                                    </button>
                                </form>
                            </div>

                            {/* Informações de Contato e Mapa */}
                            <div className="space-y-8">
                                {/* Dados de Contato */}
                                <div className="bg-white p-8 rounded-xl shadow-lg">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Informações de Contato</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-start space-x-4">
                                            <MapPin className="h-6 w-6 mt-1 flex-shrink-0" style={{ color: primaryColor }} />
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Endereço</h4>
                                                <p className="text-gray-600">Avenida Clemente Pereira 732A</p>
                                                <p className="text-gray-600">Regente Feijó - SP</p>
                                                <p className="text-sm text-gray-500 mt-1">Plus Code: QMPX+G3 Reg. Feijó, São Paulo</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-4">
                                            <Phone className="h-6 w-6 mt-1 flex-shrink-0" style={{ color: primaryColor }} />
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Telefone/WhatsApp</h4>
                                                <p className="text-gray-600">(18) 99688-6400</p>
                                                <a 
                                                    href="https://wa.me/5518996886400" 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center transition-colors mt-1"
                                                    style={{ color: primaryColor }}
                                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                                >
                                                    <MessageCircle className="h-4 w-4 mr-1" />
                                                    Conversar no WhatsApp
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-4">
                                            <Mail className="h-6 w-6 mt-1 flex-shrink-0" style={{ color: primaryColor }} />
                                            <div>
                                                <h4 className="font-semibold text-gray-900">E-mail</h4>
                                                <a 
                                                    href="mailto:takamotopatricia@gmail.com" 
                                                    className="text-gray-600 transition-colors"
                                                    onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = ''}
                                                >
                                                    takamotopatricia@gmail.com
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-4">
                                            <Clock className="h-6 w-6 mt-1 flex-shrink-0" style={{ color: primaryColor }} />
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Horário de Funcionamento</h4>
                                                <p className="text-gray-600">Segunda a Sexta: 07h às 21h</p>
                                                <p className="text-gray-600">Sábados e Domingos: Fechado</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mapa */}
                                <div className="bg-white p-8 rounded-xl shadow-lg">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Localização</h3>
                                    <div className="aspect-video rounded-lg overflow-hidden">
                                        <iframe
                                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3677.8454363815374!2d-50.21667962549336!3d-22.83333797929289!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94979f3c1d3b8b8b%3A0x1f4f7b8a2c3d4e5f!2sAv.%20Clemente%20Pereira%2C%20732%20-%20Centro%2C%20Regente%20Feij%C3%B3%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1642345678901!5m2!1spt-BR!2sbr"
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            title="Localização do Studio Fisiopilates"
                                        ></iframe>
                                    </div>
                                    <div className="mt-4">
                                        <a
                                            href="https://goo.gl/maps/QMPX+G3"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center transition-colors"
                                            style={{ color: primaryColor }}
                                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                        >
                                            <MapPin className="h-4 w-4 mr-1" />
                                            Ver no Google Maps
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-800 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="grid md:grid-cols-4 gap-8">
                            <div className="md:col-span-1">
                                <h3 className="text-2xl font-bold text-white mb-4">Studio Fisiopilates</h3>
                                <p className="text-gray-400 text-justify">
                                    Transformando vidas através do movimento consciente e do cuidado integral 
                                    com a saúde física e mental.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg mb-4">Links</h4>
                                <ul className="space-y-2">
                                    <li><button onClick={() => smoothScroll('inicio')} className="text-gray-400 hover:text-white transition-colors">Início</button></li>
                                    <li><button onClick={() => smoothScroll('sobre')} className="text-gray-400 hover:text-white transition-colors">Sobre</button></li>
                                    <li><button onClick={() => smoothScroll('servicos')} className="text-gray-400 hover:text-white transition-colors">Serviços</button></li>
                                    <li><button onClick={() => smoothScroll('depoimentos')} className="text-gray-400 hover:text-white transition-colors">Depoimentos</button></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg mb-4">Contato</h4>
                                <ul className="space-y-3 text-gray-400">
                                    <li className="flex items-start"><MapPin className="h-5 w-5 mr-3 mt-1 flex-shrink-0" style={{ color: `${primaryColor}CC` }} />Avenida Clemente Pereira 732A, Regente Feijó - SP</li>
                                    <li className="flex items-center"><Phone className="h-5 w-5 mr-3" style={{ color: `${primaryColor}CC` }} />(18) 99688-6400</li>
                                    <li className="flex items-center"><Mail className="h-5 w-5 mr-3" style={{ color: `${primaryColor}CC` }} />takamotopatricia@gmail.com</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg mb-4">Horário de Funcionamento</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li>Segunda a Sexta: 07h às 21h</li>
                                    <li>Sábados e Domingos: Fechado</li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-500">
                            <p>&copy; {new Date().getFullYear()} Studio Fisiopilates. Todos os direitos reservados.</p>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Botão Voltar ao Topo */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
                    style={{ backgroundColor: primaryColor }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    aria-label="Voltar ao topo"
                >
                    <ArrowUp className="h-6 w-6" />
                </button>
            )}
        </>
    );
}