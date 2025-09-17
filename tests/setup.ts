// Setup global para testes Jest

// Mock das variáveis de ambiente necessárias
process.env.OPENAI_API_KEY = "test-openai-key";
process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-google-key";
process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
process.env.MISTRAL_API_KEY = "test-mistral-key";
process.env.DATABASE_URL = "file:./test.db";
process.env.OPENROUTER_API_KEY = "test-openrouter-key";
process.env.OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

// Mock do console para testes mais limpos
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Timeout global para testes

jest.mock("ai", () => ({
  generateText: jest.fn().mockResolvedValue({
    text: "Temos Dipirona 500 mg como opções de medicamento.",
    toolCalls: [],
    toolResults: {},
  }),
  streamText: jest.fn(),
}));

jest.setTimeout(30000);
