"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  const [beams, setBeams] = useState<Array<{ id: number; delay: number; duration: number; repeatDelay: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateBeams = () => {
      const newBeams = [];
      for (let i = 0; i < 6; i++) {
        newBeams.push({
          id: i,
          delay: Math.random() * 2,
          duration: Math.random() * 2 + 1,
          repeatDelay: Math.random() * 2 + 2,
        });
      }
      setBeams(newBeams);
    };

    generateBeams();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-blue-950 dark:via-gray-900 dark:to-blue-900",
        className
      )}
    >
      {beams.map((beam) => (
        <motion.div
          key={beam.id}
          className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
          style={{
            top: `${Math.random() * 100}%`,
          }}
          initial={{ x: "-100%", opacity: 0 }}
          animate={{
            x: "100%",
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: beam.duration,
            delay: beam.delay,
            repeat: Infinity,
            repeatDelay: beam.repeatDelay,
            ease: "linear",
          }}
        />
      ))}
      
      {/* Vertical beams */}
      {beams.slice(0, 3).map((beam) => (
        <motion.div
          key={`vertical-${beam.id}`}
          className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent"
          style={{
            left: `${Math.random() * 100}%`,
          }}
          initial={{ y: "-100%", opacity: 0 }}
          animate={{
            y: "100%",
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: beam.duration + 1,
            delay: beam.delay + 1,
            repeat: Infinity,
            repeatDelay: beam.repeatDelay + 1,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};