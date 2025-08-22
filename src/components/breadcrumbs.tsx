"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Mapeamento de rotas para nomes em português
const routeNames: Record<string, string> = {
  "/": "Início",
  "/about": "Sobre",
  "/products": "Produtos",
  "/contact": "Contato",
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Se items não for fornecido, gerar automaticamente baseado na rota atual
  const breadcrumbItems = items || generateBreadcrumbs(pathname);

  if (breadcrumbItems.length <= 1) {
    return null; // Não mostrar breadcrumbs na página inicial
  }

  return (
    <nav 
      className={cn(
        "flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 py-4",
        className
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight 
                  className="w-4 h-4 mx-2 text-gray-400 dark:text-gray-500" 
                  aria-hidden="true"
                />
              )}
              
              {isLast ? (
                <span 
                  className="font-medium text-gray-900 dark:text-gray-100 flex items-center"
                  aria-current="page"
                >
                  {index === 0 && <Home className="w-4 h-4 mr-1" />}
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center"
                >
                  {index === 0 && <Home className="w-4 h-4 mr-1" />}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Início", href: "/" }
  ];

  let currentPath = "";
  
  paths.forEach((path) => {
    currentPath += `/${path}`;
    const label = routeNames[currentPath] || capitalizeFirst(path);
    breadcrumbs.push({
      label,
      href: currentPath
    });
  });

  return breadcrumbs;
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Componente de breadcrumbs com container
export function BreadcrumbsContainer({ 
  items, 
  className 
}: BreadcrumbsProps) {
  return (
    <div className={cn(
      "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
      className
    )}>
      <Breadcrumbs items={items} />
    </div>
  );
}