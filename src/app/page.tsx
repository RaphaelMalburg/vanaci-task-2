"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";

export default function Home() {
  const { user } = useAuth();
  const { addItem } = useCartStore();

  const handleAddToCart = (product: { id: string; name: string; price: number; category: string }) => {
    if (!user) {
      toast.error('Você precisa estar logado para adicionar produtos ao carrinho');
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category
    });

    toast.success(`${product.name} adicionado ao carrinho!`);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 transition-all duration-500">
      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
                Sua farmácia de confiança há mais de 15 anos
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
                Farmácia Vanaci
                <br />
                <span className="text-3xl md:text-5xl text-blue-600 dark:text-blue-400">
                  Cuidando da Sua Saúde
                </span>
              </h1>
              
              <p className="text-lg md:text-xl mb-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Medicamentos de qualidade, atendimento especializado e a confiança que você merece. 
                Sua saúde é nossa prioridade há mais de 15 anos.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <Link href="/products">
                  <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 text-lg px-8 py-3 font-medium transition-colors duration-200">
                    Explorar Produtos
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-lg px-8 py-3 font-medium transition-colors duration-200">
                  Falar com Farmacêutico
                </Button>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Image
                src="/hero.png"
                alt="Farmácia Vanaci - Cuidando da sua saúde"
                width={600}
                height={450}
                className="w-full max-w-lg h-auto rounded-lg shadow-lg"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 mb-4 transition-colors duration-300">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">15+</div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">Anos de Experiência</div>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 mb-4 transition-colors duration-300">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">10k+</div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">Clientes Satisfeitos</div>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 mb-4 transition-colors duration-300">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">500+</div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">Produtos Disponíveis</div>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 mb-4 transition-colors duration-300">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">24/7</div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">Suporte Online</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 glass-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="glass-card inline-flex items-center px-6 py-3 text-primary text-sm font-medium mb-6">
              Nossos Diferenciais
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Por que Escolher a Farmácia Vanaci?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Comprometidos em oferecer excelência em saúde com atendimento humanizado e produtos de qualidade superior
            </p>
          </div>
          
          <BentoGrid className="max-w-4xl mx-auto">
            <BentoGridItem
              title="Produtos de Qualidade Premium"
              description="Medicamentos rigorosamente selecionados de laboratórios certificados, garantindo eficácia e segurança para sua saúde"
              header={
                <div className="w-16 h-16 mx-auto mb-6 bg-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              }
              className="md:col-span-2"
            />
            <BentoGridItem
              title="Consultoria Farmacêutica"
              description="Farmacêuticos experientes e qualificados prontos para orientar sobre medicamentos e cuidados com a saúde"
              header={
                <div className="w-16 h-16 mx-auto mb-6 bg-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                </div>
              }
              className="md:col-span-1"
            />
            <BentoGridItem
              title="Atendimento Ágil"
              description="Horários estendidos, chat online 24/7 e atendimento personalizado para sua comodidade e bem-estar"
              header={
                <div className="w-16 h-16 mx-auto mb-6 bg-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
              }
              className="md:col-span-1"
            />
          </BentoGrid>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-700 dark:text-green-300 text-sm font-medium mb-6">
                Mais Procurados
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Produtos em Destaque
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto lg:mx-0 leading-relaxed">
                Seleção especial dos medicamentos mais procurados pelos nossos clientes
              </p>
            </div>
            <div className="relative">
              <Image
                src="/pharmacy-team.svg"
                alt="Equipe farmacêutica especializada"
                width={600}
                height={400}
                className="w-full h-auto rounded-2xl shadow-lg"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-900/20 overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/20 to-pink-500/20 rounded-full blur-xl"></div>
              <CardHeader className="relative">
                <div className="flex justify-between items-start mb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Paracetamol 500mg</CardTitle>
                  <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg">Mais Vendido</Badge>
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-300 mb-6">
                  Analgésico e antitérmico de ação rápida
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-3xl font-bold text-green-600 dark:text-green-400">€ 4,50</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">por unidade</p>
                  </div>
                  <Button 
                    onClick={() => handleAddToCart({ id: 'paracetamol-500mg', name: 'Paracetamol 500mg', price: 4.50, category: 'Analgésicos' })}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-colors duration-300"
                  >
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-0 bg-gradient-to-br from-white to-green-50/50 dark:from-gray-800 dark:to-green-900/20 overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-xl"></div>
              <CardHeader className="relative">
                <div className="flex justify-between items-start mb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Vitamina C 1g</CardTitle>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">Promoção</Badge>
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-300 mb-6">
                  Suplemento vitamínico para imunidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-3xl font-bold text-green-600 dark:text-green-400">€ 7,80</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">por frasco</p>
                  </div>
                  <Button 
                    onClick={() => handleAddToCart({ id: 'vitamina-c-1g', name: 'Vitamina C 1g', price: 7.80, category: 'Vitaminas' })}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-colors duration-300"
                  >
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-0 bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-900/20 overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-violet-500/20 rounded-full blur-xl"></div>
              <CardHeader className="relative">
                <div className="flex justify-between items-start mb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Dipirona 500mg</CardTitle>
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-lg">Disponível</Badge>
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-300 mb-6">
                  Analgésico e antitérmico eficaz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-3xl font-bold text-green-600 dark:text-green-400">€ 3,40</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">por caixa</p>
                  </div>
                  <Button 
                    onClick={() => handleAddToCart({ id: 'dipirona-500mg', name: 'Dipirona 500mg', price: 3.40, category: 'Analgésicos' })}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-colors duration-300"
                  >
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg" className="px-10 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xl transition-all duration-300 font-semibold">
                Explorar Todos os Produtos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
                Depoimentos
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                O Que Dizem Nossos
                <br />
                <span className="text-blue-600 dark:text-blue-400">
                  Clientes
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto lg:mx-0 leading-relaxed">
                Experiências reais de quem confia na qualidade e no atendimento da Farmácia Vanaci
              </p>
            </div>
            <div className="relative">
              <Image
                src="/quality-assurance.svg"
                alt="Garantia de qualidade e confiança"
                width={600}
                height={400}
                className="w-full h-auto rounded-2xl shadow-lg"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400 text-lg">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="animate-pulse" style={{animationDelay: `${i * 100}ms`}}>★</span>
                  ))}
                </div>
                <span className="ml-3 text-sm font-medium text-gray-500 dark:text-gray-400">5.0</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed italic">
                &quot;Excelente atendimento e produtos de qualidade excepcional. A equipa é muito atenciosa e sempre me ajuda a encontrar o que preciso. Recomendo!&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                  MR
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-lg">Maria Rosa</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cliente há 5 anos • VIP</p>
                </div>
              </div>
            </Card>
            
            <Card className="group p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400 text-lg">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="animate-pulse" style={{animationDelay: `${i * 100}ms`}}>★</span>
                  ))}
                </div>
                <span className="ml-3 text-sm font-medium text-gray-500 dark:text-gray-400">5.0</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed italic">
                &quot;Preços justos e entrega rápida. Recomendo a todos que procuram uma farmácia de confiança e com bom atendimento. Serviço impecável!&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                  JS
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-lg">João Silva</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cliente há 3 anos • Delivery</p>
                </div>
              </div>
            </Card>
            
            <Card className="group p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400 text-lg">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="animate-pulse" style={{animationDelay: `${i * 100}ms`}}>★</span>
                  ))}
                </div>
                <span className="ml-3 text-sm font-medium text-gray-500 dark:text-gray-400">5.0</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed italic">
                &quot;O chat online é fantástico! Consigo esclarecer dúvidas rapidamente e receber orientações profissionais a qualquer hora. Excelente!&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                  AS
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-lg">Ana Santos</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cliente há 2 anos • Chat Ativo</p>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium shadow-lg">
              4.9/5 baseado em 1,247+ avaliações
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-blue-600 dark:bg-blue-800 text-white">
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-blue-100 text-sm font-medium mb-8 border border-white/20">
            Atendimento Personalizado
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
            Precisa de Ajuda?
            <br />Estamos Aqui!
          </h2>
          
          <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Nossa equipe de farmacêuticos especializados está pronta para atendê-lo. 
            <br className="hidden md:block" />Use nosso chat online 24/7 ou visite nossa farmácia.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/contact">
              <Button size="lg" className="px-10 py-4 text-lg bg-white text-blue-700 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold group">
                Entre em Contato
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Button>
            </Link>
            
            <Button size="lg" className="px-10 py-4 text-lg border-2 border-white bg-transparent text-white hover:bg-white hover:text-blue-600 shadow-xl transition-all duration-300 font-semibold">
              Iniciar Chat Online
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
               <div className="font-semibold text-white mb-1">Horário Estendido</div>
               <div className="text-blue-100 text-sm">Segunda a Sexta: 8h às 22h</div>
               <div className="text-blue-100 text-xs mt-1">Lisboa, Portugal</div>
             </div>
             
             <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
               <div className="font-semibold text-white mb-1">Entrega Rápida</div>
               <div className="text-blue-100 text-sm">Delivery em até 2 horas</div>
               <div className="text-blue-100 text-xs mt-1">+351 21 123 4567</div>
             </div>
             
             <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
               <div className="font-semibold text-white mb-1">Atendimento 24/7</div>
               <div className="text-blue-100 text-sm">Chat online sempre disponível</div>
               <div className="text-blue-100 text-xs mt-1">contato@farmaciavanaci.pt</div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
