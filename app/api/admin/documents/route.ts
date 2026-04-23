import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

function isAdmin(request: NextRequest) {
  return request.cookies.get('kjm_admin')?.value === process.env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // business_permit, contract_template, certification

  try {
    const documents = await prisma.document.findMany({
      where: type ? { type } : undefined,
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json(documents);
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { type, title, filePath, fileName, fileSize, expiresAt } = body;

    if (!type || !title || !filePath || !fileName) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, filePath, fileName' },
        { status: 400 }
      );
    }

    const document = await prisma.document.create({
      data: {
        type,
        title,
        filePath,
        fileName,
        fileSize: fileSize || 0,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Document created successfully',
      document,
    });
  } catch (error: any) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing document ID' }, { status: 400 });
    }

    const document = await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
      document,
    });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document', details: error.message },
      { status: 500 }
    );
  }
}
