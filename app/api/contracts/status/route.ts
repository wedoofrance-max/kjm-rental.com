import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

/**
 * GET /api/contracts/status?reference=KJM-xxx
 * Check if a contract has been signed
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference');

  if (!reference) {
    return NextResponse.json({ error: 'reference required' }, { status: 400 });
  }

  try {
    // Get booking status
    const booking = await prisma.booking.findUnique({
      where: { reference },
      include: { fleetUnit: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Get contract status
    const contract = await prisma.contractSigning.findUnique({
      where: { bookingReference: reference },
    });

    return NextResponse.json({
      success: true,
      reference,
      bookingStatus: booking.status,
      contractSigned: !!contract,
      contractStatus: contract?.status || null,
      signedAt: contract?.signedAt || null,
      customerName: contract?.customerName || null,
      idDocumentPath: contract?.idDocumentPath || null,
      passportDocumentPath: contract?.passportDocumentPath || null,
      signaturePath: contract?.signaturePath || null,
      fleetUnit: {
        unitNumber: booking.fleetUnit?.unitNumber || 'Not assigned',
        licensePlate: booking.fleetUnit?.licensePlate || 'Not assigned',
      },
      canConfirm: booking.status !== 'confirmed' && !!contract, // Can confirm if not already confirmed and contract is signed
    });
  } catch (error: any) {
    console.error('Error checking contract status:', error);
    return NextResponse.json(
      { error: 'Failed to check contract status', details: error.message },
      { status: 500 }
    );
  }
}
