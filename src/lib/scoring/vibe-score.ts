export function computeVibeScore(
  outputScore: number,
  aiLikelihood: number,
): number {
  const vibeScore = outputScore * (1 + aiLikelihood * 1.5);
  return Math.round(vibeScore * 100) / 100;
}
