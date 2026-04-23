# AI Advisor Feature Setup Guide

## Overview
The AI Advisor is a GPT-powered business consultant for KJM Motors. It provides expert advice on:
- Business strategy and scaling
- Social media marketing
- Marketing campaigns and optimization
- Operational efficiency
- General business questions

## Setup Instructions

### 1. Get OpenAI API Key

1. Go to [OpenAI API Platform](https://platform.openai.com)
2. Sign up or log in
3. Navigate to "API Keys" section
4. Create a new API key
5. Copy the key (you won't see it again)

### 2. Set Environment Variable

Add the key to your `.env.local` file:

```bash
OPENAI_API_KEY=sk_test_xxxxxxxxxxxxxxxxxx
```

Or set it in your deployment platform (Vercel, Railway, etc.):
- Go to Environment Variables
- Add: `OPENAI_API_KEY=sk_test_...`

### 3. Test the Feature

1. Start the dev server: `npm run dev`
2. Go to Admin Dashboard → "AI Advisor" tab
3. Choose a category (Business Strategy, Social Media, etc.)
4. Type a question and send
5. Wait for the AI response (first response takes a few seconds)

## Features

### Conversation Categories

| Category | Use Case | Type of Advice |
|----------|----------|----------------|
| **Business Strategy** | Pricing, scaling, retention | Strategic growth guidance |
| **Social Media** | Instagram, TikTok, Facebook | Content ideas, hashtags, campaigns |
| **Marketing** | Customer acquisition, SEO | Customer-focused marketing strategies |
| **Operations** | Fleet, maintenance, booking | Operational efficiency improvements |
| **General** | Any business question | General business consulting |

### How It Works

1. **Create Conversation**: Click a category to start new conversation
2. **Ask Questions**: Type your question in the input field
3. **Get Advice**: AI responds with specific, actionable advice for scooter rental business
4. **Continue Discussion**: Follow-up questions use full conversation history
5. **Save Conversations**: All conversations automatically saved in database
6. **Review Later**: Access previous conversations from the left sidebar

### Example Questions

#### Business Strategy
- "How can we increase our average booking value?"
- "What pricing strategy works best for scooter rentals?"
- "How do we compete with other rental companies?"

#### Social Media
- "What content should we post on Instagram?"
- "Give me 10 hashtags for a scooter rental TikTok video"
- "How do we build a community of followers?"

#### Marketing
- "How can we attract more customers to our website?"
- "What's our best customer acquisition channel?"
- "How should we structure our email marketing?"

#### Operations
- "How should we handle maintenance scheduling?"
- "What metrics should we track for fleet utilization?"
- "How do we reduce booking cancellations?"

## Database Storage

All conversations are stored in Prisma models:
- `AIConversation` - Stores conversation metadata and categories
- `AIMessage` - Stores individual messages (user + assistant)

Conversations are automatically:
- ✅ Saved to database
- ✅ Retrievable from sidebar
- ✅ Deletable if needed
- ✅ Organized by category

## API Endpoints

### Send Message
```
POST /api/admin/ai-advisor/chat
Body: {
  "conversationId": "conv_123", // optional, creates new if not provided
  "message": "Your question here",
  "category": "business_strategy" // required if conversationId not provided
}
```

### Get Conversations
```
GET /api/admin/ai-advisor/conversations
GET /api/admin/ai-advisor/conversations?id=conv_123 // specific conversation
```

### Delete Conversation
```
DELETE /api/admin/ai-advisor/conversations?id=conv_123
```

## Troubleshooting

### "Failed to get AI response"
- Check your OPENAI_API_KEY is set correctly
- Verify you have API credits available
- Check OpenAI API status page

### "Rate limited"
- You're sending too many requests
- Wait a few seconds between messages
- Check your API usage on OpenAI dashboard

### "Empty response from AI"
- Network issue - check connection
- Try again in a few seconds
- Verify API key is valid

## Cost Estimate

- GPT-3.5 Turbo: ~$0.0015 per 1K tokens
- Average conversation response: 500 tokens ≈ $0.0007
- 100 conversations/month ≈ $0.07

Cost varies based on message length. Check [OpenAI Pricing](https://openai.com/pricing) for latest rates.

## Security Notes

- ✅ Only admins can access AI Advisor
- ✅ Conversations stored in secure database
- ✅ API key never exposed to frontend
- ✅ All requests go through secure API route
- ✅ No conversation data sent outside your server (except to OpenAI API)

## UI Features

- **Professional Dark/Light Mode**: Follows dashboard theme
- **Icon-Based Design**: No emojis, Iconify icons only
- **Conversation History**: Left sidebar shows all conversations
- **Quick Categories**: Easy one-click conversation starters
- **Real-time Typing**: See responses appear in real-time
- **Mobile Responsive**: Works on tablet and mobile

## Future Enhancements

- [ ] Conversation search/filtering
- [ ] Export conversations as PDF
- [ ] Conversation templates (pre-written prompts)
- [ ] Team collaboration (multiple users)
- [ ] Custom AI personas for different roles
- [ ] Integration with analytics (give AI your booking data for analysis)

---

**Questions?** Check the OpenAI documentation or reach out for support.
