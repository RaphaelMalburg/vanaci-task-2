import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 text-white py-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to My Pharmacy
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Your trusted healthcare partner providing quality medicines and professional care
            </p>
            <Link href="/products">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                View Our Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 slide-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">15+</div>
              <div className="text-gray-600">Anos de Experiência</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">10k+</div>
              <div className="text-gray-600">Clientes Satisfeitos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Produtos Disponíveis</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Suporte Online</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Por que Escolher Nossa Farmácia?
            </h2>
            <p className="text-lg text-gray-600">
              Estamos comprometidos em fornecer serviços de saúde excepcionais para nossa comunidade
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-blue-600 flex items-center gap-2">
                  💊 Produtos de Qualidade
                </CardTitle>
                <CardDescription>
                  Estocamos apenas medicamentos da mais alta qualidade de fabricantes confiáveis
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-blue-600 flex items-center gap-2">
                  👨‍⚕️ Consultoria Especializada
                </CardTitle>
                <CardDescription>
                  Nossos farmacêuticos qualificados estão sempre prontos para fornecer orientação profissional
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-blue-600 flex items-center gap-2">
                  🚀 Serviço Conveniente
                </CardTitle>
                <CardDescription>
                  Atendimento rápido e confiável com horários convenientes para melhor atendê-lo
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Produtos em Destaque
            </h2>
            <p className="text-lg text-gray-600">
              Confira alguns dos nossos produtos mais procurados
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Paracetamol 500mg</CardTitle>
                  <Badge variant="secondary">Mais Vendido</Badge>
                </div>
                <CardDescription>Analgésico e antitérmico</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-600">R$ 8,90</span>
                  <Button size="sm">Ver Detalhes</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Vitamina C 1g</CardTitle>
                  <Badge variant="outline">Promoção</Badge>
                </div>
                <CardDescription>Suplemento vitamínico</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-600">R$ 15,50</span>
                  <Button size="sm">Ver Detalhes</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Dipirona 500mg</CardTitle>
                  <Badge variant="secondary">Disponível</Badge>
                </div>
                <CardDescription>Analgésico e antitérmico</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-600">R$ 6,75</span>
                  <Button size="sm">Ver Detalhes</Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-8">
            <Link href="/products">
              <Button size="lg" className="px-8">
                Ver Todos os Produtos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              O que Nossos Clientes Dizem
            </h2>
            <p className="text-lg text-gray-600">
              Depoimentos reais de clientes satisfeitos
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">MR</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">Maria Rosa</CardTitle>
                    <CardDescription>Cliente há 5 anos</CardDescription>
                  </div>
                </div>
                <CardDescription className="text-gray-700 italic">
                  &quot;Excelente atendimento e produtos de qualidade. A equipe é muito atenciosa e sempre me ajuda a encontrar o que preciso.&quot;
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">JS</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">João Silva</CardTitle>
                    <CardDescription>Cliente há 3 anos</CardDescription>
                  </div>
                </div>
                <CardDescription className="text-gray-700 italic">
                  &quot;Preços justos e entrega rápida. Recomendo para todos que buscam uma farmácia confiável e com bom atendimento.&quot;
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">AS</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">Ana Santos</CardTitle>
                    <CardDescription>Cliente há 2 anos</CardDescription>
                  </div>
                </div>
                <CardDescription className="text-gray-700 italic">
                  &quot;O chat online é muito útil! Consigo tirar dúvidas rapidamente e receber orientações profissionais a qualquer hora.&quot;
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 text-white transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Precisa de Ajuda? Fale Conosco!
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Nossa equipe está pronta para atendê-lo. Use nosso chat online ou visite nossa loja.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="px-8">
                Entre em Contato
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 text-white border-white hover:bg-white hover:text-blue-600">
              💬 Iniciar Chat
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
