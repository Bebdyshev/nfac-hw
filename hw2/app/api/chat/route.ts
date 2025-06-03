import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Request body:', body);
    
    const { messages } = body;
    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages format:', messages);
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
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
    
    console.log('Processing message:', lastUserMessage.content);

    try {
      const completion = await groq.chat.completions.create({
        messages: messages,
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

      return NextResponse.json({
        response: response,
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
