"use client";

import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useVelocity,
  useTransform,
} from "framer-motion";

// Definimos los tipos de figuras disponibles para autocompletado y seguridad
export type BoxShape = "circle" | "squircle" | "hexagon" | "diamond" | "cross" | "crossAlt";

interface DraggableBoxProps {
  width?: string | number;
  height?: string | number;
  boxSize?: number;
  boxColor?: string;
  containerColor?: string;
  shape?: BoxShape;
  showGrid?: boolean; // Nueva opción para mostrar una cuadrícula guía de fondo
}

function DraggableBox({
  width = 350,
  height = 350,
  boxSize = 100,
  boxColor = "#3b82f6", // Azul por defecto (Primary)
  containerColor = "transparent",
  shape = "cross",
  showGrid = true,
}: DraggableBoxProps) {
  const constraintsRef = useRef<HTMLDivElement>(null);

  // Valores de movimiento de Framer Motion
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Capturamos la velocidad en el eje X para inclinar la figura al arrastrarla
  const velocityX = useVelocity(x);
  const rotate = useTransform(velocityX, [-600, 600], [-25, 25]);

  // Estilos de figuras optimizados para no interferir con las transformaciones 3D de Motion
  const shapeStyles: Record<BoxShape, React.CSSProperties> = {
    circle: {
      borderRadius: "50%",
    },
    squircle: {
      borderRadius: "24%",
    },
    diamond: {
      // Solución: Usar clipPath en vez de transform: rotate(45deg) evita que se rompa con la física de rotación
      clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
    },
    hexagon: {
      clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
    },
    cross: {
      clipPath:
        "polygon(30% 0%, 70% 0%, 70% 30%, 100% 30%, 100% 70%, 70% 70%, 70% 100%, 30% 100%, 30% 70%, 0% 70%, 0% 30%, 30% 30%)",
    },
    crossAlt: {
      clipPath:
        "polygon(40% 0%, 60% 0%, 60% 40%, 80% 40%, 80% 60%, 60% 60%, 60% 100%, 40% 100%, 40% 60%, 20% 60%, 20% 40%, 40% 40%)",
    },
  };

  return (
    <motion.div
      ref={constraintsRef}
      className="border border-dashed border-gray-200 dark:border-neutral-800/80 shadow-inner flex items-center justify-center transition-colors duration-300"
      style={{
        width,
        height,
        backgroundColor: containerColor,
        borderRadius: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Rejilla de fondo decorativa e interactiva */}
      {showGrid && (
        <div className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]" />
      )}

      {/* Caja/Figura arrastrable */}
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.25} // Ajuste sutil para hacerlo sentir más gomoso pero controlado
        dragMomentum
        dragTransition={{
          bounceStiffness: 500,
          bounceDamping: 22,
        }}
        whileHover={{ scale: 1.06, filter: "brightness(1.05)" }}
        whileTap={{ scale: 0.94, cursor: "grabbing" }}
        style={{
          width: boxSize,
          height: boxSize,
          backgroundColor: boxColor,
          x,
          y,
          rotate,
          cursor: "grab",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          ...shapeStyles[shape],
        }}
        className="active:shadow-2xl transition-shadow duration-200 relative z-10"
      />
    </motion.div>
  );
}

export default DraggableBox;