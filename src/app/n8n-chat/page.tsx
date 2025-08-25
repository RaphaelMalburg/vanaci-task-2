import { N8nChatExample } from '@/components/n8n-chat-integration';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat n8n - Farmácia Vanaci',
  description: 'Chat integrado com workflow n8n para assistência farmacêutica',
};

export default function N8nChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Farmácia Vanaci</h1>
              <p className="text-gray-600">Assistente Virtual com n8n</p>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="/products" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver Produtos
              </a>
              <a 
                href="/" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Página Inicial
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Info Section */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Como funciona o Chat n8n</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">🤖 Assistente Inteligente</h3>
              <p className="text-gray-600 text-sm mb-4">
                Nosso assistente usa n8n com Mistral LLM para entender suas necessidades 
                e ajudar com produtos farmacêuticos.
              </p>
              
              <h3 className="font-medium mb-2">🛒 Gerenciamento de Carrinho</h3>
              <p className="text-gray-600 text-sm">
                Adicione, remova e gerencie itens do seu carrinho através de conversação natural.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">💊 Busca de Medicamentos</h3>
              <p className="text-gray-600 text-sm mb-4">
                Encontre medicamentos por nome, princípio ativo ou sintomas.
              </p>
              
              <h3 className="font-medium mb-2">✅ Finalização de Compra</h3>
              <p className="text-gray-600 text-sm">
                Complete sua compra diretamente pelo chat com validação de estoque.
              </p>
            </div>
          </div>
        </div>

        {/* Examples Section */}
        <div className="mb-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold mb-3">💬 Exemplos de Comandos</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Busca de Produtos:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• "Preciso de dipirona"</li>
                <li>• "Busque paracetamol 500mg"</li>
                <li>• "Medicamentos para dor de cabeça"</li>
                <li>• "Mostre vitaminas disponíveis"</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Gerenciamento do Carrinho:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• "Adicione 2 unidades ao carrinho"</li>
                <li>• "Remova dipirona do carrinho"</li>
                <li>• "Mostre meu carrinho"</li>
                <li>• "Finalizar compra"</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Info */}
        <div className="mb-8 bg-gray-100 rounded-lg p-6">
          <h3 className="font-semibold mb-3">🔧 Informações Técnicas</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">n8n Workflow:</h4>
              <p className="text-gray-600">
                Webhook → AI Agent → Ferramentas Especializadas → API Integration
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">LLM:</h4>
              <p className="text-gray-600">
                Mistral com Simple Memory (10 mensagens de contexto)
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Endpoints:</h4>
              <p className="text-gray-600">
                /api/products, /api/cart, /api/cart/checkout
              </p>
            </div>
          </div>
        </div>

        {/* Chat Component */}
        <N8nChatExample />

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            ⚠️ Este é um ambiente de demonstração. 
            Certifique-se de que o n8n esteja rodando em localhost:5678
          </p>
          <p className="mt-2">
            📋 Workflow disponível em: <code className="bg-gray-200 px-2 py-1 rounded">
              n8n-pharmacy-chat-workflow.json
            </code>
          </p>
        </div>
      </main>
    </div>
  );
}