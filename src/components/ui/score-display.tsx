"use client";

interface ScoreDisplayProps {
  score: number;
  label?: string;
}

export default function ScoreDisplay({ score, label }: ScoreDisplayProps) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono text-4xl font-semibold tabular-nums text-accent">
        {score.toLocaleString()}
      </span>
      {label && (
        <span className="mt-1.5 text-xs font-medium text-muted uppercase">
          {label}
        </span>
      )}
    </div>
  );
}
