"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color?: string;
}

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  const mousePos = useRef({ x: -2000, y: -2000 });
  const smoothedMouse = useRef({ x: -2000, y: -2000 });

  const { theme, resolvedTheme } = useTheme();
  const particles = useRef<Particle[]>([]);
  const blobs = useRef<Particle[]>([]);
  const animationFrameId = useRef<number>(0);

  const currentTheme = resolvedTheme || theme;

  const initParticles = (width: number, height: number) => {
    // Stars for dark mode
    const particleCount = Math.floor((width * height) / 10000);
    particles.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 1.5 + 1.2,
    }));

    // Blobs for light mode - ENHANCED VISIBILITY
    blobs.current = Array.from({ length: 6 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.12, // Even slower for elegance
      vy: (Math.random() - 0.5) * 0.12,
      size: Math.random() * 250 + 250, // 250px - 500px large
      color: `hsla(${230 + Math.random() * 50}, 85%, 65%, 0.18)`, // More vibrant & opaque
    }));
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };

    const draw = () => {
      smoothedMouse.current.x +=
        (mousePos.current.x - smoothedMouse.current.x) * 0.08;
      smoothedMouse.current.y +=
        (mousePos.current.y - smoothedMouse.current.y) * 0.08;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isDark = currentTheme === "dark";

      // Theme-specific UI updates
      if (gridRef.current) {
        gridRef.current.style.webkitMaskImage = `radial-gradient(circle at ${smoothedMouse.current.x}px ${smoothedMouse.current.y}px, black 0%, transparent ${isDark ? "400px" : "650px"})`;
        gridRef.current.style.opacity = "0.3";
      }
      if (haloRef.current) {
        haloRef.current.style.background = `radial-gradient(${isDark ? "400px" : "900px"} circle at ${smoothedMouse.current.x}px ${smoothedMouse.current.y}px, ${isDark ? "var(--primary)" : "white"}, transparent 100%)`;
        haloRef.current.style.opacity = "0.08";
      }

      if (isDark) {
        // --- DARK MODE: STAR FIELD ---
        const particleColor = "rgba(255, 255, 255, 0.25)";
        const highlightColor = "rgba(255, 255, 255, 0.55)";

        particles.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

          const dx = smoothedMouse.current.x - p.x;
          const dy = smoothedMouse.current.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          ctx.fillStyle = distance < 250 ? highlightColor : particleColor;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        // --- LIGHT MODE: FLOATING MESH BLOBS ---
        blobs.current.forEach((b) => {
          b.x += b.vx;
          b.y += b.vy;
          if (b.x < -b.size || b.x > canvas.width + b.size) b.vx *= -1;
          if (b.y < -b.size || b.y > canvas.height + b.size) b.vy *= -1;

          // Mouse proximity influence (stronger in light mode for more life)
          const dx = mousePos.current.x - b.x;
          const dy = mousePos.current.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 1200) {
            b.x += dx * 0.00015;
            b.y += dy * 0.00015;
          }

          const gradient = ctx.createRadialGradient(
            b.x,
            b.y,
            0,
            b.x,
            b.y,
            b.size
          );
          gradient.addColorStop(0, b.color || "rgba(0,0,0,0)");
          gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        });
      }

      animationFrameId.current = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [currentTheme]);

  return (
    <div className="fixed inset-0 -z-10 h-full w-full bg-background overflow-hidden pointer-events-none">
      <div
        ref={gridRef}
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--border) 1.2px, transparent 1.2px),
            linear-gradient(to bottom, var(--border) 1.2px, transparent 1.2px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      <div
        ref={haloRef}
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full pointer-events-none transition-opacity duration-1000"
      />
    </div>
  );
}
