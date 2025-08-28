import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 transition-all duration-500">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-800 dark:via-blue-900 dark:to-indigo-900 text-white py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2760%27%20height%3D%2760%27%20viewBox%3D%270%200%2060%2060%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cg%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27%3E%3Cg%20fill%3D%27%23ffffff%27%20fill-opacity%3D%270.05%27%3E%3Ccircle%20cx%3D%2730%27%20cy%3D%2730%27%20r%3D%272%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-blue-100 text-sm font-medium mb-6 border border-white/20">
              ✨ Sua farmácia de confiança há mais de 15 anos
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent leading-tight">
              Farmácia Vanaci
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Cuidando da sua saúde com excelência, oferecendo medicamentos de qualidade e atendimento personalizado para toda a família
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/products">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-4 bg-white text-blue-700 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                  🛒 Explorar Produtos
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
                💬 Falar com Farmacêutico
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-y border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl p-6 mb-4 group-hover:scale-105 transition-transform duration-300">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">15+</div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">Anos de Experiência</div>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl p-6 mb-4 group-hover:scale-105 transition-transform duration-300">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">10k+</div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">Clientes Satisfeitos</div>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 rounded-2xl p-6 mb-4 group-hover:scale-105 transition-transform duration-300">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-2">500+</div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">Produtos Disponíveis</div>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-2xl p-6 mb-4 group-hover:scale-105 transition-transform duration-300">
                <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">24/7</div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">Suporte Online</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              ⭐ Nossos Diferenciais
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-6">
              Por que Escolher a Farmácia Vanaci?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Comprometidos em oferecer excelência em saúde com atendimento humanizado e produtos de qualidade superior
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">💊</span>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Produtos de Qualidade Premium
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Medicamentos rigorosamente selecionados de laboratórios certificados, garantindo eficácia e segurança para sua saúde
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">👨‍⚕️</span>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Consultoria Farmacêutica Especializada
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Farmacêuticos experientes e qualificados prontos para orientar sobre medicamentos e cuidados com a saúde
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🚀</span>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Atendimento Ágil e Conveniente
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Horários estendidos, chat online 24/7 e atendimento personalizado para sua comodidade e bem-estar
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-700 dark:text-green-300 text-sm font-medium mb-6">
              🏆 Mais Procurados
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-blue-800 dark:from-white dark:via-green-200 dark:to-blue-200 bg-clip-text text-transparent mb-6">
              Produtos em Destaque
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Seleção especial dos medicamentos mais procurados pelos nossos clientes
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-900/20 overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/20 to-pink-500/20 rounded-full blur-xl"></div>
              <CardHeader className="relative">
                <div className="flex justify-between items-start mb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Paracetamol 500mg</CardTitle>
                  <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg">🔥 Mais Vendido</Badge>
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-300 mb-6">
                  Analgésico e antitérmico de ação rápida
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">€ 4,50</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">por unidade</p>
                  </div>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg group-hover:scale-105 transition-transform duration-300">
                    🛒 Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-0 bg-gradient-to-br from-white to-green-50/50 dark:from-gray-800 dark:to-green-900/20 overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-xl"></div>
              <CardHeader className="relative">
                <div className="flex justify-between items-start mb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Vitamina C 1g</CardTitle>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">💰 Promoção</Badge>
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-300 mb-6">
                  Suplemento vitamínico para imunidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">€ 7,80</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">por frasco</p>
                  </div>
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg group-hover:scale-105 transition-transform duration-300">
                    🛒 Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-0 bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-900/20 overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-violet-500/20 rounded-full blur-xl"></div>
              <CardHeader className="relative">
                <div className="flex justify-between items-start mb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Dipirona 500mg</CardTitle>
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-lg">✅ Disponível</Badge>
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-300 mb-6">
                  Analgésico e antitérmico eficaz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">€ 3,40</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">por caixa</p>
                  </div>
                  <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-lg group-hover:scale-105 transition-transform duration-300">
                    🛒 Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg" className="px-10 py-4 text-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold">
                🔍 Explorar Todos os Produtos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              💬 Depoimentos
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                O Que Dizem Nossos
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Clientes
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Experiências reais de quem confia na qualidade e no atendimento da Farmácia Vanaci
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400 text-lg">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="animate-pulse" style={{animationDelay: `${i * 100}ms`}}>⭐</span>
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cliente há 5 anos • ⭐ VIP</p>
                </div>
              </div>
            </Card>
            
            <Card className="group p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400 text-lg">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="animate-pulse" style={{animationDelay: `${i * 100}ms`}}>⭐</span>
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cliente há 3 anos • 🚀 Delivery</p>
                </div>
              </div>
            </Card>
            
            <Card className="group p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400 text-lg">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="animate-pulse" style={{animationDelay: `${i * 100}ms`}}>⭐</span>
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cliente há 2 anos • 💬 Chat Ativo</p>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium shadow-lg">
              <span className="mr-2">⭐</span>
              4.9/5 baseado em 1,247+ avaliações
              <span className="ml-2">🎯</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 dark:from-blue-800 dark:via-indigo-900 dark:to-purple-900 text-white overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2780%27%20height%3D%2780%27%20viewBox%3D%270%200%2080%2080%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cg%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27%3E%3Cg%20fill%3D%27%23ffffff%27%20fill-opacity%3D%270.03%27%3E%3Cpath%20d%3D%27M0%200h80v80H0V0zm20%2020v40h40V20H20zm20%2035a15%2015%200%201%201%200-30%2015%2015%200%200%201%200%2030z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-blue-100 text-sm font-medium mb-8 border border-white/20">
            💬 Atendimento Personalizado
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
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
                <span className="mr-2">📞</span>
                Entre em Contato
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Button>
            </Link>
            
            <Button size="lg" className="px-10 py-4 text-lg border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold group">
              <span className="mr-2">💬</span>
              Iniciar Chat Online
              <span className="ml-2 group-hover:scale-110 transition-transform duration-300">✨</span>
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
               <div className="text-2xl mb-2">⏰</div>
               <div className="font-semibold text-white mb-1">Horário Estendido</div>
               <div className="text-blue-100 text-sm">Segunda a Sexta: 8h às 22h</div>
               <div className="text-blue-100 text-xs mt-1">📍 Lisboa, Portugal</div>
             </div>
             
             <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
               <div className="text-2xl mb-2">🚀</div>
               <div className="font-semibold text-white mb-1">Entrega Rápida</div>
               <div className="text-blue-100 text-sm">Delivery em até 2 horas</div>
               <div className="text-blue-100 text-xs mt-1">📞 +351 21 123 4567</div>
             </div>
             
             <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
               <div className="text-2xl mb-2">🎯</div>
               <div className="font-semibold text-white mb-1">Atendimento 24/7</div>
               <div className="text-blue-100 text-sm">Chat online sempre disponível</div>
               <div className="text-blue-100 text-xs mt-1">✉️ contato@farmaciavanaci.pt</div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
