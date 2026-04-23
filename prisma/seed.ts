import { PrismaClient } from '../lib/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'prisma/dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter } as any);

const vehicles = [
  { brand: 'Honda', model: 'Beat 110', engine: '110cc', type: 'Automatic', dailyRate: 499, weeklyRate: 2500, monthlyRate: 8500, topCase: false, description: 'The lightest and most affordable scooter in our fleet. Perfect for navigating Cebu City traffic.' },
  { brand: 'Honda', model: 'Click V3 125', engine: '125cc', type: 'Automatic', dailyRate: 599, weeklyRate: 3500, monthlyRate: 10000, topCase: false, description: 'Our most popular model. Perfect balance between city agility and highway comfort.' },
  { brand: 'Mio', model: 'Gravis 125', engine: '125cc', type: 'Manual', dailyRate: 600, weeklyRate: 3500, monthlyRate: 10000, topCase: false, description: 'A sporty manual scooter for riders who prefer more engine control.' },
  { brand: 'Honda', model: 'Click 160', engine: '160cc', type: 'Automatic', dailyRate: 700, weeklyRate: 4000, monthlyRate: 12500, topCase: false, description: 'More power for those who want to venture further on Cebu highways.' },
  { brand: 'Yamaha', model: 'Aerox V2 155', engine: '155cc', type: 'Automatic', dailyRate: 750, weeklyRate: 4500, monthlyRate: 13000, topCase: true, description: 'Sport-styled and fast. Comes with a top case for extra luggage.' },
  { brand: 'Honda', model: 'PCX 160', engine: '160cc', type: 'Automatic', dailyRate: 800, weeklyRate: 5000, monthlyRate: 15000, topCase: true, description: 'Premium comfort for longer journeys. Large fuel tank means riding all day without stops.' },
  { brand: 'Yamaha', model: 'Nmax V3 155', engine: '155cc', type: 'Automatic', dailyRate: 850, weeklyRate: 5000, monthlyRate: 15000, topCase: false, description: 'The premium touring choice. Advanced tech and wide seat for multi-day tours.' },
  { brand: 'Honda', model: 'ADV 160', engine: '160cc', type: 'Manual', dailyRate: 900, weeklyRate: 6000, monthlyRate: 18000, topCase: false, description: 'Built for adventure. Tackles both city streets and rough mountain roads.' },
];

async function main() {
  console.log('Seeding database...');

  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    const vehicle = await prisma.vehicle.upsert({
      where: { id: `vehicle-${i + 1}` },
      update: v,
      create: { id: `vehicle-${i + 1}`, ...v },
    });

    for (let j = 1; j <= 4; j++) {
      const unitNumber = `KJM-${String((i * 4 + j)).padStart(3, '0')}`;
      const licensePlate = `PL-${String((i * 4 + j)).padStart(4, '0')}`;
      await prisma.fleetUnit.upsert({
        where: { vehicleId_unitNumber: { vehicleId: vehicle.id, unitNumber } },
        update: {},
        create: { vehicleId: vehicle.id, unitNumber, licensePlate, status: 'available', currentKilometers: 0 },
      });
    }

    console.log(`✓ ${vehicle.brand} ${vehicle.model} + 4 units`);
  }

  console.log('Done.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
