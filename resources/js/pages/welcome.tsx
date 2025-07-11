import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ChevronRight, Phone, Mail, MapPin, Clock, Users, Award, Heart, Star } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Studio Pilates - Transforme seu corpo e mente">
                <meta name="description" content="Descubra o verdadeiro Pilates em nosso estúdio. Equipamentos modernos, instrutores qualificados e ambiente acolhedor para sua transformação." />
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:300,400,500,600,700" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen bg-white">
                {/* Header */}
                <header className="bg-white shadow-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <h1 className="text-2xl font-bold text-gray-900">Studio Pilates</h1>
                                </div>
                            </div>
                            <nav className="hidden md:flex space-x-8">
                                <a href="#sobre" className="text-gray-700 hover:text-gray-900 transition-colors">Sobre</a>
                                <a href="#servicos" className="text-gray-700 hover:text-gray-900 transition-colors">Serviços</a>
                                <a href="#estrutura" className="text-gray-700 hover:text-gray-900 transition-colors">Estrutura</a>
                                <a href="#contato" className="text-gray-700 hover:text-gray-900 transition-colors">Contato</a>
                            </nav>
                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 transition-colors"
                                    >
                                        Entrar
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative bg-gradient-to-r from-gray-50 to-gray-100 py-20 lg:py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
                            <div className="mb-12 lg:mb-0">
                                <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                                    Transforme seu
                                    <span className="text-blue-600"> corpo</span> e
                                    <span className="text-blue-600"> mente</span>
                                </h2>
                                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                    Descubra o verdadeiro Pilates em nosso estúdio. Equipamentos modernos, 
                                    instrutores qualificados e ambiente acolhedor para sua transformação.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <a
                                        href="#contato"
                                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                    >
                                        Agende sua Aula Experimental
                                        <ChevronRight className="ml-2 h-5 w-5" />
                                    </a>
                                    <a
                                        href="#sobre"
                                        className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        Saiba Mais
                                    </a>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="bg-blue-600 rounded-2xl p-8 text-white">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold mb-2">500+</div>
                                            <div className="text-blue-100">Alunos Ativos</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold mb-2">5</div>
                                            <div className="text-blue-100">Anos de Experiência</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold mb-2">10+</div>
                                            <div className="text-blue-100">Instrutores</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold mb-2">100%</div>
                                            <div className="text-blue-100">Satisfação</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sobre Section */}
                <section id="sobre" className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                Sobre Nosso Estúdio
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Um estúdio de Pilates diferente de tudo que você já experienciou. 
                                Lugar de encontros transformadores e autocuidado.
                            </p>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <Heart className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Cuidado Personalizado</h3>
                                <p className="text-gray-600">
                                    Cada aluno recebe atenção individualizada com exercícios adaptados às suas necessidades específicas.
                                </p>
                            </div>
                            
                            <div className="text-center">
                                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <Award className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Instrutores Qualificados</h3>
                                <p className="text-gray-600">
                                    Nossa equipe é formada por profissionais certificados e com ampla experiência no método Pilates.
                                </p>
                            </div>
                            
                            <div className="text-center">
                                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <Users className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ambiente Acolhedor</h3>
                                <p className="text-gray-600">
                                    Espaço moderno e confortável, projetado para proporcionar bem-estar e tranquilidade.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Serviços Section */}
                <section id="servicos" className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                Nossos Serviços
                            </h2>
                            <p className="text-xl text-gray-600">
                                Oferecemos modalidades completas do método Pilates para todos os níveis
                            </p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Pilates Solo</h3>
                                <p className="text-gray-600 mb-4">
                                    Exercícios no solo utilizando o peso do próprio corpo, ideal para iniciantes.
                                </p>
                                <div className="text-blue-600 font-medium">A partir de R$ 80/aula</div>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Pilates Aparelhos</h3>
                                <p className="text-gray-600 mb-4">
                                    Aulas com equipamentos específicos para maior desafio e precisão nos movimentos.
                                </p>
                                <div className="text-blue-600 font-medium">A partir de R$ 120/aula</div>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Pilates Terapêutico</h3>
                                <p className="text-gray-600 mb-4">
                                    Focado na reabilitação e prevenção de lesões, com acompanhamento especializado.
                                </p>
                                <div className="text-blue-600 font-medium">A partir de R$ 150/aula</div>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Aulas Particulares</h3>
                                <p className="text-gray-600 mb-4">
                                    Atendimento individual com programa personalizado para seus objetivos.
                                </p>
                                <div className="text-blue-600 font-medium">A partir de R$ 200/aula</div>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Pilates para Gestantes</h3>
                                <p className="text-gray-600 mb-4">
                                    Exercícios seguros e adaptados para cada fase da gravidez.
                                </p>
                                <div className="text-blue-600 font-medium">A partir de R$ 100/aula</div>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Pilates Sênior</h3>
                                <p className="text-gray-600 mb-4">
                                    Programa especial para terceira idade, focado em mobilidade e equilíbrio.
                                </p>
                                <div className="text-blue-600 font-medium">A partir de R$ 90/aula</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Estrutura Section */}
                <section id="estrutura" className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                Nossa Estrutura
                            </h2>
                            <p className="text-xl text-gray-600">
                                Equipamentos modernos em um ambiente projetado para seu bem-estar
                            </p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Equipamentos Completos</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Reformer</h4>
                                            <p className="text-gray-600">Equipamento principal do Pilates com sistema de molas</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                        <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Cadillac</h4>
                                            <p className="text-gray-600">Aparelho versátil para exercícios avançados</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                        <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Chair</h4>
                                            <p className="text-gray-600">Equipamento compacto para fortalecimento</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                        <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Barrel</h4>
                                            <p className="text-gray-600">Ideal para alongamento e mobilidade da coluna</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-100 rounded-lg p-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Ambiente Moderno</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                                        <span className="text-gray-700">Salas climatizadas</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                                        <span className="text-gray-700">Iluminação natural</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                                        <span className="text-gray-700">Vestiários completos</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                                        <span className="text-gray-700">Área de relaxamento</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                                        <span className="text-gray-700">Estacionamento gratuito</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Depoimentos Section */}
                <section className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                O que nossos alunos dizem
                            </h2>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center mb-4">
                                    <div className="flex text-yellow-400">
                                        <Star className="h-5 w-5 fill-current" />
                                        <Star className="h-5 w-5 fill-current" />
                                        <Star className="h-5 w-5 fill-current" />
                                        <Star className="h-5 w-5 fill-current" />
                                        <Star className="h-5 w-5 fill-current" />
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    "Excelente estúdio! Os instrutores são muito atenciosos e o ambiente é super acolhedor. 
                                    Minha postura melhorou muito desde que comecei."
                                </p>
                                <div className="font-medium text-gray-900">Maria Silva</div>
                                <div className="text-sm text-gray-500">Aluna há 2 anos</div>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center mb-4">
                                    <div className="flex text-yellow-400">
                                        <Star className="h-5 w-5 fill-current" />
                                        <Star className="h-5 w-5 fill-current" />
                                        <Star className="h-5 w-5 fill-current" />
                                        <Star className="h-5 w-5 fill-current" />
                                        <Star className="h-5 w-5 fill-current" />
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    "Recomendo muito! Equipamentos modernos e profissionais qualificados. 
                                    O Pilates mudou minha qualidade de vida."
                                </p>
                                <div className="font-medium text-gray-900">João Santos</div>
                                <div className="text-sm text-gray-500">Aluno há 1 ano</div>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center mb-4">
                                    <div className="flex text-yellow-400">
                                        <Star className="h-5 w-5 fill-current" />
                                        <Star className="h-5 w-5 fill-current" />
                                        <Star className="h-5 w-5 fill-current" />
                                        <Star className="h-5 w-5 fill-current" />
                                        <Star className="h-5 w-5 fill-current" />
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    "Melhor estúdio da região! Atendimento personalizado e resultados incríveis. 
                                    Não troco por nada!"
                                </p>
                                <div className="font-medium text-gray-900">Ana Costa</div>
                                <div className="text-sm text-gray-500">Aluna há 3 anos</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contato Section */}
                <section id="contato" className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                Entre em Contato
                            </h2>
                            <p className="text-xl text-gray-600">
                                Agende sua aula experimental e comece sua transformação hoje mesmo
                            </p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-12">
                            <div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Informações de Contato</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <Phone className="h-6 w-6 text-blue-600 mr-3" />
                                        <div>
                                            <div className="font-medium text-gray-900">(11) 99999-9999</div>
                                            <div className="text-gray-600">WhatsApp disponível</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <Mail className="h-6 w-6 text-blue-600 mr-3" />
                                        <div>
                                            <div className="font-medium text-gray-900">contato@studiopilates.com</div>
                                            <div className="text-gray-600">Respondemos em até 24h</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <MapPin className="h-6 w-6 text-blue-600 mr-3" />
                                        <div>
                                            <div className="font-medium text-gray-900">Rua das Flores, 123</div>
                                            <div className="text-gray-600">Bairro Jardim - São Paulo/SP</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <Clock className="h-6 w-6 text-blue-600 mr-3" />
                                        <div>
                                            <div className="font-medium text-gray-900">Horário de Funcionamento</div>
                                            <div className="text-gray-600">
                                                Seg à Sex: 6h às 22h<br />
                                                Sáb: 8h às 18h<br />
                                                Dom: 8h às 14h
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-blue-600 rounded-lg p-8 text-white">
                                <h3 className="text-2xl font-semibold mb-6">Agende sua Aula Experimental</h3>
                                <p className="mb-6">
                                    Venha conhecer nosso estúdio e experimentar uma aula gratuita. 
                                    Sem compromisso, apenas o primeiro passo para sua transformação.
                                </p>
                                <div className="space-y-4">
                                    <div className="bg-blue-700 rounded-lg p-4">
                                        <div className="font-semibold text-lg">Oferta Especial</div>
                                        <div className="text-blue-100">Primeira aula gratuita + 20% de desconto no primeiro mês</div>
                                    </div>
                                    <a
                                        href="https://wa.me/5511999999999"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center w-full px-6 py-3 border border-white text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        Agendar pelo WhatsApp
                                        <ChevronRight className="ml-2 h-5 w-5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-8">
                            <div>
                                <h3 className="text-xl font-bold mb-4">Studio Pilates</h3>
                                <p className="text-gray-400">
                                    Transformando vidas através do método Pilates com qualidade, 
                                    profissionalismo e dedicação.
                                </p>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold mb-4">Serviços</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li>Pilates Solo</li>
                                    <li>Pilates Aparelhos</li>
                                    <li>Pilates Terapêutico</li>
                                    <li>Aulas Particulares</li>
                                </ul>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold mb-4">Contato</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li>(11) 99999-9999</li>
                                    <li>contato@studiopilates.com</li>
                                    <li>Rua das Flores, 123</li>
                                    <li>São Paulo/SP</li>
                                </ul>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold mb-4">Horários</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li>Seg à Sex: 6h às 22h</li>
                                    <li>Sáb: 8h às 18h</li>
                                    <li>Dom: 8h às 14h</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                            <p>&copy; 2024 Studio Pilates. Todos os direitos reservados.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
