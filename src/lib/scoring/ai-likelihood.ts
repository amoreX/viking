interface PrFileInput {
  filename: string;
  additions: number;
  deletions: number;
  status: string;
  isGenerated: boolean;
}

interface PrInput {
  additions: number;
  deletions: number;
  changedFiles: number;
  commitCount: number;
  files: PrFileInput[];
}

const SCAFFOLDING_PATTERNS = [
  /\/components\//,
  /\/utils\//,
  /\/helpers\//,
  /\.test\./,
  /\.spec\./,
  /index\.[jt]sx?$/,
  /__tests__\//,
  /\.stories\./,
];

function standardDeviation(values: number[]): number {
  if (values.length <= 1) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => (v - mean) ** 2);
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

function getExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

export function computeAILikelihood(pr: PrInput): number {
  const meaningfulFiles = pr.files.filter((f) => !f.isGenerated);
  const meaningfulAdditions = meaningfulFiles.reduce(
    (sum, f) => sum + f.additions,
    0,
  );
  const meaningfulDeletions = meaningfulFiles.reduce(
    (sum, f) => sum + f.deletions,
    0,
  );
  const totalMeaningfulLines = meaningfulAdditions + meaningfulDeletions;

  let score = 0;

  // High additions-to-commits ratio (large PR, few commits = one-shot generation)
  if (pr.commitCount > 0) {
    const additionsPerCommit = meaningfulAdditions / pr.commitCount;
    if (additionsPerCommit > 200) {
      score += 0.2;
    } else if (additionsPerCommit > 100) {
      score += 0.1;
    }
  }

  // Many files created (status="added") in one PR
  const addedFiles = meaningfulFiles.filter((f) => f.status === "added");
  if (addedFiles.length >= 8) {
    score += 0.15;
  } else if (addedFiles.length >= 4) {
    score += 0.08;
  }

  // High uniformity: similar additions across files (low std deviation relative to mean)
  if (meaningfulFiles.length >= 3) {
    const additionValues = meaningfulFiles.map((f) => f.additions);
    const mean =
      additionValues.reduce((a, b) => a + b, 0) / additionValues.length;
    const stdDev = standardDeviation(additionValues);
    if (mean > 0 && stdDev / mean < 0.3) {
      score += 0.15;
    } else if (mean > 0 && stdDev / mean < 0.5) {
      score += 0.08;
    }
  }

  // Many scaffolding-like files
  const scaffoldingCount = meaningfulFiles.filter((f) =>
    SCAFFOLDING_PATTERNS.some((p) => p.test(f.filename)),
  ).length;
  if (scaffoldingCount >= 5) {
    score += 0.1;
  } else if (scaffoldingCount >= 3) {
    score += 0.05;
  }

  // Large total additions (>500 meaningful lines)
  if (meaningfulAdditions > 500) {
    score += 0.1;
  } else if (meaningfulAdditions > 250) {
    score += 0.05;
  }

  // Many similarly-named files (e.g., multiple .tsx or .test. files)
  const extCounts = new Map<string, number>();
  for (const f of meaningfulFiles) {
    const ext = getExtension(f.filename);
    if (ext) {
      extCounts.set(ext, (extCounts.get(ext) ?? 0) + 1);
    }
  }
  const maxExtCount = Math.max(0, ...Array.from(extCounts.values()));
  if (maxExtCount >= 5) {
    score += 0.1;
  } else if (maxExtCount >= 3) {
    score += 0.05;
  }

  // --- Decrease signals ---

  // Very small surgical changes (<20 lines, 1-2 files)
  if (totalMeaningfulLines < 20 && meaningfulFiles.length <= 2) {
    score -= 0.2;
  }

  // High deletion ratio (refactoring, not generation)
  if (totalMeaningfulLines > 0) {
    const deletionRatio = meaningfulDeletions / totalMeaningfulLines;
    if (deletionRatio > 0.6) {
      score -= 0.1;
    }
  }

  // Many commits per PR (iterative work)
  if (pr.commitCount >= 8) {
    score -= 0.1;
  } else if (pr.commitCount >= 5) {
    score -= 0.05;
  }

  return Math.max(0.1, Math.min(0.95, score));
}
