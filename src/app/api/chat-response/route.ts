import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, sessionId } = body;

    // Log da resposta recebida para debug
    console.log('Chat response received:', {
      sessionId,
      text: text?.substring(0, 100) + '...', // Log apenas os primeiros 100 caracteres
      timestamp: new Date().toISOString()
    });

    // Validação básica
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Aqui você pode implementar lógica adicional como:
    // - Salvar a resposta no banco de dados
    // - Enviar notificações
    // - Processar analytics
    // - etc.

    // Por enquanto, apenas retornamos sucesso
    return NextResponse.json({
      success: true,
      message: 'Response received successfully',
      sessionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing chat response:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Método GET para verificação de saúde
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'chat-response',
    timestamp: new Date().toISOString()
  });
}