"use client";

import { useState, useRef, useEffect, createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Bot, User, X } from "lucide-react";

// Context para controlar o estado do chat
const ChatContext = createContext<{
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}>({ isChatOpen: false, setIsChatOpen: () => {} });

export const useChatContext = () => useContext(ChatContext);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return <ChatContext.Provider value={{ isChatOpen, setIsChatOpen }}>{children}</ChatContext.Provider>;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export function Chat() {
  const { isChatOpen, setIsChatOpen } = useChatContext();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Olá! Sou seu assistente virtual da farmácia. Como posso ajudá-lo hoje?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [n8nStatus, setN8nStatus] = useState<"checking" | "online" | "offline">("checking");


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log("[Chat Debug] Mensagens atualizadas, total:", messages.length);
    console.log("[Chat Debug] Conteúdo das mensagens:", messages);
    scrollToBottom();
  }, [messages]);

  // Check n8n status
  const checkN8nStatus = async () => {
    console.log("[Chat Debug] Verificando status do n8n...");
    try {
      // Usar URL alternativo para o webhook do n8n
      const webhookUrl = "https://primary-production-8189a.up.railway.app/webhook/farmacia-chat";
      console.log("[Chat Debug] Usando URL alternativo para o webhook:", webhookUrl);
      console.log("[Chat Debug] Usando webhook URL para verificação:", webhookUrl);

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "ping", sessionId: "status-check", chatHistory: [] }),
        signal: AbortSignal.timeout(5000),
      });

      console.log("[Chat Debug] Resposta da verificação de status:", response.status, response.statusText);

      const newStatus = response.ok ? "online" : "offline";
      console.log("[Chat Debug] Status do n8n definido como:", newStatus);
      setN8nStatus(newStatus);

      // Tentar ler o corpo da resposta para debug
      try {
        const responseText = await response.text();
        console.log("[Chat Debug] Corpo da resposta de verificação:", responseText);
      } catch (textError) {
        console.log("[Chat Debug] Não foi possível ler o corpo da resposta:", textError);
      }
    } catch (error) {
      console.log("[Chat Debug] Erro ao verificar status do n8n:", error);
      setN8nStatus("offline");
    }
  };

  // Generate session ID and check n8n status on component mount
  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log("[Chat Debug] Componente montado, novo sessionId gerado:", newSessionId);
    setSessionId(newSessionId);

    // Verificar se o n8n está online
    console.log("[Chat Debug] Iniciando verificação do status do n8n...");
    checkN8nStatus();

    // Verificar o webhook URL configurado
    const webhookUrl = "https://primary-production-8189a.up.railway.app/webhook/farmacia-chat";
    console.log("[Chat Debug] Webhook URL configurado:", webhookUrl);

    // Adicionar mensagem de debug inicial
    console.log("[Chat Debug] Estado inicial das mensagens:", messages);
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    console.log("[Chat Debug] Iniciando envio de mensagem:", inputValue);
    console.log("[Chat Debug] Estado atual - isLoading:", isLoading, "n8nStatus:", n8nStatus);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    console.log("[Chat Debug] Mensagem do usuário criada:", userMessage);
    console.log("[Chat Debug] Mensagens atuais:", messages.length);

    setMessages((prev) => {
      console.log("[Chat Debug] Adicionando mensagem do usuário ao estado, total anterior:", prev.length);
      return [...prev, userMessage];
    });
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);
    console.log("[Chat Debug] Estado de carregamento definido como true");

    // Prepare chat history for n8n (last 10 messages)
    const chatHistory = messages.slice(-10).map((msg) => ({
      role: msg.isUser ? "user" : "assistant",
      content: msg.text,
    }));
    console.log("[Chat Debug] Histórico de chat preparado para n8n:", chatHistory);

    const webhookUrl = "https://primary-production-8189a.up.railway.app/webhook/farmacia-chat";
    console.log("[Chat Debug] Usando webhook URL:", webhookUrl);
    console.log("[Chat Debug] SessionId atual:", sessionId);

    try {
      console.log("[Chat Debug] Enviando requisição para n8n com sessionId:", sessionId);
      console.log(
        "[Chat Debug] Payload enviado:",
        JSON.stringify({
          message: currentInput,
          sessionId: sessionId,
          chatHistory: chatHistory,
        })
      );

      // Verificar se o n8n está online antes de enviar a requisição
      if (n8nStatus === "offline") {
        console.log("[Chat Debug] N8n está offline, tentando reconectar...");
        await checkN8nStatus();
        if (n8nStatus === "offline") {
          throw new Error("N8n está offline. Verifique se o serviço está rodando.");
        }
      }

      // Enviar mensagem para o n8n
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          sessionId: sessionId,
          chatHistory: chatHistory,
        }),
        signal: AbortSignal.timeout(10000), // 10 seconds timeout for initial request
      });

      console.log("[Chat Debug] Resposta inicial do n8n, status:", response.status);

      if (response.ok) {
        console.log("[Chat Debug] Mensagem enviada para n8n com sucesso, iniciando polling...");
        
        // Adicionar mensagem de "digitando" temporária
        const typingMessage: Message = {
          id: "typing-" + Date.now(),
          text: "💭 Processando sua mensagem...",
          isUser: false,
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, typingMessage]);
        
        // Iniciar polling para buscar a resposta
        const pollForResponse = async (attempts = 0, maxAttempts = 30) => {
          if (attempts >= maxAttempts) {
            console.log("[Chat Debug] Timeout no polling, máximo de tentativas atingido");
            setMessages((prev) => 
              prev.map((msg) => 
                msg.id === typingMessage.id 
                  ? { ...msg, text: "⏱️ Timeout: O assistente está demorando para responder. Tente novamente." }
                  : msg
              )
            );
            setIsLoading(false);
            return;
          }
          
          try {
            console.log(`[Chat Debug] Polling tentativa ${attempts + 1}/${maxAttempts}`);
            const pollResponse = await fetch(`/api/chat-response?sessionId=${sessionId}`);
            
            if (pollResponse.ok) {
              const pollData = await pollResponse.json();
              console.log("[Chat Debug] Resposta do polling:", pollData);
              
              if (pollData.success && pollData.text) {
                console.log("[Chat Debug] Resposta encontrada via polling:", pollData.text);
                
                // Substituir mensagem de "digitando" pela resposta real
                setMessages((prev) => 
                  prev.map((msg) => 
                    msg.id === typingMessage.id 
                      ? {
                          ...msg,
                          id: Date.now().toString(),
                          text: pollData.text,
                        }
                      : msg
                  )
                );
                setIsLoading(false);
                return;
              }
            }
            
            // Aguardar 1 segundo antes da próxima tentativa
            await new Promise(resolve => setTimeout(resolve, 1000));
            await pollForResponse(attempts + 1, maxAttempts);
            
          } catch (pollError) {
            console.error("[Chat Debug] Erro no polling:", pollError);
            await new Promise(resolve => setTimeout(resolve, 1000));
            await pollForResponse(attempts + 1, maxAttempts);
          }
        };
        
        // Iniciar o polling
        await pollForResponse();
        
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("[Chat Debug] Erro ao enviar mensagem para n8n:", error);
      setIsLoading(false);

      let errorText = "❌ Não foi possível enviar sua mensagem. Tente novamente.";

      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorText = "❌ Não foi possível conectar ao assistente. Verifique sua conexão.";
      } else if (error instanceof DOMException && error.name === "TimeoutError") {
        errorText = "⏱️ Timeout ao enviar mensagem. Tente novamente.";
      } else if (error instanceof Error && error.message.includes("HTTP")) {
        errorText = `❌ Erro do servidor: ${error.message}`;
      }

      const errorMessage: Message = {
        id: Date.now().toString(),
        text: errorText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Botão flutuante para abrir o chat */}
      <Button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg transition-all duration-300 ease-in-out z-50"
        size="icon">
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>

      {/* Painel lateral do chat */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] sm:w-[500px] bg-white dark:bg-gray-900 border-l dark:border-gray-700 shadow-xl transition-transform duration-300 ease-in-out z-40 flex flex-col ${
          isChatOpen ? "translate-x-0" : "translate-x-full"
        }`}>
        {/* Header */}
        <div className="border-b dark:border-gray-700 p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">Assistente Virtual da Farmácia</h2>
              {/* N8N Status Indicator */}
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${n8nStatus === "online" ? "bg-green-400" : n8nStatus === "offline" ? "bg-red-400" : "bg-yellow-400 animate-pulse"}`} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{n8nStatus === "online" ? "Online" : n8nStatus === "offline" ? "Offline" : "Verificando..."}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Powered by n8n + Mistral AI • Sessão: {sessionId.slice(-8)}</p>
          </div>
          <Button
            onClick={() => setIsChatOpen(false)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-12 transition-colors duration-300">
              <Bot className="h-16 w-16 mx-auto mb-6 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Assistente Virtual</h3>
              <p className="mb-2">Olá! Como posso ajudá-lo hoje?</p>
              <p className="text-sm">Pergunte sobre medicamentos, horários ou serviços da farmácia.</p>
            </div>
          ) : (
            messages.map((message, index) => (
                <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-lg p-4 transition-colors duration-300 ${
                      message.isUser
                        ? "bg-blue-600 dark:bg-blue-500 text-white"
                        : "bg-white text-gray-900 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm"
                    }`}>
                    <div className="flex items-start gap-3">
                      {!message.isUser && <Bot className="h-5 w-5 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0 transition-colors duration-300" />}
                      {message.isUser && <User className="h-5 w-5 mt-0.5 text-white flex-shrink-0" />}
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <p className={`text-xs mt-1 transition-colors duration-300 ${message.isUser ? "text-blue-100 dark:text-blue-200" : "text-gray-500 dark:text-gray-400"}`}>
                          {typeof window !== "undefined"
                            ? message.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "--:--"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm transition-colors duration-300">
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce transition-colors duration-300"></div>
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce transition-colors duration-300" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce transition-colors duration-300" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Warning message when n8n is offline */}
        {n8nStatus === "offline" && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
            <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
              <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
              <span className="text-sm font-medium">Assistente indisponível</span>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1 ml-6">O serviço n8n não está rodando. Inicie o n8n em http://localhost:5678 para usar o chat.</p>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t dark:border-gray-700 p-6 bg-white dark:bg-gray-800 transition-colors duration-300">
          <div className="flex gap-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={n8nStatus === "offline" ? "Assistente indisponível..." : "Digite sua mensagem..."}
              onKeyPress={handleKeyPress}
              disabled={isLoading || n8nStatus === "offline"}
              className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300 h-12"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim() || n8nStatus === "offline"}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-colors duration-300 h-12 px-4">
              <Send className="h-5 w-5" />
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed transition-colors duration-300">
              Este assistente fornece informações gerais. Consulte sempre um farmacêutico para orientações específicas.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              🤖 Conectado ao n8n workflow • Experimente: &quot;Busque dipirona&quot; ou &quot;Adicione ao carrinho&quot;
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
