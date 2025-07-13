import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Phone, Mail, MapPin, MoveRight, Star, Heart, ShieldCheck, Users } from 'lucide-react';

import heroBg from '../images/welcome/hero-bg.jpg';
import aboutUs from '../images/welcome/about-us.jpg';
import pilates from '../images/welcome/pilates.svg';
import physiotherapy from '../images/welcome/physiotherapy.svg';
import functional from '../images/welcome/functional.svg';
import avatar1 from '../images/welcome/avatar1.png';
import avatar2 from '../images/welcome/avatar2.png';
import avatar3 from '../images/welcome/avatar3.png';

const primaryColor = '#10B981'; // Emerald 500

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    const NavLink = ({ href, children }) => (
        <a href={href} className="text-gray-600 hover:text-emerald-500 transition-colors duration-300">
            {children}
        </a>
    );

    const Feature = ({ icon, title, children }) => (
        <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <p className="text-gray-600 mt-1">{children}</p>
            </div>
        </div>
    );

    const ServiceCard = ({ icon, title, children }) => (
        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
            <p className="text-gray-600">{children}</p>
        </div>
    );

    const TestimonialCard = ({ quote, author, image }) => (
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <img src={image} alt={author} className="w-20 h-20 rounded-full mx-auto mb-4" />
            <p className="text-gray-600 italic mb-4">"{quote}"</p>
            <div className="font-bold text-emerald-500">- {author}</div>
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
                            <Link href="/" className="text-3xl font-bold text-emerald-500">
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
                                    <Link href={route('dashboard')} className="inline-block px-6 py-2.5 rounded-full font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors">
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link href={route('login')} className="inline-block px-6 py-2.5 rounded-full font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors">
                                        Entrar
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section id="inicio" className="relative min-h-[85vh] flex items-center bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }}>
                    <div className="absolute inset-0 bg-black/50"></div>
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">Pilates & Fisioterapia</h1>
                        <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 font-light">
                            Encontre o equilíbrio perfeito para corpo e mente.
                        </p>
                        <a href="#contato" className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-emerald-500 hover:bg-emerald-600 hover:scale-105 transition-all duration-300">
                            Agende sua Aula Experimental
                            <MoveRight className="ml-3 h-6 w-6" />
                        </a>
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
                                <span className="text-emerald-500 font-semibold">Sobre Nós</span>
                                <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-6">Bem-vindo ao seu novo espaço de bem-estar</h2>
                                <p className="text-gray-600 mb-8 text-lg">
                                    Nosso estúdio foi pensado para ser um refúgio da rotina, onde você pode se reconectar com seu corpo e mente. Com equipamentos de ponta e uma equipe de especialistas, oferecemos uma experiência transformadora que vai além do exercício físico.
                                </p>
                                <div className="space-y-6">
                                    <Feature icon={<Heart className="h-7 w-7 text-emerald-500" />} title="Atendimento Personalizado">
                                        Turmas reduzidas e atenção individualizada para garantir que você alcance seus objetivos com segurança.
                                    </Feature>
                                    <Feature icon={<ShieldCheck className="h-7 w-7 text-emerald-500" />} title="Ambiente Acolhedor">
                                        Um espaço moderno, climatizado e projetado para o seu máximo conforto e bem-estar.
                                    </Feature>
                                    <Feature icon={<Users className="h-7 w-7 text-emerald-500" />} title="Profissionais Qualificados">
                                        Nossa equipe é composta por fisioterapeutas e educadores físicos certificados e apaixonados pelo que fazem.
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
                            <span className="text-emerald-500 font-semibold">Nossos Serviços</span>
                            <h2 className="text-4xl font-bold text-gray-900 mt-2">Cuidado completo para sua saúde</h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <ServiceCard icon={<img src={pilates} alt="" />} title="Pilates Clínico">
                                Fortaleça seu corpo, melhore a postura e alivie dores com nosso método de Pilates adaptado às suas necessidades.
                            </ServiceCard>
                            <ServiceCard icon={<img src={physiotherapy} alt="" />} title="Fisioterapia">
                                Tratamentos para reabilitação de lesões, alívio de dores crônicas e recuperação de movimentos.
                            </ServiceCard>
                            <ServiceCard icon={<img src={functional} alt="" />} title="Treinamento Funcional">
                                Aumente sua performance e resistência com treinos dinâmicos que preparam seu corpo para as atividades do dia a dia.
                            </ServiceCard>
                        </div>
                    </div>
                </section>

                {/* Depoimentos Section */}
                <section id="depoimentos" className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <span className="text-emerald-500 font-semibold">Depoimentos</span>
                            <h2 className="text-4xl font-bold text-gray-900 mt-2">O que nossos alunos dizem</h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <TestimonialCard
                                quote="O melhor estúdio! Instrutores atenciosos e um ambiente incrível. Minha dor nas costas desapareceu em poucas semanas."
                                author="Ana Souza"
                                image={avatar1}
                            />
                            <TestimonialCard
                                quote="Nunca imaginei que gostaria tanto de Pilates. A equipe é fantástica e os resultados são visíveis. Recomendo de olhos fechados!"
                                author="Carlos Andrade"
                                image={avatar2}
                            />
                            <TestimonialCard
                                quote="Um lugar para cuidar do corpo e da mente. O profissionalismo e a energia do estúdio são contagiantes. Amo cada aula!"
                                author="Juliana Lima"
                                image={avatar3}
                            />
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-emerald-500">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                        <h2 className="text-4xl font-bold text-white mb-4">Comece sua jornada para uma vida mais saudável hoje!</h2>
                        <p className="text-emerald-100 text-lg mb-8">
                            Agende uma aula experimental e descubra como o Pilates e a Fisioterapia podem transformar sua vida.
                        </p>
                        <a href="#contato" className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-bold rounded-full text-emerald-500 bg-white hover:bg-gray-100 hover:scale-105 transition-all duration-300">
                            Fale Conosco
                        </a>
                    </div>
                </section>

                {/* Footer */}
                <footer id="contato" className="bg-gray-800 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="grid md:grid-cols-4 gap-8">
                            <div className="md:col-span-1">
                                <h3 className="text-2xl font-bold text-white mb-4">Studio Fisiopilates</h3>
                                <p className="text-gray-400">
                                    Transformando vidas através do movimento consciente.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg mb-4">Links</h4>
                                <ul className="space-y-2">
                                    <li><a href="#inicio" className="text-gray-400 hover:text-white">Início</a></li>
                                    <li><a href="#sobre" className="text-gray-400 hover:text-white">Sobre</a></li>
                                    <li><a href="#servicos" className="text-gray-400 hover:text-white">Serviços</a></li>
                                    <li><a href="#depoimentos" className="text-gray-400 hover:text-white">Depoimentos</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg mb-4">Contato</h4>
                                <ul className="space-y-3 text-gray-400">
                                    <li className="flex items-start"><MapPin className="h-5 w-5 mr-3 mt-1 text-emerald-400 flex-shrink-0" />Rua das Flores, 123 - São Paulo/SP</li>
                                    <li className="flex items-center"><Phone className="h-5 w-5 mr-3 text-emerald-400" />(11) 98765-4321</li>
                                    <li className="flex items-center"><Mail className="h-5 w-5 mr-3 text-emerald-400" />contato@studiofisiopilates.com</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg mb-4">Horário de Funcionamento</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li>Segunda a Sexta: 06h - 22h</li>
                                    <li>Sábado: 08h - 14h</li>
                                    <li>Domingo: Fechado</li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-500">
                            <p>&copy; {new Date().getFullYear()} Studio Fisiopilates. Todos os direitos reservados.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}