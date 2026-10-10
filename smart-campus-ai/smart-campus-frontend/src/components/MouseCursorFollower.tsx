import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export function MouseCursorFollower() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    // Handle high DPI resize
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Mouse coordinates & state
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let isMoving = false;
    let isClicking = false;
    let currentRadius = 14;
    let targetRadius = 14;
    let moveTimeout: NodeJS.Timeout;

    const particles: Particle[] = [];
    const colors = ["#9333ea", "#e11d48", "#f59e0b", "#6366f1", "#ec4899"];

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      // When cursor first enters or jumps
      if (currentX < 0) {
        currentX = targetX;
        currentY = targetY;
      }

      isMoving = true;
      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => {
        isMoving = false;
      }, 100);

      // Spawn minute subtle particles while moving
      if (Math.random() < 0.65) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.8 + 0.2;
        particles.push({
          x: targetX + (Math.random() - 0.5) * 6,
          y: targetY + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2 + 1.2, // Very minute small particle
          alpha: 0.75,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const onMouseDown = () => {
      isClicking = true;
      targetRadius = 7; // Smoothly shrink on click
    };

    const onMouseUp = () => {
      isClicking = false;
      targetRadius = 14; // Smoothly expand back on release
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth lag / interpolation for circle following mouse
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      currentRadius += (targetRadius - currentRadius) * 0.22;

      // Update & Draw Particles (only released when mouse moved)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.022; // Smooth fade-out
        p.size *= 0.96; // Gently shrink

        if (p.alpha <= 0 || p.size <= 0.3) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Main Following Circle (outer ring + center tiny core)
      if (currentX > 0 && currentY > 0) {
        ctx.save();
        
        // Outer smooth ring
        ctx.beginPath();
        ctx.arc(currentX, currentY, Math.max(currentRadius, 3), 0, Math.PI * 2);
        ctx.strokeStyle = isClicking ? "rgba(225, 29, 72, 0.75)" : "rgba(147, 51, 234, 0.65)";
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Inner soft dot
        ctx.beginPath();
        ctx.arc(targetX, targetY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isClicking ? "#e11d48" : "#9333ea";
        ctx.fill();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(moveTimeout);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ pointerEvents: "none" }}
    />
  );
}
