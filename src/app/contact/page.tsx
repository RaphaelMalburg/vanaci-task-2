"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'Nome é obrigatório';
    if (!formData.lastName.trim()) newErrors.lastName = 'Sobrenome é obrigatório';
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    if (!formData.subject.trim()) newErrors.subject = 'Assunto é obrigatório';
    if (!formData.message.trim()) newErrors.message = 'Mensagem é obrigatória';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Entre em Contato
          </h1>
          <p className="text-xl text-gray-600">
            Estamos aqui para ajudar com todas as suas necessidades de saúde
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Badge variant="secondary" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Atendimento 24h
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Resposta em até 2h
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white transition-colors duration-300">
                  {isSubmitted ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      Mensagem Enviada!
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Envie-nos uma Mensagem
                    </>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  {isSubmitted 
                    ? "Obrigado pelo contato! Retornaremos em breve."
                    : "Preencha o formulário abaixo e entraremos em contato o mais breve possível"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4 transition-colors duration-300" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Mensagem enviada com sucesso!</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-300">Nossa equipe entrará em contato em até 2 horas úteis.</p>
                    <Button onClick={() => setIsSubmitted(false)} variant="outline">
                      Enviar Nova Mensagem
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                          Nome *
                        </label>
                        <Input 
                          id="firstName" 
                          placeholder="João" 
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className={`bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 transition-colors duration-300 ${errors.firstName ? 'border-red-500 dark:border-red-400' : ''}`}
                        />
                        {errors.firstName && (
                          <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1 transition-colors duration-300">
                            <AlertCircle className="w-3 h-3" />
                            {errors.firstName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                          Sobrenome *
                        </label>
                        <Input 
                          id="lastName" 
                          placeholder="Silva" 
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className={`bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 transition-colors duration-300 ${errors.lastName ? 'border-red-500 dark:border-red-400' : ''}`}
                        />
                        {errors.lastName && (
                          <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1 transition-colors duration-300">
                            <AlertCircle className="w-3 h-3" />
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                        Email *
                      </label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="joao.silva@email.com" 
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 transition-colors duration-300 ${errors.email ? 'border-red-500 dark:border-red-400' : ''}`}
                      />
                      {errors.email && (
                        <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1 transition-colors duration-300">
                          <AlertCircle className="w-3 h-3" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                        Telefone *
                      </label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="(11) 99999-9999" 
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 transition-colors duration-300 ${errors.phone ? 'border-red-500 dark:border-red-400' : ''}`}
                      />
                      {errors.phone && (
                        <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1 transition-colors duration-300">
                          <AlertCircle className="w-3 h-3" />
                          {errors.phone}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                        Assunto *
                      </label>
                      <Input 
                        id="subject" 
                        placeholder="Como podemos ajudar?" 
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        className={`bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 transition-colors duration-300 ${errors.subject ? 'border-red-500 dark:border-red-400' : ''}`}
                      />
                      {errors.subject && (
                        <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1 transition-colors duration-300">
                          <AlertCircle className="w-3 h-3" />
                          {errors.subject}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                        Mensagem *
                      </label>
                      <Textarea 
                        id="message" 
                        placeholder="Descreva sua dúvida ou como podemos ajudá-lo..."
                        rows={4}
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        className={`bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 transition-colors duration-300 ${errors.message ? 'border-red-500 dark:border-red-400' : ''}`}
                      />
                      {errors.message && (
                        <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1 transition-colors duration-300">
                          <AlertCircle className="w-3 h-3" />
                          {errors.message}
                        </p>
                      )}
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white transition-colors duration-300">
                  <MapPin className="w-5 h-5" />
                  Visite Nossa Loja
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
                      <MapPin className="w-4 h-4" />
                      Endereço
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                      Rua da Saúde, 123<br />
                      Centro Histórico<br />
                      1200-109 Lisboa, Portugal
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
                      <Phone className="w-4 h-4" />
                      Telefone
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">+351 21 123 4567</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
                      <Mail className="w-4 h-4" />
                      Email
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">contato@farmaciavanaci.pt</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white transition-colors duration-300">
                  <Clock className="w-5 h-5" />
                  Horário de Funcionamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Segunda - Sexta</span>
                    <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">8:00 - 21:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Sábado</span>
                    <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">9:00 - 19:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Domingo</span>
                    <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">10:00 - 18:00</span>
                  </div>
                  <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded transition-colors duration-300">
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium transition-colors duration-300">🚚 Delivery disponível todos os dias</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white transition-colors duration-300">
                  <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
                  Atendimento de Emergência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-3 transition-colors duration-300">
                  Para emergências fora do horário comercial:
                </p>
                <div className="space-y-2">
                  <p className="font-medium text-red-600 dark:text-red-400 transition-colors duration-300">📞 Linha de Emergência: +351 21 808 2424</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    Disponível 24/7 para necessidades urgentes de medicamentos
                  </p>
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded transition-colors duration-300">
                    <p className="text-sm text-blue-700 dark:text-blue-300 transition-colors duration-300">💊 Plantão farmacêutico aos finais de semana</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mapa Simples */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white transition-colors duration-300">Localização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center transition-colors duration-300">
                  <MapPin className="w-12 h-12 text-blue-500 dark:text-blue-400 mx-auto mb-4 transition-colors duration-300" />
                  <p className="text-gray-600 dark:text-gray-300 mb-2 transition-colors duration-300">Farmácia Lusitana</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Rua da Saúde, 123 - Centro Histórico</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
                      Ver no Google Maps
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}