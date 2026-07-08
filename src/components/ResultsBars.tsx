type OptionResult = {
  id: string;
  votes: number;
  percentage: number;
  asset: { name: string; ticker: string | null };
};

export function ResultsBars({
  options,
  myOptionId,
  totalVotes,
}: {
  options: OptionResult[];
  myOptionId?: string | null;
  totalVotes: number;
}) {
  const sorted = [...options].sort((a, b) => b.votes - a.votes);
  const maxPercentage = Math.max(...sorted.map((o) => o.percentage), 1);

  return (
    <div className="flex flex-col gap-4" role="table" aria-label="Abstimmungsergebnisse">
      {sorted.map((option, index) => {
        const isMine = option.id === myOptionId;
        const isLeader = index === 0 && option.votes > 0;
        // Emphasize the reader's own vote; for visitors without one, the leader.
        const emphasized = isMine || (isLeader && !myOptionId);
        const barWidth = `${(option.percentage / maxPercentage) * 100}%`;
        return (
          <div key={option.id} role="row" className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm" role="cell">
              <span className="flex flex-wrap items-baseline gap-x-2 font-medium">
                {option.asset.name}
                {option.asset.ticker && (
                  <span className="font-mono text-xs" style={{ color: "var(--faint)" }}>
                    {option.asset.ticker}
                  </span>
                )}
                {isMine && (
                  <span className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
                    ✓ deine Stimme
                  </span>
                )}
              </span>
              <span
                className="shrink-0 tabular-nums text-sm"
                style={{ color: isLeader ? "var(--foreground)" : "var(--muted)" }}
              >
                <span className="font-semibold">{option.percentage}%</span>
                <span style={{ color: "var(--faint)" }}>
                  {" "}· {option.votes} {option.votes === 1 ? "Stimme" : "Stimmen"}
                </span>
              </span>
            </div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full"
              style={{ background: "var(--border)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: barWidth,
                  background: emphasized ? "var(--accent)" : "var(--faint)",
                  opacity: emphasized ? 1 : 0.6,
                }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-xs" style={{ color: "var(--faint)" }}>
        {totalVotes} {totalVotes === 1 ? "Stimme" : "Stimmen"} insgesamt
      </p>
    </div>
  );
}
