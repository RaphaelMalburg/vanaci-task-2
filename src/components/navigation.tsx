"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/theme-context";
import { Moon, Sun, Menu, X, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/stores/cart-store";
import { useCartContext } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthForm } from "@/components/auth-form";

const navigation = [
  { name: "Início", href: "/" },
  { name: "Sobre", href: "/about" },
  { name: "Produtos", href: "/products" },
  { name: "Contato", href: "/contact" },
];

export function Navigation() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center transition-colors duration-300">
                <span className="text-white font-bold text-sm">FV</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white transition-colors duration-300">Farmácia Vanaci</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 relative",
                  pathname === item.href
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                )}>
                {item.name}
                {pathname === item.href && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />}
              </Link>
            ))}

            {/* Cart Button */}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden sm:inline">Carrinho</span>
                {itemCount > 0 && (
                  <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-blue-600 text-white border-0">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
              aria-label="Alternar tema">
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Auth Button */}
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Olá, {user.username}</span>
                <Button onClick={logout} variant="outline" size="sm">
                  Sair
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowAuthForm(true)} variant="outline" size="sm">
                Entrar
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Cart Button Mobile */}
            <Link href="/cart">
              <button
                className="relative p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                aria-label="Carrinho">
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs bg-blue-600 text-white border-0">
                    {itemCount}
                  </Badge>
                )}
              </button>
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
              aria-label="Alternar tema">
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
              aria-label="Menu">
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-all duration-300",
                    pathname === item.href
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}>
                  {item.name}
                </Link>
              ))}

              {/* Mobile Auth */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                {user ? (
                  <div className="flex flex-col space-y-2">
                    <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">Olá, {user.username}</span>
                    <Button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      variant="outline"
                      size="sm"
                      className="mx-3">
                      Sair
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      setShowAuthForm(true);
                      setIsMenuOpen(false);
                    }}
                    variant="outline"
                    size="sm"
                    className="mx-3">
                    Entrar
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAuthForm(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md transform transition-all duration-200 scale-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 pb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Autenticação</h2>
              <button
                onClick={() => setShowAuthForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Fechar">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 pb-6">
              <AuthForm onSuccess={() => setShowAuthForm(false)} />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
