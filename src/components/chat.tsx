"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MessageCircle, Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "1",
    text: "Olá! Sou seu assistente virtual da farmácia. Como posso ajudá-lo hoje?",
    isUser: false,
    timestamp: new Date()
  }]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch('https://primary-production-8189a.up.railway.app/webhook/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          chatHistory: messages.slice(-9)
        })
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response || "Desculpe, não consegui processar sua solicitação no momento.",
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('Falha na resposta do servidor');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Desculpe, ocorreu um erro. Tente novamente mais tarde.",
        isUser: false,
        timestamp: new Date()
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

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-4 right-4 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg transition-all duration-300 ease-in-out z-50"
            size="icon"
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </Button>
        </SheetTrigger>
        
        <SheetContent side="right" className="w-[400px] sm:w-[500px] h-full flex flex-col bg-white dark:bg-gray-900 border-l dark:border-gray-700 transition-colors duration-300">
          <SheetHeader className="border-b dark:border-gray-700 pb-4">
            <SheetTitle className="text-gray-900 dark:text-white transition-colors duration-300">
              Assistente Virtual da Farmácia
            </SheetTitle>
          </SheetHeader>
          
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
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-4 transition-colors duration-300 ${
                      message.isUser
                        ? 'bg-blue-600 dark:bg-blue-500 text-white'
                        : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {!message.isUser && (
                        <Bot className="h-5 w-5 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0 transition-colors duration-300" />
                      )}
                      {message.isUser && (
                        <User className="h-5 w-5 mt-0.5 text-white flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <p className={`text-xs mt-1 transition-colors duration-300 ${
                          message.isUser ? 'text-blue-100 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
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
                      <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce transition-colors duration-300" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce transition-colors duration-300" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="border-t dark:border-gray-700 p-6 bg-white dark:bg-gray-800 transition-colors duration-300">
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Digite sua mensagem..."
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300 h-12"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-colors duration-300 h-12 px-4"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Disclaimer */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center leading-relaxed transition-colors duration-300">
              Este assistente fornece informações gerais. Consulte sempre um farmacêutico para orientações específicas.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default Chat;