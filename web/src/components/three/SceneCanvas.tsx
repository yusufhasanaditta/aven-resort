"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { cn } from "@/lib/utils";

/** Detects WebGL support once, so we can render a still fallback instead. */
function useWebGL() {
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      setSupported(Boolean(gl));
    } catch {
      setSupported(false);
    }
  }, []);
  return supported;
}

/**
 * Shared R3F canvas.
 *
 * Mounts only on the client, waits for WebGL detection, and renders `fallback`
 * (normally the matching still render) when 3D is unavailable — so the page
 * never shows an empty box.
 */
export function SceneCanvas({
  className,
  fallback,
  children,
  ...props
}: {
  className?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
} & Omit<CanvasProps, "children">) {
  const supported = useWebGL();

  if (supported === false) {
    return <div className={cn("relative", className)}>{fallback}</div>;
  }

  return (
    <div className={cn("relative", className)}>
      {supported === null
        ? fallback
        : (
            <Canvas
              dpr={[1, 1.75]}
              gl={{
                antialias: true,
                powerPreference: "high-performance",
                alpha: true,
              }}
              {...props}
            >
              <Suspense fallback={null}>{children}</Suspense>
            </Canvas>
          )}
    </div>
  );
}
