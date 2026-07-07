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
    <div className="flex flex-col gap-3" role="table" aria-label="Abstimmungsergebnisse">
      {sorted.map((option) => {
        const isMine = option.id === myOptionId;
        const barWidth = `${(option.percentage / maxPercentage) * 100}%`;
        return (
          <div key={option.id} role="row" className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between text-sm" role="cell">
              <span style={{ color: "var(--foreground)" }}>
                {option.asset.name}
                {option.asset.ticker ? (
                  <span style={{ color: "var(--muted)" }}> ({option.asset.ticker})</span>
                ) : null}
                {isMine && (
                  <span
                    className="ml-2 text-xs font-medium"
                    style={{ color: "var(--accent)" }}
                  >
                    deine Stimme
                  </span>
                )}
              </span>
              <span style={{ color: "var(--muted)" }}>
                {option.votes} {option.votes === 1 ? "Stimme" : "Stimmen"} · {option.percentage}%
              </span>
            </div>
            <div
              className="h-3 rounded-full w-full overflow-hidden"
              style={{ background: "var(--border)" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: barWidth,
                  background: isMine ? "var(--accent)" : "var(--muted)",
                  opacity: isMine ? 1 : 0.55,
                }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
        {totalVotes} {totalVotes === 1 ? "Stimme" : "Stimmen"} insgesamt
      </p>
    </div>
  );
}
