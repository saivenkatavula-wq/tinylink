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

export async function listLinks() {
  return prisma.link.findMany({
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
