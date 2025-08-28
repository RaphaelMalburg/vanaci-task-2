import { NextRequest, NextResponse } from 'next/server';
import { getPharmacyAgent } from '@/lib/ai-agent';
import { generateId } from '@/lib/ai-agent/utils';

// Configuração para permitir streaming
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST - Processar mensagem do usuário
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API ai-chat: Recebendo requisição POST');
    const body = await request.json();
    console.log('📦 Dados recebidos:', JSON.stringify(body, null, 2));
    
    const { message, sessionId, context, streaming = true, llmConfig } = body;

    // Validações
    if (!message || typeof message !== 'string') {
      console.log('❌ Erro: Mensagem inválida ou ausente');
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }

    // Gerar sessionId se não fornecido
    const finalSessionId = sessionId || generateId();
    console.log('🆔 Session ID:', finalSessionId);
    console.log('📝 Mensagem:', message);
    console.log('🔄 Streaming habilitado:', streaming);

    // Configuração do LLM - usando Google Gemini como padrão
    const finalLlmConfig = llmConfig || {
      provider: 'google' as const,
      temperature: 0.7,
      maxTokens: 2000,
    };
    console.log('⚙️ Configuração LLM:', finalLlmConfig);

    // Obter instância do agente
    console.log('🤖 Criando instância do agente...');
    const agent = getPharmacyAgent(finalLlmConfig);
    console.log('✅ Agente criado com sucesso');

    // Processar com ou sem streaming
    if (streaming) {
      console.log('🌊 Iniciando processamento com streaming...');
      // Streaming response
      const streamResult = await agent.streamMessage(finalSessionId, message, context);
      console.log('📡 Stream result obtido:', !!streamResult);
      
      // Converter para ReadableStream
      const stream = new ReadableStream({
        async start(controller) {
          try {
            console.log('🚀 Iniciando stream para sessão:', finalSessionId);
            console.log('📡 Stream result obtido:', !!streamResult);
            console.log('📡 Stream result keys:', Object.keys(streamResult));

            // Log detalhado do resultado
            if (streamResult.toolCalls) {
              console.log('🔧 Tool calls promise detectado no resultado inicial');
              try {
                const toolCallsResolved = await streamResult.toolCalls;
                console.log('🔧 Tool calls no resultado inicial:', toolCallsResolved?.length || 0);
                if (toolCallsResolved && toolCallsResolved.length > 0) {
                   toolCallsResolved.forEach((tc, index) => {
                     console.log(`🛠️ Tool Call ${index}:`, {
                       toolName: tc.toolName,
                       toolCallId: tc.toolCallId
                     });
                   });
                 }
              } catch (toolError) {
                console.error('❌ Erro ao resolver tool calls iniciais:', toolError);
              }
            }

            let textChunkCount = 0;
            let toolCallCount = 0;
            let hasProcessedToolCalls = false;

            // Processar stream completo incluindo texto após tool calls
            console.log('🌊 Iniciando iteração do fullStream...');
            let chunkIndex = 0;
            for await (const chunk of streamResult.fullStream) {
              chunkIndex++;
              console.log(`🔄 Processando chunk ${chunkIndex} do fullStream:`, {
                type: chunk.type,
                hasText: chunk.type === 'text-delta' ? !!chunk.text : false,
                hasToolCall: chunk.type === 'tool-call' ? !!chunk.toolName : false
              });
              
              if (chunk.type === 'text-delta') {
                textChunkCount++;
                console.log(`📝 Chunk de texto ${textChunkCount}:`, chunk.text);
                const data = JSON.stringify({
                  type: 'text',
                  content: chunk.text,
                  sessionId: finalSessionId,
                  timestamp: new Date().toISOString(),
                });
                controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
              } else if (chunk.type === 'tool-call') {
                toolCallCount++;
                hasProcessedToolCalls = true;
                console.log(`🛠️ Processando tool call ${toolCallCount}:`, {
                    toolName: chunk.toolName,
                    toolCallId: chunk.toolCallId
                  });
                
                try {
                  const toolData = JSON.stringify({
                    type: 'tool_call',
                    toolCall: chunk,
                    sessionId: finalSessionId,
                    timestamp: new Date().toISOString(),
                  });
                  console.log(`📤 Enviando tool call data:`, toolData.substring(0, 200) + '...');
                  controller.enqueue(new TextEncoder().encode(`data: ${toolData}\n\n`));
                  console.log(`✅ Tool call ${toolCallCount} enviado com sucesso`);
                } catch (toolError) {
                  console.error(`❌ Erro ao processar tool call ${toolCallCount}:`, toolError);
                }
              } else if (chunk.type === 'tool-result') {
                console.log(`🔧 Tool result recebido para ${chunk.toolCallId}`);
              }
            }

            console.log(`📊 Total de chunks de texto processados: ${textChunkCount}`);
            console.log(`📊 Total de tool calls processados: ${toolCallCount}`);
            console.log(`🔧 Tool calls foram processados: ${hasProcessedToolCalls}`);
            console.log(`📊 Total de chunks processados: ${chunkIndex}`);
            
            // Detectar stream vazio
            if (chunkIndex === 0) {
              console.log('⚠️ PROBLEMA DETECTADO: Stream está completamente vazio!');
              console.log('⚠️ Isso indica um problema com o modelo LLM ou configuração');
            }

            // Solução híbrida: Se tool calls foram processados mas nenhum texto foi gerado,
            // força uma segunda chamada ao modelo para gerar resposta textual
            if (hasProcessedToolCalls && textChunkCount === 0) {
              console.log('🔄 Implementando solução híbrida: forçando resposta textual após tool calls');
              try {
                const followUpResult = await agent.processMessage(
                  finalSessionId,
                  'Por favor, explique o que foi feito com base nos resultados das ferramentas executadas.',
                  context
                );
                
                if (followUpResult && followUpResult.trim()) {
                  console.log('📝 Resposta textual forçada gerada:', followUpResult.substring(0, 100) + '...');
                  const followUpData = JSON.stringify({
                    type: 'text',
                    content: followUpResult,
                    sessionId: finalSessionId,
                    timestamp: new Date().toISOString(),
                  });
                  controller.enqueue(new TextEncoder().encode(`data: ${followUpData}\n\n`));
                } else {
                  console.log('⚠️ Resposta textual forçada está vazia');
                }
              } catch (followUpError) {
                console.error('❌ Erro ao gerar resposta textual forçada:', followUpError);
                // Enviar uma resposta padrão em caso de erro
                const fallbackData = JSON.stringify({
                  type: 'text',
                  content: 'Ação executada com sucesso! Como posso ajudá-lo mais?',
                  sessionId: finalSessionId,
                  timestamp: new Date().toISOString(),
                });
                controller.enqueue(new TextEncoder().encode(`data: ${fallbackData}\n\n`));
              }
            }

            // Finalizar stream
            console.log('🏁 Finalizando stream');
            const endData = JSON.stringify({
              type: 'end',
              sessionId: finalSessionId,
              timestamp: new Date().toISOString(),
            });
            controller.enqueue(new TextEncoder().encode(`data: ${endData}\n\n`));
            controller.close();
            console.log('✅ Stream finalizado com sucesso');
          } catch (error) {
            console.error('❌ Erro durante streaming:', error);
            console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'Stack não disponível');
            const errorData = JSON.stringify({
              type: 'error',
              error: 'Erro interno do servidor',
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