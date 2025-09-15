"use client";

import { useState, useRef, useEffect, createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Bot, User, X, Mic, MicOff, Trash2 } from "lucide-react";
import { useNextjsAudioToTextRecognition } from "nextjs-audio-to-text-recognition";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/hooks/useCart";
import { useProductOverlay } from "@/contexts/product-overlay-context";
import { searchProductsApi } from "@/lib/utils/api";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
  images?: string[];
}

// Função para extrair URLs de imagens das mensagens
function extractImageUrls(text: string): string[] {
  const imageRegex = /📷 \[Imagem: ([^\]]+)\]/g;
  const matches = [];
  let match;

  while ((match = imageRegex.exec(text)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}

// Função para extrair produtos mencionados no texto da resposta
function extractProductMentions(text: string): Array<{ name: string; price?: number }> {
  const products = [];
  
  console.log('🔍 Tentando extrair produtos do texto:', text.substring(0, 300) + '...');
  
  // Dividir o texto em linhas e processar cada linha separadamente
  const lines = text.split(/\n|\.|\s-\s/);
  
  for (const line of lines) {
    // Procurar padrão: "- Nome do Produto — descrição €Preço"
    const productRegex = /^[-•]\s*([A-Za-z][^—]*?)\s*—[^€]*€(\d+[.,]\d+)/;
    const match = line.match(productRegex);
    
    if (match) {
      const name = match[1].trim();
      const priceStr = match[2].replace(',', '.');
      const price = parseFloat(priceStr);
      
      console.log('🔍 Match encontrado na linha:', { line: line.substring(0, 100), name, priceStr, price });
      
      if (name && !isNaN(price) && name.length > 2 && name.length < 100) {
        products.push({ name, price });
      }
    }
  }
  
  // Se não encontrou nada, tentar buscar por padrão mais simples
  if (products.length === 0) {
    console.log('🔍 Tentando padrão simples...');
    
    // Buscar por qualquer nome seguido de € e preço
    const simpleRegex = /([A-Za-z][A-Za-z0-9\s]{2,50})(?:[^\n€]{0,100})€(\d+[.,]\d+)/g;
    let match;
    
    while ((match = simpleRegex.exec(text)) !== null) {
      const name = match[1].trim();
      const priceStr = match[2].replace(',', '.');
      const price = parseFloat(priceStr);
      
      console.log('🔍 Match simples encontrado:', { name, priceStr, price });
      
      if (name && !isNaN(price) && name.length > 3 && name.length < 50) {
        // Verificar se não é um nome duplicado
        if (!products.find(p => p.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(p.name.toLowerCase()))) {
          products.push({ name, price });
        }
      }
    }
  }
  
  console.log('🔍 Produtos extraídos do texto (total:', products.length, '):', products);
  return products;
}

export function Chat() {
  const { isChatOpen, setIsChatOpen } = useChatContext();
  const { user } = useAuth();
  const { syncCart } = useCart();
  const router = useRouter();
  const productOverlay = useProductOverlay();

  // Função para processar redirecionamentos
  const processRedirect = (toolResult: any) => {
    if (toolResult && toolResult.data && toolResult.data.redirect && toolResult.data.url) {
      console.log("🔗 Redirecionamento detectado:", toolResult.data.url);
      // Aguardar um pouco antes de redirecionar para permitir que o usuário veja a mensagem
      setTimeout(() => {
        router.push(toolResult.data.url);
        console.log("✅ Redirecionando para:", toolResult.data.url);
      }, 2000);
    }
  };
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
  const [thinkingState, setThinkingState] = useState<'idle' | 'analyzing' | 'searching' | 'processing'>('idle');
  const [thinkingMessage, setThinkingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [isListening, setIsListening] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Hook para reconhecimento de voz
  const {
    isListening: voiceIsListening,
    transcript,
    startListening,
    stopListening,
  } = useNextjsAudioToTextRecognition({
    continuous: true,
    interimResults: true,
    lang: "pt-BR",
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

  // Generate session ID on component mount and set client flag
  useEffect(() => {
    // Use the same sessionId as SessionManager
    const getOrCreateSessionId = () => {
      let sessionId = localStorage.getItem("farmacia-session-id");
      if (!sessionId) {
        sessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("farmacia-session-id", sessionId);
      }
      return sessionId;
    };

    const newSessionId = getOrCreateSessionId();
    setSessionId(newSessionId);
    setIsClient(true);
    console.log("🔑 Chat usando sessionId:", newSessionId);
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

  const clearChat = async () => {
    try {
      // Limpar mensagens localmente
      setMessages([
        {
          id: "1",
          text: "Olá! Sou seu assistente virtual da farmácia. Como posso ajudá-lo hoje?",
          isUser: false,
          timestamp: new Date(),
        },
      ]);

      // Limpar sessão no backend
      if (sessionId) {
        await fetch(`/api/ai-chat?sessionId=${sessionId}`, {
          method: "DELETE",
        });
        console.log("🧹 Chat limpo e sessão resetada");
      }
    } catch (error) {
      console.error("❌ Erro ao limpar chat:", error);
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
    setThinkingState('analyzing');
    setThinkingMessage('Analisando sua mensagem...');

    try {
      console.log("📤 Enviando mensagem:", currentInput);
      console.log("📤 Dados do request:", { sessionId, message: currentInput, streaming: true });
      console.log("📤 URL da API:", "/api/ai-chat");
      console.log("📤 URL completa:", window.location.origin + "/api/ai-chat");
      console.log("📤 Iniciando fetch...");
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          sessionId: sessionId,
          streaming: true,
          context: user
            ? {
                userId: user.id,
                user: user,
              }
            : undefined,
          chatHistory: messages.slice(-10).map((msg) => ({
            role: msg.isUser ? "user" : "assistant",
            content: msg.text,
          })),
        }),
      });
      console.log("Resposta recebida:", response.status, response.headers.get("content-type"));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        text: "",
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
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              console.log("Dados recebidos:", data);
              if (data === "[DONE]") {
                done = true;
                break;
              }
              try {
                const parsed = JSON.parse(data);
                console.log("Dados parseados:", parsed);
                if (parsed?.type === "tool_call" && parsed?.toolCall && !parsed.content) {
                  parsed.content = parsed.toolCall;
                }

                if (parsed.type === "text" && parsed.content) {
                  // Conteúdo de texto normal
                  setMessages((prev) =>
                    prev.map((msg) => {
                      if (msg.id === assistantMessage.id) {
                        const newText = msg.text + parsed.content;
                        const images = extractImageUrls(newText);
                        
                        // NOVO: Verificar se o texto contém produtos e exibê-los no overlay
                        const extractedProducts = extractProductMentions(newText);
                        if (extractedProducts.length > 0) {
                          console.log('📦 Produtos detectados no texto da resposta:', extractedProducts);
                          
                          // Buscar produtos reais na base de dados baseados nos nomes extraídos
                          setTimeout(async () => {
                            try {
                              const realProducts = [];
                              for (const extractedProduct of extractedProducts) {
                                // Buscar produto por nome similar
                                const searchResponse = await fetch(`/api/products?q=${encodeURIComponent(extractedProduct.name)}&limit=1`);
                                if (searchResponse.ok) {
                                  const searchResults = await searchResponse.json();
                                  if (searchResults && searchResults.length > 0) {
                                    realProducts.push(searchResults[0]);
                                  } else {
                                    // Se não encontrou produto real, criar um fictício baseado na extração
                                    realProducts.push({
                                      id: `extracted-${Date.now()}-${Math.random()}`,
                                      name: extractedProduct.name,
                                      price: extractedProduct.price || 0,
                                      category: 'Medicamentos',
                                      description: 'Produto mencionado pelo assistente',
                                      image: null
                                    });
                                  }
                                }
                              }
                              
                              if (realProducts.length > 0) {
                                console.log('🎯 Exibindo produtos extraídos no overlay:', realProducts);
                                productOverlay.showProducts({
                                  title: "Produtos Mencionados",
                                  query: userMessage.text,
                                  products: realProducts
                                });
                              }
                            } catch (error) {
                              console.error('❌ Erro ao buscar produtos extraídos:', error);
                            }
                          }, 1000); // Aguardar 1 segundo para garantir que a resposta foi finalizada
                        }
                        
                        return { ...msg, text: newText, images: images.length > 0 ? images : undefined };
                      }
                      return msg;
                    })
                  );
                } else if (parsed.type === "tool_result" && parsed.toolResult) {
                  // Tool result - processar resultado da ferramenta
                  const toolResult = parsed.toolResult;
                  console.log("Tool result recebido:", toolResult);
                  
                  // Atualizar estado de pensamento
                  setThinkingState('processing');
                  setThinkingMessage('');
                  
                  // Verificar se é resultado de show_multiple_products
                  if (toolResult.result && toolResult.result.success && toolResult.result.data && toolResult.result.data.showInOverlay) {
                    const { products, title, query } = toolResult.result.data;
                    console.log("📦 Exibindo produtos no overlay via tool result:", { products: products?.length, title, query });
                    setThinkingMessage(`Encontrados ${products?.length || 0} produtos!`);
                    productOverlay.showProducts({ title: title || "Produtos Recomendados", query, products: products || [] });
                  }
                  
                  // NOVO: Extrair produtos automaticamente do resultado se não foram exibidos no overlay
                  if (toolResult.result && toolResult.result.data && toolResult.result.data.products && toolResult.result.data.products.length > 0) {
                    const products = toolResult.result.data.products;
                    const symptom = toolResult.result.data.symptomOrNeed || toolResult.result.data.query;
                    console.log("🔄 Forçando exibição no overlay - produtos encontrados:", { count: products.length, symptom });
                    
                    productOverlay.showProducts({
                      title: symptom ? `Produtos para "${symptom}"` : "Produtos Encontrados",
                      query: symptom,
                      products: products
                    });
                    
                    setThinkingMessage(`${products.length} produtos encontrados e exibidos!`);
                  }
                } else if (parsed.type === "tool_call" && (parsed.toolCall || parsed.content)) {
                  // Tool call - não adicionar ao texto, apenas logar
                  const toolPayload = parsed.toolCall || parsed.content;
                  console.log("Tool call executado:", toolPayload);

                  // Verificar se é uma ação relacionada ao carrinho
                  const cartRelatedTools = [
                    "add_to_cart",
                    "remove_from_cart",
                    "update_cart_quantity",
                    "view_cart",
                    "clear_cart",
                    "add_to_cart_simple",
                    "remove_from_cart_simple",
                    "update_cart_quantity_simple",
                  ];
                  if (toolPayload && toolPayload.toolName && cartRelatedTools.includes(toolPayload.toolName)) {
                    console.log("🛒 Ação de carrinho detectada, sincronizando UI...", toolPayload.toolName);
                    // Aguardar um pouco para garantir que a ação foi processada no backend
                    setTimeout(async () => {
                      try {
                        await syncCart();
                        console.log("✅ Carrinho sincronizado com sucesso após", parsed.content.toolName);
                      } catch (error) {
                        console.error("❌ Erro ao sincronizar carrinho:", error);
                      }
                    }, 1500);
                  }

                  // Preparar sugestões de produtos e redirecionar para a página de produtos
                  const productTools = ["search_products", "list_recommended_products", "get_promotional_products", "get_best_sellers"];
                  if (toolPayload && toolPayload.toolName && (productTools.includes(toolPayload.toolName) || toolPayload.toolName === "suggest_within_budget")) {
                    // Atualizar estado de pensamento para busca de produtos
                    setThinkingState('searching');
                    setThinkingMessage('Buscando produtos para você...');
                    try {
                      const args = toolPayload.args || {};
                      const query = args.query || args.symptomOrNeed || undefined;

                      // Definir título baseado no tipo de ferramenta
                      let overlayTitle = "Sugestões de produtos";
                      if (toolPayload.toolName === "get_promotional_products") {
                        overlayTitle = "🏷️ Produtos em Promoção";
                      } else if (toolPayload.toolName === "get_best_sellers") {
                        overlayTitle = "🏆 Produtos Mais Vendidos";
                      } else if (toolPayload.toolName === "list_recommended_products") {
                        overlayTitle = "💊 Produtos Recomendados";
                      } else if (query) {
                        overlayTitle = `Resultados para "${query}"`;
                      }

                      productOverlay.showLoading({ title: overlayTitle, query });

                      // Tentar extrair produtos diretamente do result quando disponível
                      let toolProducts = toolPayload.result?.data?.products || toolPayload.result?.products;
                      if (!toolProducts || !Array.isArray(toolProducts)) {
                        // Fallback: buscar pela API com base no argumento
                        const fetched = await searchProductsApi({ q: query, limit: 12 });
                        toolProducts = fetched;
                      }
                      productOverlay.showProducts({ title: overlayTitle, query, products: toolProducts || [] });
                      setTimeout(() => router.push("/products"), 250);
                    } catch (e) {
                      console.error("Erro ao preparar sugestões de produtos:", e);
                      productOverlay.showProducts({ title: "Sugestões de produtos", products: [] });
                      setTimeout(() => router.push("/products"), 250);
                    }
                  }

                  // Processar ferramenta de múltiplos produtos
                  if (toolPayload && toolPayload.toolName === "show_multiple_products") {
                    try {
                      const result = toolPayload.result;
                      console.log("🔍 Processando show_multiple_products:", result);
                      if (result && result.success && result.data && result.data.showInOverlay) {
                        const { products, title, query } = result.data;
                        console.log("📦 Exibindo produtos no overlay:", { products: products?.length, title, query });
                        productOverlay.showProducts({
                          title: title || "Produtos Selecionados",
                          query,
                          products: products || [],
                        });
                        console.log("✅ Múltiplos produtos exibidos no overlay:", products?.length || 0);
                      } else {
                        console.warn("⚠️ show_multiple_products não tem dados válidos para overlay:", result);
                      }
                    } catch (e) {
                      console.error("❌ Erro ao processar múltiplos produtos:", e);
                    }
                  }

                  // Verificar se é uma ação de redirecionamento
                  if (toolPayload && toolPayload.toolName === "redirect_to_product" && toolPayload.result) {
                    console.log("🔗 Ação de redirecionamento detectada:", toolPayload.result);
                    processRedirect(toolPayload.result);
                  }
                } else if (parsed.content && typeof parsed.content === "string") {
                  // Fallback para conteúdo direto
                  setMessages((prev) =>
                    prev.map((msg) => {
                      if (msg.id === assistantMessage.id) {
                        const newText = msg.text + parsed.content;
                        const images = extractImageUrls(newText);
                        return { ...msg, text: newText, images: images.length > 0 ? images : undefined };
                      }
                      return msg;
                    })
                  );
                }

                if (parsed.type === "end") {
                  // NOVO: Verificar se há produtos mencionados na resposta final e forçar overlay
                  setMessages((prev) => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage && !lastMessage.isUser && lastMessage.text) {
                      const extractedProducts = extractProductMentions(lastMessage.text);
                      console.log('🔍 [END] Verificando produtos na mensagem final:', { 
                        messageLength: lastMessage.text.length,
                        extractedCount: extractedProducts.length,
                        products: extractedProducts
                      });
                      
                      if (extractedProducts.length > 0) {
                        console.log('🎯 [END] Forçando overlay com produtos extraídos da resposta final');
                        
                        // Buscar produtos reais e forçar overlay
                        setTimeout(async () => {
                          try {
                            const realProducts = [];
                            for (const extractedProduct of extractedProducts) {
                              try {
                                const searchResponse = await fetch(`/api/products?q=${encodeURIComponent(extractedProduct.name)}&limit=1`);
                                if (searchResponse.ok) {
                                  const searchResults = await searchResponse.json();
                                  if (searchResults && searchResults.length > 0) {
                                    realProducts.push(searchResults[0]);
                                  } else {
                                    // Criar produto fictício baseado na extração
                                    realProducts.push({
                                      id: `extracted-${Date.now()}-${Math.random()}`,
                                      name: extractedProduct.name,
                                      price: extractedProduct.price || 0,
                                      category: 'Medicamentos',
                                      description: 'Produto recomendado pelo assistente',
                                      image: null
                                    });
                                  }
                                }
                              } catch (err) {
                                console.warn('Erro ao buscar produto:', extractedProduct.name, err);
                                // Aêndir produto fictício como fallback
                                realProducts.push({
                                  id: `extracted-${Date.now()}-${Math.random()}`,
                                  name: extractedProduct.name,
                                  price: extractedProduct.price || 0,
                                  category: 'Medicamentos',
                                  description: 'Produto recomendado pelo assistente',
                                  image: null
                                });
                              }
                            }
                            
                            if (realProducts.length > 0) {
                              console.log('✅ [END] Exibindo overlay com produtos:', realProducts.map(p => ({ name: p.name, price: p.price })));
                              productOverlay.showProducts({
                                title: "Produtos Recomendados",
                                query: userMessage.text,
                                products: realProducts
                              });
                            }
                          } catch (error) {
                            console.error('❌ [END] Erro ao processar produtos extraídos:', error);
                          }
                        }, 500);
                      }
                    }
                    return prev;
                  });
                  
                  done = true;
                  break;
                }
              } catch (e) {
                console.log("Erro ao parsear dados:", e, "Dados:", data);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem:", error);
      console.error("❌ Tipo do erro:", typeof error);
      console.error("❌ Nome do erro:", (error as any)?.name);
      console.error("❌ Mensagem do erro:", (error as any)?.message);
      console.error("❌ Stack do erro:", (error as any)?.stack);
      setIsLoading(false);

      let errorText = "❌ Não foi possível enviar sua mensagem. Tente novamente.";

      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorText = "❌ Não foi possível conectar ao assistente. Verifique sua conexão.";
        console.error("❌ Erro de fetch detectado");
      } else if (error instanceof DOMException && error.name === "TimeoutError") {
        errorText = "⏱️ Timeout ao enviar mensagem. Tente novamente.";
        console.error("❌ Timeout detectado");
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
      setThinkingState('idle');
      setThinkingMessage('');
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
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] md:w-[500px] bg-white dark:bg-gray-900 border-l dark:border-gray-700 shadow-xl transition-transform duration-300 ease-in-out z-40 flex flex-col ${
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
          <div className="flex items-center space-x-2">
            <Button
              onClick={clearChat}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              title="Limpar conversa">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setIsChatOpen(false)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X className="h-4 w-4" />
            </Button>
          </div>
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

                      {/* Renderizar imagens se disponíveis */}
                      {message.images && message.images.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {message.images.map((imageUrl, imgIndex) => (
                            <div key={imgIndex} className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                              <Image
                                src={imageUrl}
                                alt={`Produto ${imgIndex + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, 25vw"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <p className={`text-xs mt-1 transition-colors duration-300 ${message.isUser ? "text-blue-100 dark:text-blue-200" : "text-gray-500 dark:text-gray-400"}`}>
                        {isClient
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

          {/* Enhanced Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm transition-all duration-300 max-w-[85%]">
                <div className="flex items-start gap-3">
                  <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 transition-colors duration-300 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {thinkingState === 'analyzing' && (
                        <>
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Analisando...</span>
                        </>
                      )}
                      {thinkingState === 'searching' && (
                        <>
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Buscando...</span>
                        </>
                      )}
                      {thinkingState === 'processing' && (
                        <>
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Processando...</span>
                        </>
                      )}
                      {thinkingState === 'idle' && (
                        <>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Pensando...</span>
                        </>
                      )}
                    </div>
                    {thinkingMessage && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{thinkingMessage}</p>
                    )}
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce transition-colors duration-300"></div>
                      <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce transition-colors duration-300" style={{ animationDelay: "0.15s" }}></div>
                      <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce transition-colors duration-300" style={{ animationDelay: "0.3s" }}></div>
                    </div>
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
