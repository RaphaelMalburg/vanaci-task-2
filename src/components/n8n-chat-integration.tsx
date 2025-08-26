'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Bot, User } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface N8nChatResponse {
  response?: string;
  text?: string;
  sessionId: string;
  timestamp: string;
  status: string;
}

interface N8nChatIntegrationProps {
  n8nWebhookUrl?: string;
  className?: string;
}

export function N8nChatIntegration({ 
  n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://primary-production-8189a.up.railway.app/webhook/farmacia-chat',
  className = ''
}: N8nChatIntegrationProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou o assistente da Farmácia Vanaci. Como posso ajudá-lo hoje? Posso ajudar você a encontrar medicamentos, gerenciar seu carrinho ou finalizar compras.',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate session ID on component mount
  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    // DEBUG: Log webhook URL and session info
    console.log('🔧 [CHAT DEBUG] Webhook URL:', n8nWebhookUrl);
    console.log('🔧 [CHAT DEBUG] Session ID:', sessionId);
    console.log('🔧 [CHAT DEBUG] User message:', userMessage.content);

    try {
      // Prepare chat history for n8n (last 10 messages)
      const chatHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const requestPayload = {
        message: userMessage.content,
        sessionId: sessionId,
        chatHistory: chatHistory
      };

      // DEBUG: Log request payload
      console.log('🔧 [CHAT DEBUG] Request payload:', JSON.stringify(requestPayload, null, 2));

      // Send to n8n webhook
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      // DEBUG: Log response status
      console.log('🔧 [CHAT DEBUG] Response status:', response.status);
      console.log('🔧 [CHAT DEBUG] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔧 [CHAT DEBUG] Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const responseText = await response.text();
      console.log('🔧 [CHAT DEBUG] Raw response:', responseText);

      let data: N8nChatResponse;
      try {
        data = JSON.parse(responseText);
        console.log('🔧 [CHAT DEBUG] Parsed response:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('🔧 [CHAT DEBUG] JSON parse error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      // Update session ID if provided
      if (data.sessionId && data.sessionId !== sessionId) {
        console.log('🔧 [CHAT DEBUG] Updating session ID from', sessionId, 'to', data.sessionId);
        setSessionId(data.sessionId);
      }

      // Add assistant response to chat
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.text || data.response || 'Resposta não disponível',
        timestamp: data.timestamp || new Date().toISOString()
      };

      console.log('🔧 [CHAT DEBUG] Assistant message:', assistantMessage);
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('🔧 [CHAT DEBUG] Full error details:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        webhookUrl: n8nWebhookUrl,
        sessionId: sessionId
      });
      
      setError(`Erro ao enviar mensagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente. Verifique o console do navegador para mais detalhes.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Chat limpo! Como posso ajudá-lo?',
        timestamp: new Date().toISOString()
      }
    ]);
    // Generate new session ID
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    setError(null);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto h-[600px] flex flex-col ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          Assistente Farmácia Vanaci (n8n)
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            Sessão: {sessionId.slice(-8)}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearChat}
            disabled={isLoading}
          >
            Limpar
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        {/* Messages Area */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                
                <div className={`flex-1 max-w-[80%] ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}>
                  <div className={`inline-block p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="inline-block p-3 rounded-lg bg-gray-100">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-gray-600">Processando...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem... (Ex: 'Preciso de dipirona' ou 'Adicione ao carrinho')"
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !inputMessage.trim()}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Connection Status */}
        <div className="text-xs text-gray-500 text-center">
          Conectado ao n8n: {n8nWebhookUrl}
        </div>
      </CardContent>
    </Card>
  );
}

// Example usage component
export function N8nChatExample() {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Chat com Assistente n8n</h1>
        <p className="text-gray-600">
          Este chat se conecta diretamente ao workflow n8n avançado da Farmácia Vanaci.
          Experimente comandos como:
        </p>
        <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
          <li>&quot;Busque por dipirona&quot;</li>
          <li>&quot;Adicione 2 unidades de paracetamol ao carrinho&quot;</li>
          <li>&quot;Mostre meu carrinho&quot;</li>
          <li>&quot;Finalizar compra&quot;</li>
        </ul>
      </div>
      
      <N8nChatIntegration />
    </div>
  );
}