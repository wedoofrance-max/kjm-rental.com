const { PrismaClient } = require('./lib/generated/prisma/client');

async function testDb() {
  const prisma = new PrismaClient();

  try {
    console.log('Testing database connection...');

    // Test 1: Simple count
    const vehicleCount = await prisma.vehicle.count();
    console.log(`✓ Vehicle count: ${vehicleCount}`);

    // Test 2: Find all vehicles with timeout simulation
    console.log('Fetching vehicles...');
    const startTime = Date.now();

    const vehicles = await Promise.race([
      prisma.vehicle.findMany({
        select: { brand: true, model: true, dailyRate: true, weeklyRate: true, monthlyRate: true, visible: true }
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout after 5 seconds')), 5000)
      )
    ]);

    const elapsed = Date.now() - startTime;
    console.log(`✓ Found ${vehicles.length} vehicles in ${elapsed}ms`);
    console.log('Sample:', vehicles.slice(0, 2));

  } catch (err) {
    console.error('✗ Database error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDb();
