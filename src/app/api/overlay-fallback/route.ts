import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Lightweight fallback API to supply overlay products based on a user query.
 * This route is a minimal, client-friendly helper to enrich the overlay
 * when no direct results are found.
 */

// Lightweight product type for the overlay data
type ProductFallback = {
  id: string;
  name: string;
  price: number;
  category?: string;
  image?: string;
  description?: string;
};

// Simple mapping of common symptoms/requests to sample products.
// Images reference the public folder (served from /public in Next.js).
function getFallbackForQuery(query: string): ProductFallback[] {
  const q = (query ?? "").toLowerCase();

  // Common symptom-focused results
  const dorProdutos: ProductFallback[] = [
    {
      id: "p_paracetamol_500",
      name: "Paracetamol 500mg",
      price: 2.99,
      category: "Analgesico",
      image: "/imagensRemedios/Paracetamol-500-mg-Dor-e-Febre.png",
      description: "Dor leve a moderada e febre",
    },
    {
      id: "p_ibuprofeno_200",
      name: "Ibuprofeno 200mg",
      price: 3.49,
      category: "Analgesico",
      image: "/imagensRemedios/Ibuprofeno-200-mg-Farmoz.png",
      description: "Alívio rápido de dor e inflamação",
    },
    {
      id: "p_daflon_500",
      name: "Daflon 500mg",
      price: 12.99,
      category: "Venos",
      image: "/imagensRemedios/Daflon-500-mg.png",
      description: "Suplemento para circulação",
    },
  ];

  // General/semelhante a sintomas sem correspondência exata
  const outros: ProductFallback[] = [
    {
      id: "p_nurofen",
      name: "Nurofen Xpress 200mg",
      price: 4.99,
      category: "Analgesico",
      image: "/imagensRemedios/Nurofen-Xpress-Cápsulas-Moles-Dor-e-Febre.png",
      description: "Dor e febre, ação rápida",
    },
    {
      id: "p_aspirina",
      name: "Aspirina 500mg",
      price: 2.49,
      category: "Analgesico",
      image: "/imagensRemedios/Aspirina-Express.png",
      description: "Dor leve a moderada",
    },
  ];

  // Se o usuário descreve dor ou sintomas, retorna dor específicos
  if (q.includes("dor") || /dor|dor-de-cabeça|dor-no-joelho|dor muscular/.test(q)) {
    return dorProdutos;
  }

  // Caso genérico: retornar alguns itens populares
  if (q.length > 0) {
    return outros;
  }

  // Caso sem query, fornecemos uma lista mínima de fallback
  return [
    {
      id: "p_paracetamol_500",
      name: "Paracetamol 500mg",
      price: 2.99,
      category: "Analgesico",
      image: "/imagensRemedios/Paracetamol-500-mg-Dor-e-Febre.png",
      description: "Dor leve",
    },
  ];
}

// API handler
export async function GET(request: NextRequest) {
  const q = request.nextUrl?.searchParams.get("query") ?? "";
  const products = getFallbackForQuery(q);
  return NextResponse.json({ products });
}

// Puedes adicionar um POST se quiser aceitar dados customizados no futuro
