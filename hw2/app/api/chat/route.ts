import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Store conversation history in memory
// Map of chatId -> array of messages
const conversationHistory = new Map<string, Array<{ role: string, content: string }>>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Request body:', body);
    
    const { messages, chatId = 'default' } = body;
    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages format:', messages);
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    // Get or initialize conversation history for this chat
    if (!conversationHistory.has(chatId)) {
      // Get the system message (first message) and store it
      const systemMessage = messages.find(msg => msg.role === 'system');
      conversationHistory.set(chatId, systemMessage ? [systemMessage] : []);
    }

    // Get the last user message
    const lastUserMessage = messages.findLast(msg => msg.role === 'user');
    if (!lastUserMessage || !lastUserMessage.content) {
      console.error('No user message found:', messages);
      return NextResponse.json(
        { error: 'No user message found' },
        { status: 400 }
      );
    }
    
    // Get current history and add the new user message
    const currentHistory = conversationHistory.get(chatId) || [];
    currentHistory.push(lastUserMessage);
    
    // Keep only the last 10 messages to avoid token limits
    const historyToSend = currentHistory.slice(-10);
    
    console.log('Processing message with history:', historyToSend);

    try {
      const completion = await groq.chat.completions.create({
        messages: historyToSend,
        model: 'llama3-70b-8192',
        temperature: 0.7,
        max_tokens: 1024,
      });

      const response = completion.choices[0]?.message?.content;
      console.log('GROQ API Response:', response);

      if (!response) {
        console.error('No response from GROQ API');
        return NextResponse.json(
          { error: 'No response from AI' },
          { status: 500 }
        );
      }

      // Store the assistant's response in the history
      currentHistory.push({
        role: 'assistant',
        content: response
      });
      conversationHistory.set(chatId, currentHistory);

      // Return in format compatible with Vercel AI SDK
      return NextResponse.json({
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        // Also include the original response format for backward compatibility
        response: response
      });
    } catch (groqError) {
      console.error('GROQ API error:', groqError);
      return NextResponse.json(
        { error: 'Failed to get response from AI' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    );
  }
}
