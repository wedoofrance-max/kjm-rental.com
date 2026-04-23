import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

function isAdmin(request: NextRequest) {
  return request.cookies.get('kjm_admin')?.value === process.env.ADMIN_PASSWORD;
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    const expiresAt = formData.get('expiresAt') as string | null;

    if (!file || !type || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: file, type, title' },
        { status: 400 }
      );
    }

    // Create documents directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'documents');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    // Generate filename
    const timestamp = Date.now();
    const fileName = `${type}_${timestamp}_${file.name}`;
    const filePath = `/documents/${fileName}`;
    const fullPath = join(uploadDir, fileName);

    // Read file data
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write file to public directory
    await writeFile(fullPath, buffer);

    // Create document record in database
    const document = await prisma.document.create({
      data: {
        type,
        title,
        filePath,
        fileName: file.name,
        fileSize: buffer.length,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      document,
    });
  } catch (error: any) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document', details: error.message },
      { status: 500 }
    );
  }
}
