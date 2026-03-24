interface PrFileInput {
  filename: string;
  additions: number;
  deletions: number;
  isGenerated: boolean;
}

interface PrInput {
  additions: number;
  deletions: number;
  changedFiles: number;
  files: PrFileInput[];
}

const MAX_OUTPUT_SCORE = 10;

export function computeOutputScore(pr: PrInput): number {
  const meaningfulFiles = pr.files.filter((f) => !f.isGenerated);

  const meaningfulAdditions = meaningfulFiles.reduce(
    (sum, f) => sum + f.additions,
    0,
  );
  const meaningfulDeletions = meaningfulFiles.reduce(
    (sum, f) => sum + f.deletions,
    0,
  );
  const meaningfulFilesCount = meaningfulFiles.length;

  const base = Math.log10(1 + meaningfulAdditions + meaningfulDeletions * 0.5);
  const fileBonus = Math.log10(1 + meaningfulFilesCount) * 0.3;
  const score = base + fileBonus;

  return Math.min(score, MAX_OUTPUT_SCORE);
}
