import { NextRequest, NextResponse } from 'next/server';
import { getPharmacyAgent } from '@/lib/ai-agent';
import { generateId } from '@/lib/ai-agent/utils';

// Configuração para permitir streaming
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST - Processar mensagem do usuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId, context, streaming = false, llmConfig } = body;

    // Validações
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }

    // Gerar sessionId se não fornecido
    const finalSessionId = sessionId || `session_${generateId()}`;

    // Obter instância do agente
    const agent = getPharmacyAgent(llmConfig);

    // Processar com ou sem streaming
    if (streaming) {
      // Streaming response
      const streamResult = await agent.streamMessage(finalSessionId, message, context);
      
      // Converter para ReadableStream
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamResult.textStream) {
              const data = JSON.stringify({ 
                type: 'text', 
                content: chunk,
                sessionId: finalSessionId 
              });
              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
            }
            
            // Enviar tool calls se houver
            const toolCalls = await streamResult.toolCalls;
            if (toolCalls && toolCalls.length > 0) {
              for (const toolCall of toolCalls) {
                const data = JSON.stringify({ 
                  type: 'tool_call', 
                  content: toolCall,
                  sessionId: finalSessionId 
                });
                controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
              }
            }
            
            // Finalizar stream
            const endData = JSON.stringify({ 
              type: 'end', 
              sessionId: finalSessionId 
            });
            controller.enqueue(new TextEncoder().encode(`data: ${endData}\n\n`));
            controller.close();
          } catch (error) {
            console.error('Erro no streaming:', error);
            const errorData = JSON.stringify({ 
              type: 'error', 
              content: 'Erro interno do servidor',
              sessionId: finalSessionId 
            });
            controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    } else {
      // Resposta normal (não streaming)
      const response = await agent.processMessage(finalSessionId, message, context);
      
      return NextResponse.json({
        response,
        sessionId: finalSessionId,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Erro na API ai-chat:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// GET - Obter histórico da sessão
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const action = searchParams.get('action');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'SessionId é obrigatório' },
        { status: 400 }
      );
    }

    const agent = getPharmacyAgent();

    switch (action) {
      case 'history':
        const history = agent.getSessionHistory(sessionId);
        return NextResponse.json({ history, sessionId });
      
      case 'context':
        const context = agent.getSessionContext(sessionId);
        return NextResponse.json({ context, sessionId });
      
      case 'config':
        const config = agent.getLLMConfig();
        return NextResponse.json({ config });
      
      default:
        return NextResponse.json(
          { error: 'Ação não suportada. Use: history, context, ou config' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Erro na API ai-chat GET:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE - Limpar sessão
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'SessionId é obrigatório' },
        { status: 400 }
      );
    }

    const agent = getPharmacyAgent();
    agent.clearSession(sessionId);

    return NextResponse.json({ 
      message: 'Sessão limpa com sucesso',
      sessionId 
    });
  } catch (error) {
    console.error('Erro na API ai-chat DELETE:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// PUT - Atualizar configuração do LLM
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { llmConfig } = body;

    if (!llmConfig) {
      return NextResponse.json(
        { error: 'Configuração do LLM é obrigatória' },
        { status: 400 }
      );
    }

    const agent = getPharmacyAgent();
    agent.updateLLMConfig(llmConfig);

    return NextResponse.json({ 
      message: 'Configuração atualizada com sucesso',
      config: agent.getLLMConfig()
    });
  } catch (error) {
    console.error('Erro na API ai-chat PUT:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// OPTIONS - CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}