interface BadgePillProps {
  emoji: string;
  name: string;
  description?: string;
}

export default function BadgePill({ emoji, name, description }: BadgePillProps) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-muted"
      title={description}
    >
      <span>{emoji}</span>
      <span>{name}</span>
    </span>
  );
}
