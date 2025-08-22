"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  overlay?: boolean;
  className?: string;
}

export function Loading({ 
  size = "md", 
  text = "Carregando...", 
  overlay = false, 
  className 
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  const LoadingContent = () => (
    <div className={cn(
      "flex items-center justify-center space-x-3",
      overlay ? "loading-content" : "",
      className
    )}>
      <Loader2 className={cn(
        "animate-spin text-blue-600 dark:text-blue-400",
        sizeClasses[size]
      )} />
      {text && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {text}
        </span>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        <LoadingContent />
      </div>
    );
  }

  return <LoadingContent />;
}

// Componente de loading inline para botões
export function ButtonLoading({ className }: { className?: string }) {
  return (
    <Loader2 className={cn(
      "w-4 h-4 animate-spin",
      className
    )} />
  );
}

// Componente de skeleton loading
export function SkeletonLoader({ 
  lines = 3, 
  className 
}: { 
  lines?: number; 
  className?: string; 
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

// Hook para gerenciar estados de loading
import { useState } from "react";

export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);
  
  const withLoading = async <T,>(fn: () => Promise<T>): Promise<T> => {
    startLoading();
    try {
      const result = await fn();
      return result;
    } finally {
      stopLoading();
    }
  };

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading
  };
}