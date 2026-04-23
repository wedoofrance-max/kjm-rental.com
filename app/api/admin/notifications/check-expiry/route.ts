import { NextRequest, NextResponse } from 'next/server';
import { checkAndSendDocumentExpiryAlerts } from '@/lib/email-service';

function isAuthed(req: NextRequest): boolean {
  const adminCookie = req.cookies.get('kjm_admin')?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || 'kjm2026';
  return adminCookie === adminPassword;
}

// POST to trigger document expiry email checks
export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await checkAndSendDocumentExpiryAlerts();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error checking expiry alerts:', err);
    return NextResponse.json(
      { error: 'Failed to check expiry alerts', details: err.message },
      { status: 500 }
    );
  }
}
