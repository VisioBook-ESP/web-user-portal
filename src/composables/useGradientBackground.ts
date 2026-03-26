import { computed } from "vue";

const gradientColors = [
  "rgba(255, 255, 255, 0.4)",
  "rgba(254, 245, 234, 0.4)",
  "rgba(231, 246, 255, 0.4)",
  "rgba(227, 237, 248, 0.4)",
  "rgba(250, 245, 255, 0.4)",
  "rgba(255, 237, 250, 0.4)",
  "rgba(255, 237, 250, 0.4)",
];

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function useGradientBackground() {
  const generateGradient = () => {
    const shuffledColors = shuffleArray(gradientColors);
    const angle = Math.floor(Math.random() * 360);
    return `linear-gradient(${angle}deg, ${shuffledColors.join(", ")})`;
  };

  const gradientStyle = computed(() => ({
    background: generateGradient(),
    minHeight: "100vh",
  }));

  return {
    gradientStyle,
    generateGradient,
  };
}
