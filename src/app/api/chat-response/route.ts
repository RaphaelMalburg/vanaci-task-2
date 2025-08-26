import { NextRequest, NextResponse } from 'next/server';

// Armazenamento temporário de respostas em memória
const responseStore = new Map<string, { text: string; timestamp: number }>();

// Limpar respostas antigas (mais de 5 minutos)
const cleanOldResponses = () => {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  for (const [sessionId, response] of responseStore.entries()) {
    if (response.timestamp < fiveMinutesAgo) {
      responseStore.delete(sessionId);
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, sessionId } = body;
    
    console.log('📨 Resposta recebida do n8n:', {
      sessionId,
      text,
      timestamp: new Date().toISOString()
    });
    
    // Armazenar a resposta
    responseStore.set(sessionId, {
      text,
      timestamp: Date.now()
    });
    
    // Limpar respostas antigas
    cleanOldResponses();
    
    return NextResponse.json({ 
      success: true,
      message: 'Resposta recebida e armazenada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao processar resposta do n8n:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId é obrigatório' },
        { status: 400 }
      );
    }
    
    const response = responseStore.get(sessionId);
    
    if (response) {
      // Remover a resposta após ser consumida
      responseStore.delete(sessionId);
      
      console.log('✅ Resposta recuperada para sessionId:', sessionId);
      
      return NextResponse.json({
        success: true,
        text: response.text,
        timestamp: response.timestamp
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Nenhuma resposta disponível'
      });
    }
  } catch (error) {
    console.error('❌ Erro ao recuperar resposta:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}