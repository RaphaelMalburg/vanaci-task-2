---
description: Repository Information Overview
alwaysApply: true
---

# Farmácia Vanaci Information

## Summary

Farmácia Vanaci is a modern e-commerce system for pharmacies with an integrated AI assistant. Built with Next.js, TypeScript, and LangChain, it provides a complete shopping experience with product catalog, shopping cart, and checkout functionality. The AI assistant helps customers with pharmaceutical products and can interact with the cart.

## Structure

- **src/app**: Next.js App Router with API routes and page components
- **src/components**: React components including UI, cart, and chat components
- **src/lib**: Core utilities, services, and AI agent implementation
- **prisma**: Database schema and migrations for PostgreSQL
- **public**: Static assets including product images
- **tests**: Jest test files for components and services

## Language & Runtime

**Language**: TypeScript
**Version**: ES2017 target with modern TypeScript features
**Framework**: Next.js 15.5.0
**Package Manager**: npm

## Dependencies

**Main Dependencies**:

- **Next.js 15.5.0**: React framework for server-rendered applications
- **React 19.1.0**: UI library
- **Prisma 6.14.0**: ORM for database access
- **AI SDK**: Multiple AI providers (@ai-sdk/openai, @ai-sdk/anthropic, etc.)
- **LangChain**: Framework for AI applications (@langchain/core, @langchain/openai)
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand 5.0.8**: State management library

**Development Dependencies**:

- **TypeScript 5**: Static typing
- **Jest 30.1.1**: Testing framework
- **ESLint 9**: Code linting
- **ts-jest**: TypeScript support for Jest

## Build & Installation

```bash
npm install
npx prisma generate
npm run dev
```

## Database

**ORM**: Prisma with PostgreSQL
**Models**:

- Product: Pharmacy products catalog
- User: User accounts
- ChatSession: AI chat sessions
- ChatMessage: Individual chat messages
- UserCart/UserCartItem: Shopping cart implementation

## Testing

**Framework**: Jest with ts-jest
**Test Location**: /tests directory
**Configuration**: jest.config.js
**Run Command**:

```bash
npm run test
```

## AI Implementation

**Framework**: LangChain with multiple AI providers
**Features**:

- Product recommendations
- Medication information
- Customer support
- Shopping cart integration
- Conversation context persistence

## API Routes

**Location**: src/app/api
**Authentication**: JWT-based (jsonwebtoken)
**Key Endpoints**: Products, cart, chat sessions

## Services Architecture

**Core Services**:

- ProductService: Product catalog management
- CartService: Shopping cart logic
- SessionService: Chat session persistence
- PharmacyAIAgent: AI assistant implementation
