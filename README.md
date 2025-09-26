# Farmácia Vanaci - Sistema de E-commerce com IA

Um sistema de e-commerce moderno para farmácia com assistente de IA integrado, construído com Next.js, TypeScript e LangChain.

## 🚀 Funcionalidades

- **E-commerce completo**: Catálogo de produtos, carrinho de compras, checkout
- **Assistente de IA**: Chat inteligente para ajudar clientes com produtos farmacêuticos
- **Persistência de sessões**: Conversas salvas no banco de dados com fallback em memória
- **Arquitetura em camadas**: Serviços organizados e type-safe
- **Interface moderna**: UI responsiva com Tailwind CSS

## 🏗️ Arquitetura do Sistema

### Camada de Serviços

O sistema utiliza uma arquitetura em camadas com serviços especializados:

- **`ProductService`**: Gerenciamento de produtos e catálogo
- **`CartService`**: Lógica do carrinho de compras
- **`SessionService`**: Persistência de sessões de chat
- **`PharmacyAIAgent`**: Assistente de IA com LangChain

### Banco de Dados

Utiliza Prisma ORM com PostgreSQL (Supabase):

- **`Product`**: Produtos da farmácia
- **`ChatSession`**: Sessões de conversa
- **`ChatMessage`**: Mensagens do chat

### AI Agent

O assistente de IA (`PharmacyAIAgent`) oferece:

- Recomendações de produtos farmacêuticos
- Informações sobre medicamentos
- Suporte ao cliente
- Integração com carrinho de compras
- Persistência de contexto de conversa

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Banco de Dados**: PostgreSQL (Supabase) + Prisma ORM
- **IA**: LangChain, OpenRouter + GPT
- **Testes**: Jest, React Testing Library

## 📦 Instalação

1. **Clone o repositório**:
```bash
git clone <repository-url>
cd farmacia-vanaci
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Configure as variáveis de ambiente**:
```bash
cp .env.example .env.local
```

Configure as seguintes variáveis:
```env
# Database
DATABASE_URL="postgresql://..."

# OpenAI
OPENAI_API_KEY="sk-..."

# LangChain
LANGCHAIN_TRACING_V2="true"
LANGCHAIN_API_KEY="..."
```

4. **Configure o banco de dados**:
```bash
npx prisma generate
npx prisma db push
```

5. **Execute o projeto**:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🔧 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run start` - Servidor de produção
- `npm run lint` - Verificação de código
- `npm run test` - Execução de testes
- `npm run test:watch` - Testes em modo watch

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── api/               # API Routes
│   ├── cart/              # Página do carrinho
│   ├── products/          # Páginas de produtos
│   └── globals.css        # Estilos globais
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── cart/             # Componentes do carrinho
│   ├── chat/             # Componentes do chat
│   └── products/         # Componentes de produtos
├── lib/                   # Utilitários e configurações
│   ├── ai-agent/         # Assistente de IA
│   ├── services/         # Camada de serviços
│   ├── types/            # Definições de tipos
│   ├── utils.ts          # Utilitários gerais
│   └── logger.ts         # Sistema de logs
└── prisma/               # Schema do banco de dados
```

## 🤖 Como Usar o Assistente de IA

O assistente está disponível em todas as páginas através do ícone de chat:

1. **Perguntas sobre produtos**: "Qual remédio para dor de cabeça?"
2. **Adicionar ao carrinho**: "Adicione Dipirona ao meu carrinho"
3. **Informações gerais**: "Como tomar este medicamento?"
4. **Suporte**: "Preciso de ajuda com meu pedido"

## 🧪 Testes

O projeto inclui testes para:

- Componentes React
- Serviços de negócio
- API Routes
- Utilitários

Execute os testes:
```bash
npm run test
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório na [Vercel](https://vercel.com)
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras Plataformas

O projeto é compatível com qualquer plataforma que suporte Next.js:

- Netlify
- Railway
- Heroku
- AWS
- Google Cloud

## 🔒 Segurança

- Validação de entrada em todas as APIs
- Sanitização de dados do usuário
- Rate limiting no chat de IA
- Logs de segurança configuráveis

## 📈 Performance

- Server-side rendering (SSR)
- Static generation quando possível
- Otimização de imagens automática
- Code splitting
- Caching inteligente

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para suporte técnico ou dúvidas:

- Abra uma [issue](https://github.com/seu-usuario/farmacia-vanaci/issues)
- Entre em contato via email
- Consulte a documentação da API em `/api-docs`

---

**Desenvolvido com ❤️ para Farmácia Vanaci**
