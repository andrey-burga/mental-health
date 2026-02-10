"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useVelocity,
  useTransform,
} from "framer-motion";

function DraggableBox({
  width = 350,
  height = 350,
  boxSize = 100,
  boxColor = "#273835",
  containerColor = "transparent",
  shape = "cross", // circle | squircle | hexagon | diamond | cross
}) {
  const constraintsRef = useRef(null);

  // motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const velocityX = useVelocity(x);
  const rotate = useTransform(velocityX, [-600, 600], [-25, 25]);

  const shapeStyles = {
    circle: {
      borderRadius: "50%",
    },
    squircle: {
      borderRadius: "22%",
    },
    diamond: {
      transform: "rotate(45deg)",
    },
    hexagon: {
      clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
    },
    cross: {
      clipPath:
        "polygon(30% 0%, 70% 0%, 70% 30%, 100% 30%, 100% 70%, 70% 70%, 70% 100%, 30% 100%, 30% 70%, 0% 70%, 0% 30%, 30% 30%)",
    },
    cross: {
      clipPath:
        "polygon(  40% 0%, 60% 0%,60% 40%, 80% 40%, 80% 60%, 60% 60%,60% 100%, 40% 100%,40% 60%, 20% 60%, 20% 40%, 40% 40%)",
    },
  };

  return (
    <motion.div
      ref={constraintsRef}
      style={{
        width,
        height,
        backgroundColor: containerColor,
        borderRadius: 16,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.35}
        dragMomentum
        dragTransition={{
          bounceStiffness: 600,
          bounceDamping: 18,
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: boxSize,
          height: boxSize,
          backgroundColor: boxColor,
          x,
          y,
          rotate,
          cursor: "grab",
          ...shapeStyles[shape],
        }}
      />
    </motion.div>
  );
}

export default DraggableBox;
