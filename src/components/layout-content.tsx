"use client";

import { useChatContext } from "@/components/chat";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isChatOpen } = useChatContext();
  
  return (
    <div className={`transition-all duration-300 ease-in-out ${
      isChatOpen ? 'mr-[400px] sm:mr-[500px]' : 'mr-0'
    }`}>
      {children}
    </div>
  );
}