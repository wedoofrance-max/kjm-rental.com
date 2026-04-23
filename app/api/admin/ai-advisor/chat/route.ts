import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';

function isAdmin(request: NextRequest) {
  return request.cookies.get('kjm_admin')?.value === process.env.ADMIN_PASSWORD;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  business_strategy: `You are a strategic business advisor for KJM Motors, a scooter rental company in Cebu, Philippines.
Provide expert advice on:
- Pricing strategies and revenue optimization
- Business scaling and growth
- Operational efficiency
- Customer retention strategies
- Competitive positioning in the scooter rental market

Be practical, data-driven, and specific to the scooter rental/mobility industry.`,

  social_media: `You are a social media marketing expert for KJM Motors scooter rental.
Provide guidance on:
- Instagram, Facebook, TikTok content strategies
- Engaging captions and hashtags for scooter rentals
- Community building strategies
- User-generated content campaigns
- Influencer partnerships in travel/mobility space
- Seasonal promotions and campaigns

Give specific, actionable social media strategies tailored to the scooter rental niche.`,

  marketing: `You are a marketing strategist for KJM Motors scooter rental company.
Advise on:
- Customer acquisition channels and tactics
- Website optimization for conversions
- Email marketing campaigns
- Promotional offers and campaigns
- Brand positioning and messaging
- Market research and competitor analysis
- Marketing budget allocation

Provide specific tactics and examples relevant to the scooter rental industry.`,

  operations: `You are an operations consultant for KJM Motors scooter rental.
Help with:
- Fleet management optimization
- Maintenance scheduling and cost reduction
- Customer service improvement
- Booking system optimization
- Rental agreement best practices
- Insurance and liability management
- Supply chain and procurement

Give practical operational improvements.`,

  general: `You are a business consultant for KJM Motors, a scooter rental company in Cebu, Philippines.
Provide helpful advice on any aspect of running their business - marketing, operations, finance, customer service, or growth strategies.
Be specific, practical, and focused on the scooter rental industry.`,
};

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { conversationId, message, category } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.aIConversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });

      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
    } else {
      // Create new conversation
      const categ = category || 'general';
      conversation = await prisma.aIConversation.create({
        data: {
          category: categ,
          title: message.substring(0, 50) + '...',
        },
        include: { messages: true },
      });
    }

    // Save user message
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
      },
    });

    // Build conversation history for AI
    const messagesForAI = await prisma.aIMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
    });

    // Call OpenAI API
    const systemPrompt = SYSTEM_PROMPTS[conversation.category] || SYSTEM_PROMPTS.general;

    const openaiMessages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...messagesForAI.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: openaiMessages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to get AI response', details: error.error?.message },
        { status: 500 }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content;

    if (!assistantMessage) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    // Save assistant response
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: assistantMessage,
        tokensUsed: data.usage?.total_tokens || 0,
      },
    });

    // Fetch updated conversation
    const updatedConversation = await prisma.aIConversation.findUnique({
      where: { id: conversation.id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    return NextResponse.json({
      success: true,
      conversation: updatedConversation,
      message: assistantMessage,
    });
  } catch (error: any) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat', details: error.message },
      { status: 500 }
    );
  }
}
