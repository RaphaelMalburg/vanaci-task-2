"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Product } from "@/lib/types";

interface OverlayState {
  isOpen: boolean;
  isLoading: boolean;
  title?: string;
  query?: string;
  products: Product[];
}

interface ProductOverlayContextValue extends OverlayState {
  showLoading: (opts?: { title?: string; query?: string }) => void;
  showProducts: (opts: { title?: string; query?: string; products: Product[] }) => void;
  hide: () => void;
}

const ProductOverlayContext = createContext<ProductOverlayContextValue | undefined>(undefined);

export function useProductOverlay() {
  const ctx = useContext(ProductOverlayContext);
  if (!ctx) {
    throw new Error("useProductOverlay must be used within ProductOverlayProvider");
  }
  return ctx;
}

export function ProductOverlayProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OverlayState>({
    isOpen: false,
    isLoading: false,
    title: undefined,
    query: undefined,
    products: [],
  });

  const showLoading = useCallback((opts?: { title?: string; query?: string }) => {
    setState((prev) => ({
      ...prev,
      isOpen: true,
      isLoading: true,
      title: opts?.title ?? prev.title,
      query: opts?.query ?? prev.query,
      products: [],
    }));
  }, []);

  const showProducts = useCallback((opts: { title?: string; query?: string; products: Product[] }) => {
    setState({
      isOpen: true,
      isLoading: false,
      title: opts.title,
      query: opts.query,
      products: opts.products || [],
    });
  }, []);

  const hide = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const value = useMemo<ProductOverlayContextValue>(
    () => ({ ...state, showLoading, showProducts, hide }),
    [state, showLoading, showProducts, hide]
  );

  return (
    <ProductOverlayContext.Provider value={value}>{children}</ProductOverlayContext.Provider>
  );
}

