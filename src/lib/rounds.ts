import { prisma } from "@/lib/prisma";

export async function getRoundWithResults(roundId: string, userId?: string) {
  const round = await prisma.votingRound.findUnique({
    where: { id: roundId },
    include: {
      options: {
        include: {
          asset: true,
          _count: { select: { votes: true } },
        },
      },
    },
  });

  if (!round) return null;

  const totalVotes = round.options.reduce((sum, option) => sum + option._count.votes, 0);

  const myVote = userId
    ? await prisma.vote.findUnique({
        where: { roundId_userId: { roundId, userId } },
        select: { optionId: true },
      })
    : null;

  return {
    id: round.id,
    title: round.title,
    description: round.description,
    status: round.status,
    startsAt: round.startsAt,
    endsAt: round.endsAt,
    totalVotes,
    myOptionId: myVote?.optionId ?? null,
    options: round.options.map((option) => ({
      id: option.id,
      asset: option.asset,
      votes: option._count.votes,
      percentage: totalVotes > 0 ? Math.round((option._count.votes / totalVotes) * 1000) / 10 : 0,
    })),
  };
}
