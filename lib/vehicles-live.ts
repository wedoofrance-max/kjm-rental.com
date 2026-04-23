import { prisma } from './db';
import { vehicles as staticVehicles, type Vehicle } from './vehicles';

export type LiveVehicle = Vehicle & { visible: boolean };

async function buildLiveVehicles(): Promise<LiveVehicle[]> {
  const dbRows = await prisma.vehicle.findMany({
    select: { brand: true, model: true, dailyRate: true, weeklyRate: true, monthlyRate: true, visible: true },
  });

  const dbMap = new Map(dbRows.map((r) => [`${r.brand}|${r.model}`, r]));

  return staticVehicles.map((v) => {
    const db = dbMap.get(`${v.brand}|${v.model}`);
    if (!db) return { ...v, visible: true };
    return {
      ...v,
      daily: db.dailyRate,
      weekly: db.weeklyRate,
      monthly: db.monthlyRate,
      visible: db.visible,
    };
  });
}

export async function getPublicVehicles(): Promise<Vehicle[]> {
  const all = await buildLiveVehicles();
  return all.filter((v) => v.visible);
}

export async function getPublicVehicle(slug: string): Promise<Vehicle | null> {
  const all = await buildLiveVehicles();
  const v = all.find((x) => x.slug === slug);
  if (!v || !v.visible) return null;
  return v;
}
