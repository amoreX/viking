import BadgePill from "@/components/ui/badge-pill";

interface Badge {
  emoji: string;
  name: string;
  description: string;
  awardedAt: string;
}

interface BadgeShelfProps {
  badges: Badge[];
}

export default function BadgeShelf({ badges }: BadgeShelfProps) {
  if (badges.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface px-4 py-8 text-center">
        <p className="text-sm text-muted">No badges earned yet.</p>
        <p className="mt-1 text-xs text-dim">
          Badges are awarded for streaks, high output, and shipping volume.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <BadgePill
          key={badge.name}
          emoji={badge.emoji}
          name={badge.name}
          description={badge.description}
        />
      ))}
    </div>
  );
}
