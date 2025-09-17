import { tool } from "ai";
import { z } from "zod";
import type { ToolResult, StoreInfo, Promotion } from "../types";

// Função auxiliar para fazer chamadas à API
async function apiCall(endpoint: string, options: RequestInit = {}) {
  // Usar URL absoluta para funcionar no contexto do servidor
  const BASE_URL = process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_APP_URL || "https://farmacia-vanaci.vercel.app" : "http://localhost:3007";

  const response = await fetch(`${BASE_URL}/api${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// Tool: Mostrar horário de funcionamento
export const showStoreHoursTool = tool({
  description: "Mostra o horário de funcionamento da farmácia",
  inputSchema: z.object({}),
  execute: async (): Promise<ToolResult> => {
    const storeInfo: StoreInfo = {
      hours: "Segunda a Sexta: 8h às 21h\nSábado: 9h às 19h\nDomingo: 10h às 18h",
      phone: "+351 21 123 4567",
      address: "Rua da Saúde, 123 - Centro Histórico, Lisboa - Portugal",
    };

    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay(); // 0 = domingo, 1 = segunda, etc.

    let isOpen = false;
    let nextOpenTime = "";

    if (currentDay >= 1 && currentDay <= 5) {
      // Segunda a sexta
      isOpen = currentHour >= 8 && currentHour < 21;
      if (!isOpen) {
        nextOpenTime = currentHour < 8 ? "Abre às 8h" : "Abre amanhã às 8h";
      }
    } else if (currentDay === 6) {
      // Sábado
      isOpen = currentHour >= 9 && currentHour < 19;
      if (!isOpen) {
        nextOpenTime = currentHour < 9 ? "Abre às 9h" : "Abre domingo às 10h";
      }
    } else {
      // Domingo
      isOpen = currentHour >= 10 && currentHour < 18;
      if (!isOpen) {
        nextOpenTime = currentHour < 10 ? "Abre às 10h" : "Abre segunda às 8h";
      }
    }

    const status = isOpen ? "🟢 ABERTA AGORA" : `🔴 FECHADA - ${nextOpenTime}`;

    const message = `**Farmácia Vanaci** ${status}\n\n**Horários:**\n${storeInfo.hours}\n\n**Contacto:**\n📞 ${storeInfo.phone}\n📍 ${storeInfo.address}`;

    return {
      success: true,
      message,
      data: { ...storeInfo, isOpen, nextOpenTime },
    };
  },
});

// Tool: Mostrar promoções
export const showPromotionsTool = tool({
  description: "Mostra as promoções e ofertas especiais da farmácia",
  inputSchema: z.object({}),
  execute: async (): Promise<ToolResult> => {
    const promotions: Promotion[] = [
      {
        id: "promo1",
        title: "🎯 Primeira Compra",
        description: "15% de desconto na primeira compra",
        discount: 15,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      },
      {
        id: "promo2",
        title: "💊 Vitaminas em Oferta",
        description: "Leve 3 pague 2 em vitaminas selecionadas",
        discount: 33,
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 dias
      },
      {
        id: "promo3",
        title: "🚚 Portes Grátis",
        description: "Portes grátis em compras acima de € 50",
        discount: 0,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      },
      {
        id: "promo4",
        title: "🏥 Desconto Saúde",
        description: "20% off em medicamentos para hipertensão",
        discount: 20,
        validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 dias
      },
    ];

    const activePromotions = promotions.filter((promo) => promo.validUntil > new Date());

    if (activePromotions.length === 0) {
      return {
        success: true,
        message: "Não há promoções ativas no momento. Fique atento às nossas redes sociais para novas ofertas!",
        data: { promotions: [] },
      };
    }

    const promoList = activePromotions
      .map((promo) => {
        const daysLeft = Math.ceil((promo.validUntil.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        const urgency = daysLeft <= 3 ? " ⏰ ÚLTIMOS DIAS!" : "";
        return `${promo.title}${urgency}\n${promo.description}\nVálido por mais ${daysLeft} dias`;
      })
      .join("\n\n");

    const message = `**🎉 Promoções Ativas:**\n\n${promoList}\n\n💡 Use os códigos: PRIMEIRACOMPRA, SAUDE20, DESCONTO10`;

    return {
      success: true,
      message,
      data: { promotions: activePromotions },
    };
  },
});

// Tool: Contatar farmacêutico
export const contactPharmacistTool = tool({
  description: "Conecta o usuário com um farmacêutico para dúvidas específicas",
  inputSchema: z.object({
    query: z.string().describe("Dúvida ou pergunta para o farmacêutico"),
    urgency: z.enum(["baixa", "media", "alta"]).default("media").describe("Nível de urgência da consulta"),
  }),
  execute: async ({ query, urgency }: { query: string; urgency: "baixa" | "media" | "alta" }) => {
    try {
      const result = await apiCall("/pharmacy/consult", {
        method: "POST",
        body: JSON.stringify({ query, urgency }),
      });

      return {
        ...result,
        message: "Consulta enviada ao farmacêutico com sucesso!",
      };
    } catch (error) {
      throw new Error(`Erro ao enviar consulta: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  },
});

// Tool: Informações sobre receita médica
export const prescriptionInfoTool = tool({
  description: "Fornece informações sobre como enviar receitas médicas",
  inputSchema: z.object({}),
  execute: async (): Promise<ToolResult> => {
    const message =
      `**📋 Como Enviar sua Receita Médica:**\n\n` +
      `**1. Foto da Receita:**\n` +
      `• Tire uma foto clara e legível\n` +
      `• Certifique-se que todas as informações estão visíveis\n` +
      `• Inclua o carimbo e assinatura do médico\n\n` +
      `**2. Formas de Envio:**\n` +
      `• WhatsApp: (11) 9876-5432\n` +
      `• Email: receitas@vanaci.com.br\n` +
      `• Upload no site durante o checkout\n\n` +
      `**3. Medicamentos Controlados:**\n` +
      `• Receita original obrigatória\n` +
      `• Entrega apenas para o paciente ou responsável\n` +
      `• Documento com foto necessário\n\n` +
      `**4. Prazo de Validade:**\n` +
      `• Receita simples: 30 dias\n` +
      `• Receita controlada: varia por medicamento\n\n` +
      `**5. Dúvidas?**\n` +
      `Entre em contato com nosso farmacêutico!`;

    return {
      success: true,
      message,
      data: {
        uploadMethods: ["whatsapp", "email", "website"],
        contacts: {
          whatsapp: "(11) 9876-5432",
          email: "receitas@vanaci.com.br",
        },
        requirements: {
          controlled: "Receita original + documento com foto",
          simple: "Foto da receita",
        },
      },
    };
  },
});

// Tool: Programa de fidelidade
export const loyaltyProgramTool = tool({
  description: "Informações sobre o programa de fidelidade da farmácia",
  inputSchema: z.object({}),
  execute: async (): Promise<ToolResult> => {
    const message =
      `**🎁 Programa Vanaci Fidelidade:**\n\n` +
      `**Como Funciona:**\n` +
      `• Ganhe 1 ponto a cada R$ 1,00 gasto\n` +
      `• 100 pontos = R$ 10,00 de desconto\n` +
      `• Pontos não expiram\n\n` +
      `**Benefícios Exclusivos:**\n` +
      `• 🎂 Desconto especial no aniversário (20%)\n` +
      `• 📧 Ofertas exclusivas por email\n` +
      `• 🚚 Frete grátis em compras acima de R$ 80\n` +
      `• 💊 Lembretes de medicação\n\n` +
      `**Níveis do Programa:**\n` +
      `• 🥉 Bronze (0-499 pontos): 1x pontos\n` +
      `• 🥈 Prata (500-999 pontos): 1.5x pontos\n` +
      `• 🥇 Ouro (1000+ pontos): 2x pontos\n\n` +
      `**Como Participar:**\n` +
      `Cadastre-se gratuitamente em nosso site ou app!`;

    return {
      success: true,
      message,
      data: {
        pointsRatio: 1, // 1 ponto por € 1
        redeemRatio: 0.1, // € 0.10 por ponto
        levels: {
          bronze: { min: 0, max: 499, multiplier: 1 },
          silver: { min: 500, max: 999, multiplier: 1.5 },
          gold: { min: 1000, max: null, multiplier: 2 },
        },
        benefits: ["Desconto aniversário 20%", "Ofertas exclusivas", "Portes grátis € 40+", "Lembretes medicação"],
      },
    };
  },
});

// Exportar todas as tools extras
export const extraTools = {
  show_store_hours: showStoreHoursTool,
  show_promotions: showPromotionsTool,
  contact_pharmacist: contactPharmacistTool,
  prescription_info: prescriptionInfoTool,
  loyalty_program: loyaltyProgramTool,
};
