import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';

function isAdmin(request: NextRequest) {
  return request.cookies.get('kjm_admin')?.value === process.env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('id');

    if (conversationId) {
      // Get specific conversation
      const conversation = await prisma.aIConversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });

      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }

      return NextResponse.json(conversation);
    }

    // List all conversations
    const conversations = await prisma.aIConversation.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: { take: 1, orderBy: { createdAt: 'desc' } }, // Last message
      },
      take: 50,
    });

    return NextResponse.json(conversations);
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('id');

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    await prisma.aIConversation.delete({
      where: { id: conversationId },
    });

    return NextResponse.json({ success: true, message: 'Conversation deleted' });
  } catch (error: any) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation', details: error.message },
      { status: 500 }
    );
  }
}
