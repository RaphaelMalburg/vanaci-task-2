# 🏗️ Diagrama de Arquitetura - Sistema de Agente IA

## 📊 Arquitetura Geral do Sistema

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        UI[Interface do Usuário]
        Chat[Componente Chat]
        Cart[Componente Carrinho]
        Products[Componente Produtos]
        Store[Zustand Store]
    end

    subgraph "Agente IA"
        Agent[Agente Principal]
        LLM[Modelos LLM]
        Context[Gerenciador de Contexto]
        
        subgraph "Ferramentas (Tools)"
            CartTools[Cart Tools]
            ProductTools[Product Tools]
            CheckoutTools[Checkout Tools]
            BudgetTools[Budget Tools]
            NavTools[Navigation Tools]
            ExtraTools[Extra Tools]
        end
    end

    subgraph "Backend (API Routes)"
        CartAPI["/api/cart"]
        ProductAPI["/api/products"]
        CheckoutAPI["/api/checkout"]
        AuthAPI["/api/auth"]
        ChatAPI["/api/chat"]
    end

    subgraph "Banco de Dados"
        DB[(PostgreSQL)]
        Prisma[Prisma ORM]
    end

    subgraph "Serviços Externos"
        OpenRouter[OpenRouter + GPT-4]
        Claude[Anthropic Claude]
        Gemini[Google Gemini]
    end

    %% Conexões principais
    UI --> Chat
    Chat --> ChatAPI
    ChatAPI --> Agent
    Agent --> Context
    Agent --> LLM
    LLM --> OpenRouter
    LLM --> Claude
    LLM --> Gemini

    %% Ferramentas para APIs
    CartTools --> CartAPI
    ProductTools --> ProductAPI
    CheckoutTools --> CheckoutAPI
    NavTools --> UI

    %% Backend para DB
    CartAPI --> Prisma
    ProductAPI --> Prisma
    CheckoutAPI --> Prisma
    AuthAPI --> Prisma
    Prisma --> DB

    %% Store management
    Cart --> Store
    Products --> Store
    Store --> CartAPI

    %% Styling com melhor contraste
    classDef frontend fill:#1565c0,stroke:#0d47a1,stroke-width:2px,color:#ffffff
    classDef agent fill:#7b1fa2,stroke:#4a148c,stroke-width:2px,color:#ffffff
    classDef backend fill:#2e7d32,stroke:#1b5e20,stroke-width:2px,color:#ffffff
    classDef database fill:#ef6c00,stroke:#e65100,stroke-width:2px,color:#ffffff
    classDef external fill:#c2185b,stroke:#880e4f,stroke-width:2px,color:#ffffff

    class UI,Chat,Cart,Products,Store frontend
    class Agent,LLM,Context,CartTools,ProductTools,CheckoutTools,BudgetTools,NavTools,ExtraTools agent
    class CartAPI,ProductAPI,CheckoutAPI,AuthAPI,ChatAPI backend
    class DB,Prisma database
    class OpenRouter,Claude,Gemini external
```

## 🔄 Fluxo de Interação do Usuário

```mermaid
sequenceDiagram
    participant U as Usuário
    participant C as Chat Component
    participant A as Agente IA
    participant T as Tools
    participant API as Backend APIs
    participant DB as Database

    U->>C: "Adiciona 2 Benuron"
    C->>A: Processa mensagem
    A->>A: Analisa intenção
    A->>T: Seleciona add_to_cart tool
    T->>API: POST /api/cart
    API->>DB: Atualiza carrinho
    DB-->>API: Confirma atualização
    API-->>T: Retorna carrinho atualizado
    T-->>A: Resultado da operação
    A->>A: Formula resposta natural
    A-->>C: "Benuron adicionado! Você tem 2 unidades."
    C-->>U: Exibe resposta
```

## 🛠️ Estrutura das Ferramentas (Tools)

```mermaid
graph LR
    subgraph "Cart Tools"
        A1[add_to_cart]
        A2[set_cart_quantity]
        A3[increment_cart]
        A4[update_cart_quantity]
        A5[remove_from_cart]
        A6[view_cart]
        A7[clear_cart]
    end

    subgraph "Product Tools"
        B1[search_products]
        B2[get_product_details]
        B3[get_categories]
        B4[get_featured_products]
    end

    subgraph "Checkout Tools"
        C1[initiate_checkout]
        C2[validate_cart]
        C3[calculate_shipping]
    end

    subgraph "Budget Tools"
        D1[calculate_budget]
        D2[suggest_alternatives]
        D3[compare_prices]
    end

    subgraph "Navigation Tools"
        E1[redirect_to_cart]
        E2[redirect_to_products]
        E3[redirect_to_checkout]
    end

    subgraph "Extra Tools"
        F1[get_store_hours]
        F2[get_promotions]
        F3[get_contact_info]
    end

    %% Styling com melhor contraste
    classDef cartTools fill:#d32f2f,stroke:#b71c1c,stroke-width:2px,color:#ffffff
    classDef productTools fill:#388e3c,stroke:#1b5e20,stroke-width:2px,color:#ffffff
    classDef checkoutTools fill:#1976d2,stroke:#0d47a1,stroke-width:2px,color:#ffffff
    classDef budgetTools fill:#7b1fa2,stroke:#4a148c,stroke-width:2px,color:#ffffff
    classDef navTools fill:#512da8,stroke:#311b92,stroke-width:2px,color:#ffffff
    classDef extraTools fill:#f57c00,stroke:#e65100,stroke-width:2px,color:#ffffff

    class A1,A2,A3,A4,A5,A6,A7 cartTools
    class B1,B2,B3,B4 productTools
    class C1,C2,C3 checkoutTools
    class D1,D2,D3 budgetTools
    class E1,E2,E3 navTools
    class F1,F2,F3 extraTools
```

## 🔄 Sistema de Fallback LLM

```mermaid
graph TD
    Start[Requisição do Usuário]
    Primary[OpenRouter + GPT-4]
    Fallback1[Anthropic Claude]
    Fallback2[Google Gemini]
    Error[Erro - Resposta Padrão]
    Success[Resposta Gerada]

    Start --> Primary
    Primary -->|Sucesso| Success
    Primary -->|Falha| Fallback1
    Fallback1 -->|Sucesso| Success
    Fallback1 -->|Falha| Fallback2
    Fallback2 -->|Sucesso| Success
    Fallback2 -->|Falha| Error

    %% Styling com melhor contraste
    classDef primary fill:#2e7d32,stroke:#1b5e20,stroke-width:3px,color:#ffffff
    classDef fallback fill:#f57c00,stroke:#e65100,stroke-width:3px,color:#ffffff
    classDef error fill:#d32f2f,stroke:#b71c1c,stroke-width:3px,color:#ffffff
    classDef success fill:#1976d2,stroke:#0d47a1,stroke-width:3px,color:#ffffff

    class Primary primary
    class Fallback1,Fallback2 fallback
    class Error error
    class Success success
```

## 📊 Fluxo de Dados do Carrinho

```mermaid
graph TD
    subgraph "Usuário Autenticado"
        UA[Usuário Logado]
        UDB[(Carrinho no DB)]
    end

    subgraph "Usuário Não Autenticado"
        UNA[Usuário Visitante]
        Session[Carrinho na Sessão]
    end

    subgraph "Operações"
        Add[Adicionar Item]
        Update[Atualizar Quantidade]
        Remove[Remover Item]
        View[Visualizar]
    end

    subgraph "Lógica de Negócio"
        Increment[Incrementar Quantidade]
        SetExact[Definir Quantidade Exata]
        StockCheck[Verificar Estoque]
    end

    UA --> UDB
    UNA --> Session
    
    Add --> Increment
    Add --> SetExact
    Update --> StockCheck
    
    Increment --> UDB
    SetExact --> UDB
    Increment --> Session
    SetExact --> Session

    %% Styling com melhor contraste
    classDef user fill:#1565c0,stroke:#0d47a1,stroke-width:2px,color:#ffffff
    classDef operation fill:#2e7d32,stroke:#1b5e20,stroke-width:2px,color:#ffffff
    classDef logic fill:#7b1fa2,stroke:#4a148c,stroke-width:2px,color:#ffffff

    class UA,UNA,UDB,Session user
    class Add,Update,Remove,View operation
    class Increment,SetExact,StockCheck logic
```

---

## 📝 Como Usar os Diagramas

1. **Copie o código Mermaid** de qualquer seção
2. **Cole em ferramentas como**:
   - GitHub (suporte nativo)
   - Mermaid Live Editor
   - VS Code (extensão Mermaid)
   - Notion, Confluence, etc.

3. **Para apresentações**, exporte como PNG/SVG do Mermaid Live Editor