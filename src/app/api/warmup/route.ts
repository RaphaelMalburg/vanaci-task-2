import { NextRequest, NextResponse } from 'next/server';

// Endpoint para warmup da aplicação e evitar cold starts
export async function GET(request: NextRequest) {
  try {
    // Simula uma operação rápida para "aquecer" a aplicação
    const timestamp = new Date().toISOString();
    
    return NextResponse.json({
      status: 'ok',
      message: 'Application warmed up successfully',
      timestamp,
      uptime: process.uptime()
    }, { status: 200 });
  } catch (error) {
    console.error('Warmup error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Warmup failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Também aceita POST para compatibilidade
export async function POST(request: NextRequest) {
  return GET(request);
}