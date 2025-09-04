import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Chat, ChatProvider } from "@/components/chat";
import { ThemeProvider } from "@/contexts/theme-context";
import { CartProvider } from "@/contexts/cart-context";
import { AuthProvider } from "@/contexts/auth-context";
import { LayoutContent } from "@/components/layout-content";
import { GlobalCart } from "@/components/global-cart";
import { CartSyncProvider } from "@/components/cart-sync-provider";
import { CartInitializer } from "@/components/cart-initializer";
import { ProductOverlayProvider } from "@/contexts/product-overlay-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Farmácia Vanaci - Seu Parceiro de Confiança em Saúde",
  description: "Uma farmácia moderna oferecendo produtos e serviços de saúde de qualidade para nossa comunidade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}
      >
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <CartSyncProvider>
                <CartInitializer>
                  <ProductOverlayProvider>
                    <ChatProvider>
                    <LayoutContent>
                      <Navigation />
                      <main className="min-h-screen">
                        {children}
                      </main>
                    </LayoutContent>
                    <Chat />
                    <GlobalCart />
                    </ChatProvider>
                  </ProductOverlayProvider>
                </CartInitializer>
              </CartSyncProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
