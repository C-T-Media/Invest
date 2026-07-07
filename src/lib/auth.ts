import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendLoginCodeEmail } from "@/lib/mailer";
import { createSession } from "@/lib/session";

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute between code requests
const MAX_ATTEMPTS = 5;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function requestLoginCode(rawEmail: string) {
  const email = rawEmail.trim().toLowerCase();

  const recent = await prisma.verificationCode.findFirst({
    where: { email, createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_MS) } },
    orderBy: { createdAt: "desc" },
  });
  if (recent) {
    throw new Error("Bitte warte kurz, bevor du einen neuen Code anforderst.");
  }

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);

  await prisma.verificationCode.create({
    data: {
      email,
      codeHash,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });

  await sendLoginCodeEmail(email, code);
}

export async function verifyLoginCode(rawEmail: string, code: string) {
  const email = rawEmail.trim().toLowerCase();

  const verification = await prisma.verificationCode.findFirst({
    where: { email, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!verification) {
    throw new Error("Kein gültiger Code gefunden. Bitte fordere einen neuen an.");
  }

  if (verification.expiresAt < new Date()) {
    throw new Error("Der Code ist abgelaufen. Bitte fordere einen neuen an.");
  }

  if (verification.attempts >= MAX_ATTEMPTS) {
    throw new Error("Zu viele Versuche. Bitte fordere einen neuen Code an.");
  }

  const isMatch = await bcrypt.compare(code, verification.codeHash);

  if (!isMatch) {
    await prisma.verificationCode.update({
      where: { id: verification.id },
      data: { attempts: { increment: 1 } },
    });
    throw new Error("Der Code ist ungültig.");
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  await prisma.verificationCode.update({
    where: { id: verification.id },
    data: { consumedAt: new Date(), userId: user.id },
  });

  await createSession(user.id);

  return user;
}
