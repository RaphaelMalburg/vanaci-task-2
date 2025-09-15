# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Development server (runs on port 3007)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Database Operations
```bash
# Generate Prisma client after schema changes
npx prisma generate

# Push schema changes to database
npx prisma db push

# Seed database with sample data
npm run db:seed

# Reset database and reseed
npm run db:reset
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- ai-agent.test.ts
```

### Utility Scripts
```bash
# Keep server warm (for deployment)
npm run keep-warm

# Keep warm in development mode
npm run keep-warm:dev
```

## High-Level Architecture

### Service Layer Architecture
The application follows a clean service-oriented architecture:

- **`ProductService`**: Singleton service managing product catalog operations with Prisma ORM
- **`CartService`**: Unified cart operations handling both authenticated users and session-based carts
- **`SessionService`**: Manages AI chat sessions with database persistence and fallback to memory
- **`PharmacyAIAgent`**: LangChain-based conversational AI with 27+ tools for e-commerce operations

### AI Agent System
The AI agent (`src/lib/ai-agent/`) is modular and provider-agnostic:
- **Multi-LLM Support**: OpenAI, Google, Anthropic, Mistral with automatic fallback
- **Tool Categories**: Products (search, recommendations), Cart (CRUD operations), Checkout, Navigation, Budget optimization, Store info
- **Session Persistence**: Database-first with memory fallback for reliability
- **Message Rewriting**: Optional preprocessing for better tool selection

### Database Schema (Prisma + PostgreSQL)
Key models:
- **Product**: Pharmacy product catalog with categories and stock
- **ChatSession/ChatMessage**: AI conversation persistence with tool call storage
- **User/UserCart/UserCartItem**: Authenticated user cart system
- Supports both authenticated and session-based (anonymous) shopping

### State Management
- **Zustand**: Client-side cart state management
- **React Context**: Authentication and theme management
- **Session-based**: For anonymous users
- **Database-backed**: For authenticated users

## AI Agent Development

### Tool Development Pattern
All AI tools follow this structure:
```typescript
import { tool } from 'ai';
import { z } from 'zod';

export const myTool = tool({
  description: 'What the tool does',
  parameters: z.object({
    param: z.string().describe('Parameter description')
  }),
  execute: async ({ param }) => {
    // Tool logic
    return { success: true, data: result };
  }
});
```

### Agent Configuration
The agent supports multiple LLM providers with automatic fallback. Configure via environment variables:
- `DEFAULT_LLM_PROVIDER`: openai, google, anthropic, mistral
- `LLM_TEMPERATURE`: Default 0.7
- `LLM_MAX_TOKENS`: Default 2000

### Forced Tool Usage
The agent automatically detects when messages require tool usage based on patterns like:
- Cart operations: "ver carrinho", "adicionar ao carrinho"
- Product searches: "buscar", "tem", "existe"
- Promotions: "promoção", "desconto", "oferta"
- Symptoms: "dor", "remédio para dor"

## Testing Strategy

### Test Structure
- **Unit Tests**: Services, utilities, and AI agent components
- **Integration Tests**: API routes and database operations  
- **AI Agent Tests**: Tool execution and fallback scenarios
- **Mock Strategy**: External AI providers mocked for deterministic testing

### Key Test Files
- `tests/ai-agent.test.ts`: AI agent fallback system
- `tests/cart.test.ts`: Cart service operations
- `tests/fallback-system.test.ts`: System resilience testing

## Important Project Rules

From `.trae/rules/project_rules.md`:
- After each main change: build → git add . → commit with reasonable message → push

## Environment Setup

### Required Environment Variables
```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# AI Providers (at least one required)
OPENAI_API_KEY="sk-..."
GOOGLE_GENERATIVE_AI_API_KEY="..."
ANTHROPIC_API_KEY="..."
MISTRAL_API_KEY="..."

# AI Configuration
DEFAULT_LLM_PROVIDER="openai"
LLM_TEMPERATURE="0.7"
LLM_MAX_TOKENS="2000"

# Optional: LangChain tracing
LANGCHAIN_TRACING_V2="true"
LANGCHAIN_API_KEY="..."
```

### Development Workflow
1. Make code changes
2. Run tests: `npm test`
3. Build: `npm run build`
4. If build passes: `git add .`, commit, push

## Key Directories

- `src/app/`: Next.js App Router with API routes
- `src/components/`: React components (UI, cart, chat)
- `src/lib/services/`: Business logic services
- `src/lib/ai-agent/`: Modular AI agent implementation
- `prisma/`: Database schema and migrations
- `tests/`: Jest test suite
- `scripts/`: Utility scripts for testing and warming

## Port Configuration

The development server runs on port 3007 (`npm run dev`) instead of the default Next.js port 3000.