// lib/linkService.ts
import { prisma } from "./prisma";

export async function getLinkByCode(code: string) {
  return prisma.link.findUnique({
    where: { code },
  });
}

export async function createLink(data: { code: string; targetUrl: string }) {
  return prisma.link.create({
    data,
  });
}

const useInsensitiveMode = !process.env.DATABASE_URL?.startsWith("file:");

const buildStringFilter = (value: string) =>
  useInsensitiveMode
    ? { contains: value, mode: "insensitive" as const }
    : { contains: value };

export async function listLinks(search?: string) {
  return prisma.link.findMany({
    where: search
      ? {
          OR: [
            { code: buildStringFilter(search) },
            { targetUrl: buildStringFilter(search) },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteLink(code: string) {
  return prisma.link.delete({
    where: { code },
  });
}

export async function incrementClicks(code: string) {
  return prisma.link.update({
    where: { code },
    data: {
      clicks: { increment: 1 },
      lastClicked: new Date(),
    },
  });
}
