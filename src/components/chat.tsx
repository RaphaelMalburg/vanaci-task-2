"use client";

import { useState, useRef, useEffect, createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Bot, User, X, Mic, MicOff } from "lucide-react";
import { useNextjsAudioToTextRecognition } from "nextjs-audio-to-text-recognition";

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
  const [isListening, setIsListening] = useState(false);
  
  // Hook para reconhecimento de voz
  const {
    isListening: voiceIsListening,
    transcript,
    startListening,
    stopListening,
  } = useNextjsAudioToTextRecognition({
    continuous: true,
    interimResults: true,
    lang: 'pt-BR',
  });
  
  // Removed n8n status - using AI Agent now


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log("[Chat Debug] Mensagens atualizadas, total:", messages.length);
    console.log("[Chat Debug] Conteúdo das mensagens:", messages);
    scrollToBottom();
  }, [messages]);

  // Removed n8n status check - using AI Agent now

  // Generate session ID on component mount
  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
  }, []);

  // Atualizar input com transcript de voz
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
    }
  }, [transcript]);

  // Funções de controle de voz
  const handleStartVoice = () => {
    setIsListening(true);
    startListening();
  };

  const handleStopVoice = () => {
    setIsListening(false);
    stopListening();
  };

  const toggleVoiceRecording = () => {
    if (isListening || voiceIsListening) {
      handleStopVoice();
    } else {
      handleStartVoice();
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          sessionId: sessionId,
          chatHistory: messages.slice(-10).map((msg) => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        text: '',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                done = true;
                break;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id
                        ? { ...msg, text: msg.text + parsed.content }
                        : msg
                    )
                  );
                }
              } catch (e) {
                // Ignore parsing errors for partial chunks
              }
            }
          }
        }
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
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
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Online</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Powered by AI Agent • Sessão: {sessionId.slice(-8)}</p>
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



        {/* Input Area */}
        <div className="border-t dark:border-gray-700 p-6 bg-white dark:bg-gray-800 transition-colors duration-300">
          <div className="flex gap-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isListening ? "Escutando..." : "Digite sua mensagem..."}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300 h-12"
            />
            <Button
              onClick={toggleVoiceRecording}
              disabled={isLoading}
              className={`transition-colors duration-300 h-12 px-4 ${
                isListening || voiceIsListening
                  ? "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white"
                  : "bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white"
              }`}
              title={isListening || voiceIsListening ? "Parar gravação" : "Iniciar gravação de voz"}>
              {isListening || voiceIsListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim()}
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
              🤖 Assistente AI com suporte a voz • Experimente: &quot;Busque dipirona&quot; ou &quot;Adicione ao carrinho&quot;
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
