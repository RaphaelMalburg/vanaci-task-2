"use client";
import React, { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SparklesProps {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  particleColor?: string;
  children?: React.ReactNode;
}

export const Sparkles: React.FC<SparklesProps> = ({
  id,
  className,
  background = "transparent",
  minSize = 0.4,
  maxSize = 1.0,
  particleDensity = 1200,
  particleColor = "#3b82f6",
  children,
}) => {
  const sparklesId = useId();
  const actualId = id || sparklesId;

  const generateSparkles = () => {
    const sparkles = [];
    for (let i = 0; i < particleDensity; i++) {
      const size = Math.random() * (maxSize - minSize) + minSize;
      sparkles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size,
        delay: Math.random() * 2,
        duration: Math.random() * 2 + 1,
      });
    }
    return sparkles;
  };

  const sparkles = generateSparkles();

  return (
    <div className={cn("relative", className)} style={{ background }}>
      <div className="absolute inset-0 overflow-hidden">
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute rounded-full"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
              backgroundColor: particleColor,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: sparkle.duration,
              delay: sparkle.delay,
              repeat: Infinity,
              repeatDelay: Math.random() * 2 + 1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      {children}
    </div>
  );
};

export default Sparkles;