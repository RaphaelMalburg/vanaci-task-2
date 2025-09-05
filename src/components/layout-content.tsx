"use client";

import { useChatContext } from "@/components/chat";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isChatOpen } = useChatContext();
  
  return (
    <div className={`transition-all duration-300 ease-in-out ${
      isChatOpen ? 'sm:mr-[400px] md:mr-[500px]' : 'mr-0'
    }`}>
      {children}
    </div>
  );
}