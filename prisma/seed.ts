import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const assets = [
    {
      name: "MSCI World ETF",
      ticker: "IWDA",
      type: "ETF" as const,
      description: "Breit gestreuter ETF auf Industrieländer-Aktien.",
    },
    {
      name: "S&P 500 ETF",
      ticker: "VUSA",
      type: "ETF" as const,
      description: "ETF auf die 500 größten US-Unternehmen.",
    },
    {
      name: "Apple Inc.",
      ticker: "AAPL",
      type: "STOCK" as const,
      description: "Einzelaktie von Apple.",
    },
    {
      name: "Bitcoin",
      ticker: "BTC",
      type: "CRYPTO" as const,
      description: "Größte Kryptowährung nach Marktkapitalisierung.",
    },
    {
      name: "Ethereum",
      ticker: "ETH",
      type: "CRYPTO" as const,
      description: "Zweitgrößte Kryptowährung, Basis für Smart Contracts.",
    },
  ];

  for (const asset of assets) {
    await prisma.asset.upsert({
      where: { id: asset.ticker ?? asset.name },
      update: {},
      create: { id: asset.ticker ?? asset.name, ...asset },
    });
  }

  const allAssets = await prisma.asset.findMany();

  const round = await prisma.votingRound.upsert({
    where: { id: "demo-round" },
    update: {},
    create: {
      id: "demo-round",
      title: "In welches Asset soll als Nächstes investiert werden?",
      description:
        "Stimmt ab, welches Asset aus der Liste als Nächstes ins Portfolio aufgenommen werden soll.",
      status: "OPEN",
      startsAt: new Date(),
      options: {
        create: allAssets.map((asset) => ({ assetId: asset.id })),
      },
    },
  });

  console.log("Seeded assets and demo round:", round.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
