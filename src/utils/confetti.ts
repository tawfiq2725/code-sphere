import confetti from "canvas-confetti";

const triggerConfetti = () => {
  confetti({
    particleCount: 1000,
    spread: 300,
    angle: 45,
    origin: { x: 0, y: 1 },
    colors: ["#FF58C5", "#8344FF"], // Updated colors
  });

  confetti({
    particleCount: 1000,
    spread: 300,
    angle: 135,
    origin: { x: 1, y: 1 },
    colors: ["#FF58C5", "#8344FF"], // Updated colors
  });
};

export default triggerConfetti;
