import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbsContainer } from "@/components/breadcrumbs";
import { Calendar, Users, Heart, Shield, Award } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 py-12">
      <BreadcrumbsContainer />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 fade-in">
        {/* Header */}
        <div className="text-center mb-12 slide-up">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            Sobre a Farmácia Vanaci
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300">
            Servindo nossa comunidade com dedicação e cuidado desde 1995
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Badge variant="secondary" className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 transition-colors duration-300">
              <Calendar className="w-4 h-4" />
              29 anos de experiência
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 transition-colors duration-300">
              <Users className="w-4 h-4" />
              +10.000 clientes atendidos
            </Badge>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-12 slide-up">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8 transition-colors duration-300">Nossa História</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200"></div>
            <div className="space-y-8">
              {[
                { year: "1995", title: "Fundação", description: "Abertura da primeira unidade no centro da cidade" },
                { year: "2005", title: "Expansão", description: "Inauguração da segunda filial e modernização dos sistemas" },
                { year: "2015", title: "Digitalização", description: "Implementação do sistema online e delivery" },
                { year: "2024", title: "Inovação", description: "Lançamento da plataforma digital integrada" }
              ].map((item, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                    <Card className="shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{item.year}</Badge>
                        </div>
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-white"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="mb-12 scale-in">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8 transition-colors duration-300">Nossos Valores</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Cuidado</h3>
                <p className="text-gray-600">Tratamos cada cliente como família, oferecendo atenção personalizada e cuidado genuíno.</p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Confiança</h3>
                <p className="text-gray-600">Construímos relacionamentos duradouros baseados na transparência e qualidade dos nossos serviços.</p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Excelência</h3>
                <p className="text-gray-600">Buscamos constantemente a melhoria dos nossos processos e a satisfação total dos clientes.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white transition-colors duration-300">Nossa História</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed transition-colors duration-300">
                A Farmácia Vanaci foi fundada em 1995 com uma missão simples: fornecer à nossa comunidade 
                acesso a produtos de saúde de qualidade e serviços farmacêuticos profissionais. 
                O que começou como uma pequena farmácia de bairro cresceu e se tornou um parceiro de saúde 
                confiável para milhares de famílias em nossa região.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white transition-colors duration-300">Nossa Missão</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed transition-colors duration-300">
                Estamos comprometidos em melhorar a saúde e o bem-estar de nossa comunidade, 
                fornecendo cuidados farmacêuticos personalizados, produtos de qualidade e conselhos especializados. 
                Nossa equipe de farmacêuticos licenciados e profissionais de saúde trabalha em conjunto para 
                garantir que cada cliente receba a atenção e o cuidado que merece.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white transition-colors duration-300">Nossos Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Serviços de Prescrição</h4>
                  <ul className="text-gray-700 dark:text-gray-300 space-y-1 transition-colors duration-300">
                    <li>• Aviamento e renovação de receitas</li>
                    <li>• Gestão de terapia medicamentosa</li>
                    <li>• Verificação de interações medicamentosas</li>
                    <li>• Processamento de seguros</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Saúde & Bem-estar</h4>
                  <ul className="text-gray-700 dark:text-gray-300 space-y-1 transition-colors duration-300">
                    <li>• Medicamentos sem receita</li>
                    <li>• Vitaminas e suplementos</li>
                    <li>• Exames de saúde</li>
                    <li>• Serviços de vacinação</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipe */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8 transition-colors duration-300">Nossa Equipe</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <CardContent className="p-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white transition-colors duration-300">Dr. Maria Vanaci</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium mb-2 transition-colors duration-300">Farmacêutica Responsável</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">CRF 12345 - 25 anos de experiência em farmácia clínica e atenção farmacêutica.</p>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <CardContent className="p-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white transition-colors duration-300">João Silva</h3>
                  <p className="text-green-600 dark:text-green-400 font-medium mb-2 transition-colors duration-300">Farmacêutico Clínico</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">CRF 67890 - Especialista em medicamentos e orientação farmacêutica personalizada.</p>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <CardContent className="p-6">
                  <div className="w-20 h-20 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white transition-colors duration-300">Ana Costa</h3>
                  <p className="text-purple-600 dark:text-purple-400 font-medium mb-2 transition-colors duration-300">Técnica em Farmácia</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">Especialista em atendimento ao cliente e gestão de estoque farmacêutico.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 text-center transition-colors duration-300">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              Visite-nos Hoje
            </h3>
            <div className="text-gray-700 dark:text-gray-300 transition-colors duration-300">
              <p className="mb-2">📍 Rua da Saúde, 123 - Centro Histórico, Lisboa</p>
              <p className="mb-2">📞 Telefone: +351 21 123 4567</p>
              <p className="mb-2">⏰ Horário: Segunda a Sábado 8:00 - 21:00</p>
              <p>🚚 Entrega disponível em toda a região</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}