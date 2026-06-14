// components/CometCursorClient.tsx
"use client";
import { useEffect } from "react";

/**
 * Realistic comet cursor with a glowing head and a fading tail.
 * The cursor follows the mouse using a smooth lerp, and the tail consists of
 * several elements that gradually shrink and fade, mimicking a true comet.
 */
export default function CometCursorClient() {
  useEffect(() => {
    // Preserve original cursor style
    const originalCursor = document.body.style.cursor;
    document.body.style.cursor = "none";

    // Ensure we only create one instance
    if (document.getElementById("comet-cursor-container")) {
      return () => {
        document.body.style.cursor = originalCursor;
      };
    }

    // Container for the whole comet (head + tail)
    const container = document.createElement("div");
    container.id = "comet-cursor-container";
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.pointerEvents = "none";
    container.style.zIndex = "9999";
    document.body.appendChild(container);

    const trailLength = 12; // number of tail elements
    const tail: HTMLElement[] = [];
    // Create tail elements with fiery asteroid style
    for (let i = 0; i < trailLength; i++) {
      const el = document.createElement("div");
      el.className = "asteroid-tail-element";
      // Size decreases from head (20px) to tail (6px) for a smaller, realistic look
      const maxSize = 20;
      const minSize = 6;
      const size = maxSize - i * ((maxSize - minSize) / (trailLength - 1));
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      // Randomized irregular rock shape
      const br1 = 30 + Math.random() * 20; // 30-50%
      const br2 = 70 - Math.random() * 20; // 50-70%
      const br3 = 30 + Math.random() * 20; // 30-50%
      const br4 = 70 - Math.random() * 20; // 50-70%
      const brV1 = 30 + Math.random() * 20; // vertical radii
      const brV2 = 30 + Math.random() * 20;
      const brV3 = 70 - Math.random() * 20;
      const brV4 = 70 - Math.random() * 20;
      el.style.borderRadius = `${br1}% ${br2}% ${br3}% ${br4}% / ${brV1}% ${brV2}% ${brV3}% ${brV4}%`;
      // Fiery gradient for asteroid flame
      el.style.background = "radial-gradient(circle at 30% 30%, hsl(30, 100%, 70%), hsl(0, 80%, 50%))";
      // Flickering glow
      el.style.boxShadow = "0 0 12px 4px hsla(30,100%,60%,0.8)";
      // Opacity fades out along the tail
      el.style.opacity = `${1 - i / trailLength}`;
      // Slight blur for flame effect
      el.style.filter = "blur(1px)";
      // Center the element on its coordinates
      el.style.transform = "translate(-50%, -50%)";
      container.appendChild(el);
      tail.push(el);
    }

    // Mouse tracking
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const moveHandler = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };
    window.addEventListener("mousemove", moveHandler);

    // Hide cursor when leaving the window
    const hide = () => {
      tail.forEach((el) => (el.style.opacity = "0"));
    };
    const show = () => {
      tail.forEach((el, i) => (el.style.opacity = `${1 - i / trailLength}`));
    };
    window.addEventListener("mouseleave", hide);
    window.addEventListener("mouseenter", show);

    // Animation loop – lerp the head and copy positions down the tail
    const ease = 0.15;
    const positions = Array.from({ length: trailLength }, () => ({ x: target.x, y: target.y }));
    const animate = () => {
      // Move head smoothly towards target
      positions[0].x += (target.x - positions[0].x) * ease;
      positions[0].y += (target.y - positions[0].y) * ease;
      // Propagate positions down the tail
      for (let i = 1; i < trailLength; i++) {
        positions[i].x += (positions[i - 1].x - positions[i].x) * ease;
        positions[i].y += (positions[i - 1].y - positions[i].y) * ease;
      }
      // Apply to DOM elements
      tail.forEach((el, i) => {
        // Compute direction of movement (head to target)
        const dx = target.x - positions[0].x;
        const dy = target.y - positions[0].y;
        const angle = Math.atan2(dy, dx);
        // Perpendicular offset grows with index to create a gentle curve
        const offsetMagnitude = (i - trailLength / 2) * 3; // tweak for curvature
        const offsetX = Math.cos(angle + Math.PI / 2) * offsetMagnitude;
        const offsetY = Math.sin(angle + Math.PI / 2) * offsetMagnitude;
        const x = positions[i].x + offsetX;
        const y = positions[i].y + offsetY;
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      });
      requestAnimationFrame(animate);
    };
    animate();

    // Cleanup on unmount
    return () => {
      window.removeEventListener("mousemove", moveHandler);
      window.removeEventListener("mouseleave", hide);
      window.removeEventListener("mouseenter", show);
      container.remove();
      document.body.style.cursor = originalCursor;
    };
  }, []);

  // No JSX – pure DOM side effect
  return null;
}
